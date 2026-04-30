from datetime import date, time
from decimal import Decimal

from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.finance.models import Expense
from apps.projects.models import Project, Shoot
from apps.talent.models import Booking, TalentPayment, TalentProfile, TalentTimeLog


class TalentTimeLogApprovalTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.production_user = User.objects.create_user(
            email='producer@example.com',
            password='password123',
            first_name='Prod',
            last_name='User',
            role=User.Role.PRODUCTION_ADMIN,
        )
        self.talent_user = User.objects.create_user(
            email='talent@example.com',
            password='password123',
            first_name='Taylor',
            last_name='Talent',
            role=User.Role.TALENT,
        )
        self.talent_profile = TalentProfile.objects.create(
            user=self.talent_user,
            hourly_rate=Decimal('125.00'),
            approval_status=TalentProfile.ApprovalStatus.APPROVED,
        )
        self.project = Project.objects.create(name='Studio Day')
        self.shoot = Shoot.objects.create(
            project=self.project,
            shoot_date=date(2026, 4, 20),
            call_time=time(9, 0),
            est_wrap_time=time(17, 0),
            location='Studio A',
        )
        self.booking = Booking.objects.create(
            shoot=self.shoot,
            talent=self.talent_profile,
            status=Booking.Status.ACCEPTED,
        )
        self.time_log = TalentTimeLog.objects.create(
            talent=self.talent_profile,
            booking=self.booking,
            shoot=self.shoot,
            project=self.project,
            date=self.shoot.shoot_date,
            hours_worked=Decimal('8.00'),
            rate_applied=Decimal('125.00'),
            amount=Decimal('1000.00'),
            log_status=TalentTimeLog.LogStatus.PENDING,
        )
        self.client.force_authenticate(self.production_user)

    def test_approving_talent_time_log_creates_one_linked_payment_and_expense(self):
        response = self.client.post(f'/api/talent/timelogs/{self.time_log.id}/approve/')

        self.assertEqual(response.status_code, 200)
        self.time_log.refresh_from_db()
        self.assertEqual(self.time_log.log_status, TalentTimeLog.LogStatus.APPROVED)

        payments = TalentPayment.objects.filter(source_time_log=self.time_log)
        self.assertEqual(payments.count(), 1)
        payment = payments.get()
        self.assertEqual(payment.talent, self.talent_profile)
        self.assertEqual(payment.project, self.project)
        self.assertEqual(payment.total_hours, Decimal('8.00'))
        self.assertEqual(payment.total_amount, Decimal('1000.00'))

        expenses = Expense.objects.filter(project=self.project, category=Expense.Category.TALENT)
        self.assertEqual(expenses.count(), 1)
        self.assertEqual(expenses.get().amount, Decimal('1000.00'))

    def test_reapproving_talent_time_log_does_not_duplicate_payment_or_expense(self):
        self.client.post(f'/api/talent/timelogs/{self.time_log.id}/approve/')
        response = self.client.post(f'/api/talent/timelogs/{self.time_log.id}/approve/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(TalentPayment.objects.filter(source_time_log=self.time_log).count(), 1)
        self.assertEqual(
            Expense.objects.filter(project=self.project, category=Expense.Category.TALENT).count(),
            1,
        )