from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, generics, permissions, parsers
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from apps.accounts.permissions import IsProductionAdmin, is_production_admin_user
from .models import Expense, Earning, BudgetAllocation
from .serializers import ExpenseSerializer, EarningSerializer, BudgetAllocationSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]

    def get_queryset(self):
        qs = Expense.objects.select_related("project", "submitted_by")
        user = self.request.user
        if user.role == "crew":
            qs = qs.filter(submitted_by=user)

        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)

        mine = self.request.query_params.get("mine")
        if mine in ("1", "true", "True"):
            qs = qs.filter(submitted_by=user)

        return qs

    def perform_create(self, serializer):
        user = self.request.user
        project = serializer.validated_data.get("project")

        if user.role == "crew":
            from apps.crew.models import CrewAssignment

            is_assigned = CrewAssignment.objects.filter(
                crew__user=user,
                status="accepted",
                shoot__project_id=project.id,
            ).exists()
            if not is_assigned:
                raise ValidationError({"project": "You can only submit expenses for your assigned projects."})

            allowed_categories = {
                "props",
                "equipment_rental",
                "travel",
                "gas",
                "catering",
                "miscellaneous",
            }
            category = serializer.validated_data.get("category")
            if category not in allowed_categories:
                raise ValidationError({"category": "Crew receipts must use reimbursement categories."})

            serializer.save(submitted_by=user, reimbursed=False)
            return

        serializer.save(submitted_by=serializer.validated_data.get("submitted_by") or user)

    def perform_update(self, serializer):
        prev = self.get_object()
        user = self.request.user

        reimbursement_fields = {"reimbursed", "reimbursement_proof", "reimbursed_at"}
        is_reimbursement_update = any(
            key in serializer.validated_data or key in self.request.data
            for key in reimbursement_fields
        )

        if is_reimbursement_update and not is_production_admin_user(user):
            raise ValidationError({"detail": "Only production admins can update reimbursement status."})

        reimbursed = serializer.validated_data.get("reimbursed", prev.reimbursed)

        if reimbursed and not prev.reimbursed:
            serializer.save(reimbursed_at=timezone.now())
            return

        if not reimbursed and prev.reimbursed:
            serializer.save(reimbursed_at=None)
            return

        serializer.save()


class EarningViewSet(viewsets.ModelViewSet):
    serializer_class = EarningSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Earning.objects.select_related("project", "user")
        user = self.request.user
        if user.role in ("talent", "crew"):
            qs = qs.filter(user=user)
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        return qs


class BudgetAllocationViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetAllocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = BudgetAllocation.objects.select_related("project")
        project = self.request.query_params.get("project")
        if project:
            qs = qs.filter(project_id=project)
        return qs


class ProjectFinancialsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, project_id):
        total_expenses = (
            Expense.objects.filter(project_id=project_id).aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )
        total_earnings = (
            Earning.objects.filter(project_id=project_id, status="paid").aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )
        from apps.projects.models import Project

        try:
            project = Project.objects.get(id=project_id)
            budget = float(project.budget)
        except Project.DoesNotExist:
            budget = 0

        return Response(
            {
                "budget": budget,
                "total_expenses": float(total_expenses),
                "total_earnings": float(total_earnings),
                "remaining": budget - float(total_expenses),
            }
        )


class RevenueAnalysisView(generics.GenericAPIView):
    """Aggregate revenue, expenses breakdown, and profit per project grouped by client."""
    permission_classes = [IsProductionAdmin]

    def get(self, request):
        from apps.payments.models import Invoice
        from apps.projects.models import Project

        # Bulk aggregate expenses by project + category (avoids N+1)
        expense_rows = (
            Expense.objects
            .values("project_id", "category")
            .annotate(total=Sum("amount"))
        )
        expense_map = {}
        for row in expense_rows:
            pid = row["project_id"]
            expense_map.setdefault(pid, {})[row["category"]] = float(row["total"])

        # Bulk aggregate paid invoice revenue by project
        revenue_rows = (
            Invoice.objects
            .filter(status="paid")
            .values("project_id")
            .annotate(total=Sum("total"))
        )
        revenue_map = {row["project_id"]: float(row["total"]) for row in revenue_rows}

        # Fetch all projects
        projects = list(Project.objects.select_related("client"))

        # Build per-project data
        project_data = []
        for project in projects:
            pid = project.id
            rev = revenue_map.get(pid, 0)
            exp = expense_map.get(pid, {})

            talent_cost = exp.get("talent", 0)
            crew_cost = exp.get("crew", 0)
            equipment_cost = exp.get("equipment", 0)
            location_cost = exp.get("location", 0)
            catering_cost = exp.get("catering", 0)
            travel_cost = exp.get("travel", 0)
            gas_cost = exp.get("gas", 0)
            post_production_cost = exp.get("post_production", 0)
            other_cost = (
                exp.get("other", 0)
                + exp.get("props", 0)
                + exp.get("equipment_rental", 0)
                + exp.get("miscellaneous", 0)
            )
            total_exp = (
                talent_cost + crew_cost + equipment_cost + location_cost
                + catering_cost + travel_cost + gas_cost + post_production_cost + other_cost
            )
            profit = rev - total_exp

            project_data.append({
                "id": pid,
                "name": project.name,
                "status": project.status,
                "client_id": project.client_id,
                "client_name": project.client.get_full_name() if project.client else "No Client",
                "revenue": rev,
                "talent_cost": talent_cost,
                "crew_cost": crew_cost,
                "equipment_cost": equipment_cost,
                "location_cost": location_cost,
                "catering_cost": catering_cost,
                "travel_cost": travel_cost,
                "gas_cost": gas_cost,
                "post_production_cost": post_production_cost,
                "other_cost": other_cost,
                "total_expenses": total_exp,
                "profit": profit,
            })

        # Find most profitable project
        most_profitable_id = None
        if project_data:
            most_profitable = max(project_data, key=lambda x: x["profit"])
            if most_profitable["profit"] > 0:
                most_profitable_id = most_profitable["id"]

        for pd in project_data:
            pd["most_profitable"] = pd["id"] == most_profitable_id

        # Group by client, sort by total revenue desc
        client_map = {}
        for pd in project_data:
            cn = pd["client_name"]
            if cn not in client_map:
                client_map[cn] = {
                    "client_id": pd["client_id"],
                    "client_name": cn,
                    "total_revenue": 0,
                    "total_expenses": 0,
                    "total_profit": 0,
                    "projects": [],
                }
            client_map[cn]["total_revenue"] += pd["revenue"]
            client_map[cn]["total_expenses"] += pd["total_expenses"]
            client_map[cn]["total_profit"] += pd["profit"]
            client_map[cn]["projects"].append(
                {k: v for k, v in pd.items() if k not in ("client_id", "client_name")}
            )

        clients = sorted(client_map.values(), key=lambda x: -x["total_revenue"])
        for c in clients:
            c["projects"].sort(key=lambda x: -x["revenue"])

        total_revenue = sum(c["total_revenue"] for c in clients)
        total_expenses = sum(c["total_expenses"] for c in clients)

        return Response({
            "clients": clients,
            "most_profitable_project_id": most_profitable_id,
            "total_revenue": total_revenue,
            "total_expenses": total_expenses,
            "total_profit": total_revenue - total_expenses,
        })
