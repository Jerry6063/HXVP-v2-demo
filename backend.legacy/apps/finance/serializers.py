from rest_framework import serializers
from .models import Expense, Earning, BudgetAllocation


class ExpenseSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    receipt_url = serializers.SerializerMethodField()
    reimbursement_proof_url = serializers.SerializerMethodField()
    submitted_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = "__all__"

    def get_receipt_url(self, obj):
        if obj.receipt:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.receipt.url)
            return obj.receipt.url
        return None

    def get_reimbursement_proof_url(self, obj):
        if obj.reimbursement_proof:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.reimbursement_proof.url)
            return obj.reimbursement_proof.url
        return None

    def get_submitted_by_name(self, obj):
        if obj.submitted_by:
            return obj.submitted_by.get_full_name()
        return None


class BudgetAllocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetAllocation
        fields = "__all__"


class EarningSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = Earning
        fields = "__all__"

    def get_user_name(self, obj):
        return obj.user.get_full_name()
