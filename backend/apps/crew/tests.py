from datetime import date, time
from decimal import Decimal

from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.crew.models import CrewAssignment, CrewPayment, CrewProfile, CrewTimeLog
from apps.finance.models import Expense
from apps.projects.models import Project, Shoot


class CrewTimeLogApprovalTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.production_user = User.objects.create_user(
            email='producer@example.com',
            password='password123',
            first_name='Prod',
            last_name='User',
            role=User.Role.PRODUCTION_ADMIN,
        )
        self.crew_user = User.objects.create_user(
            email='crew@example.com',
            password='password123',
            first_name='Casey',
            last_name='Crew',
            role=User.Role.CREW,
        )
        self.crew_profile = CrewProfile.objects.create(
            user=self.crew_user,
            crew_role=CrewProfile.CrewRole.PHOTOGRAPHER,
            hourly_rate=Decimal('95.00'),
        )
        self.project = Project.objects.create(name='Crew Shoot')
        self.shoot = Shoot.objects.create(
            project=self.project,
            shoot_date=date(2026, 4, 18),
            call_time=time(8, 30),
            est_wrap_time=time(16, 30),
            location='Backlot',
        )
        self.assignment = CrewAssignment.objects.create(
            shoot=self.shoot,
            crew=self.crew_profile,
            role_on_shoot=CrewProfile.CrewRole.PHOTOGRAPHER,
            status=CrewAssignment.Status.ACCEPTED,
        )
        self.time_log = CrewTimeLog.objects.create(
            crew=self.crew_profile,
            assignment=self.assignment,
            shoot=self.shoot,
            project=self.project,
            date=self.shoot.shoot_date,
            hours_worked=Decimal('9.00'),
            rate_applied=Decimal('95.00'),
            amount=Decimal('855.00'),
            log_status=CrewTimeLog.LogStatus.PENDING,
        )
        self.client.force_authenticate(self.production_user)

    def test_approving_crew_time_log_creates_one_linked_payment_and_expense(self):
        response = self.client.post(f'/api/crew/timelogs/{self.time_log.id}/approve/')

        self.assertEqual(response.status_code, 200)
        self.time_log.refresh_from_db()
        self.assertEqual(self.time_log.log_status, CrewTimeLog.LogStatus.APPROVED)

        payments = CrewPayment.objects.filter(source_time_log=self.time_log)
        self.assertEqual(payments.count(), 1)
        payment = payments.get()
        self.assertEqual(payment.crew, self.crew_profile)
        self.assertEqual(payment.project, self.project)
        self.assertEqual(payment.total_hours, Decimal('9.00'))
        self.assertEqual(payment.total_amount, Decimal('855.00'))

        expenses = Expense.objects.filter(project=self.project, category=Expense.Category.CREW)
        self.assertEqual(expenses.count(), 1)
        self.assertEqual(expenses.get().amount, Decimal('855.00'))

    def test_reapproving_crew_time_log_does_not_duplicate_payment_or_expense(self):
        self.client.post(f'/api/crew/timelogs/{self.time_log.id}/approve/')
        response = self.client.post(f'/api/crew/timelogs/{self.time_log.id}/approve/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(CrewPayment.objects.filter(source_time_log=self.time_log).count(), 1)
        self.assertEqual(
            Expense.objects.filter(project=self.project, category=Expense.Category.CREW).count(),
            1,
        )


class CrewTimeLogCreationTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.crew_user = User.objects.create_user(
            email='crew-create@example.com',
            password='password123',
            first_name='Casey',
            last_name='Creator',
            role=User.Role.CREW,
        )
        self.crew_profile = CrewProfile.objects.create(
            user=self.crew_user,
            crew_role=CrewProfile.CrewRole.PHOTOGRAPHER,
            hourly_rate=Decimal('95.00'),
        )
        self.project = Project.objects.create(name='Crew Wrapped Shoot')
        self.shoot = Shoot.objects.create(
            project=self.project,
            shoot_date=date(2026, 4, 18),
            call_time=time(8, 30),
            est_wrap_time=time(16, 30),
            location='Stage C',
        )
        self.assignment = CrewAssignment.objects.create(
            shoot=self.shoot,
            crew=self.crew_profile,
            role_on_shoot=CrewProfile.CrewRole.PHOTOGRAPHER,
            status=CrewAssignment.Status.ACCEPTED,
        )
        self.client.force_authenticate(self.crew_user)

    def test_crew_can_create_time_log_with_assignment_and_hours_only(self):
        response = self.client.post(
            '/api/crew/timelogs/',
            {
                'assignment': self.assignment.id,
                'hours_worked': '9.00',
                'notes': 'Wrapped with gear return.',
            },
        )

        self.assertEqual(response.status_code, 201)
        log = CrewTimeLog.objects.get(assignment=self.assignment)
        self.assertEqual(log.crew, self.crew_profile)
        self.assertEqual(log.shoot, self.shoot)
        self.assertEqual(log.project, self.project)
        self.assertEqual(log.date, self.shoot.shoot_date)
        self.assertEqual(log.rate_applied, Decimal('95.00'))
        self.assertEqual(log.amount, Decimal('855.00'))
        self.assertEqual(log.log_status, CrewTimeLog.LogStatus.PENDING)