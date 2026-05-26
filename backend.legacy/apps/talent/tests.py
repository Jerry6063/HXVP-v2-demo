from datetime import date, time
from decimal import Decimal
from unittest.mock import patch

import stripe
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


class TalentTimeLogCreationTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.talent_user = User.objects.create_user(
            email='talent-create@example.com',
            password='password123',
            first_name='Taylor',
            last_name='Creator',
            role=User.Role.TALENT,
        )
        self.talent_profile = TalentProfile.objects.create(
            user=self.talent_user,
            hourly_rate=Decimal('125.00'),
            approval_status=TalentProfile.ApprovalStatus.APPROVED,
        )
        self.project = Project.objects.create(name='Wrapped Shoot')
        self.shoot = Shoot.objects.create(
            project=self.project,
            shoot_date=date(2026, 4, 20),
            call_time=time(9, 0),
            est_wrap_time=time(17, 0),
            location='Studio B',
        )
        self.booking = Booking.objects.create(
            shoot=self.shoot,
            talent=self.talent_profile,
            status=Booking.Status.ACCEPTED,
        )
        self.client.force_authenticate(self.talent_user)

    def test_talent_can_create_time_log_with_booking_and_hours_only(self):
        response = self.client.post(
            '/api/talent/timelogs/',
            {
                'booking': self.booking.id,
                'hours_worked': '8.00',
                'notes': 'Wrapped on schedule.',
            },
        )

        self.assertEqual(response.status_code, 201)
        log = TalentTimeLog.objects.get(booking=self.booking)
        self.assertEqual(log.talent, self.talent_profile)
        self.assertEqual(log.shoot, self.shoot)
        self.assertEqual(log.project, self.project)
        self.assertEqual(log.date, self.shoot.shoot_date)
        self.assertEqual(log.rate_applied, Decimal('125.00'))
        self.assertEqual(log.amount, Decimal('1000.00'))
        self.assertEqual(log.log_status, TalentTimeLog.LogStatus.PENDING)


class TalentStripeReconnectTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.production_user = User.objects.create_user(
            email='producer-stripe@example.com',
            password='password123',
            first_name='Prod',
            last_name='Stripe',
            role=User.Role.PRODUCTION_ADMIN,
        )
        self.talent_user = User.objects.create_user(
            email='talent-stripe@example.com',
            password='password123',
            first_name='Taylor',
            last_name='Reconnect',
            role=User.Role.TALENT,
        )
        self.talent_profile = TalentProfile.objects.create(
            user=self.talent_user,
            hourly_rate=Decimal('125.00'),
            approval_status=TalentProfile.ApprovalStatus.APPROVED,
            stripe_account_id='acct_old_platform',
            stripe_onboarding_complete=True,
        )
        self.client.force_authenticate(self.production_user)

    @patch('apps.talent.views.stripe.Account.retrieve')
    def test_stripe_status_marks_old_platform_account_for_reconnect(self, mock_retrieve):
        mock_retrieve.side_effect = stripe.error.InvalidRequestError('No such account', 'account')

        response = self.client.get(f'/api/talent/profiles/{self.talent_profile.id}/stripe_account_status/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['stripe_account_id'], 'acct_old_platform')
        self.assertFalse(response.data['onboarding_complete'])
        self.assertTrue(response.data['requires_reconnect'])

        self.talent_profile.refresh_from_db()
        self.assertFalse(self.talent_profile.stripe_onboarding_complete)

    @patch('apps.talent.views.stripe.AccountLink.create')
    @patch('apps.talent.views.stripe.Account.create')
    @patch('apps.talent.views.stripe.Account.retrieve')
    def test_reconnecting_creates_fresh_account_when_old_platform_account_is_stale(
        self,
        mock_retrieve,
        mock_create,
        mock_account_link,
    ):
        mock_retrieve.side_effect = stripe.error.InvalidRequestError('No such account', 'account')
        mock_create.return_value = {'id': 'acct_new_platform'}
        mock_account_link.return_value = {'url': 'https://stripe.test/onboarding'}

        response = self.client.post(f'/api/talent/profiles/{self.talent_profile.id}/create_stripe_account/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['stripe_account_id'], 'acct_new_platform')
        self.assertEqual(response.data['url'], 'https://stripe.test/onboarding')

        self.talent_profile.refresh_from_db()
        self.assertEqual(self.talent_profile.stripe_account_id, 'acct_new_platform')
        self.assertFalse(self.talent_profile.stripe_onboarding_complete)
        mock_account_link.assert_called_once_with(
            account='acct_new_platform',
            refresh_url='http://localhost:5173/production/talent-payments',
            return_url='http://localhost:5173/production/talent-payments',
            type='account_onboarding',
        )