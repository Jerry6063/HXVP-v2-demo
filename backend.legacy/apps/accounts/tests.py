from unittest.mock import patch

from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.accounts.utils import make_email_verify_token
from apps.crew.models import CrewProfile
from apps.talent.models import TalentProfile


class AdminInvitePortalUserTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.production_user = User.objects.create_user(
            email="producer@example.com",
            password="password123",
            first_name="Prod",
            last_name="Admin",
            role=User.Role.PRODUCTION_ADMIN,
        )
        self.client.force_authenticate(self.production_user)

    @patch("apps.accounts.views.send_portal_invitation_email", return_value=True)
    def test_production_admin_can_invite_talent_and_create_profile(self, mock_send_invite):
        response = self.client.post(
            "/api/auth/users/invite-talent/",
            {
                "first_name": "Taylor",
                "last_name": "Talent",
                "email": "talent.invite@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="talent.invite@example.com")
        self.assertEqual(user.role, User.Role.TALENT)
        self.assertFalse(user.is_active)
        self.assertFalse(user.has_usable_password())
        self.assertTrue(TalentProfile.objects.filter(user=user).exists())
        self.assertEqual(
            response.data["detail"],
            "Talent profile created and invitation email sent.",
        )

        verify_url = mock_send_invite.call_args.args[1]
        self.assertIn("/verify-email?token=", verify_url)
        self.assertEqual(mock_send_invite.call_args.args[2], "talent")

    @patch("apps.accounts.views.send_portal_invitation_email", return_value=True)
    def test_production_admin_can_invite_crew_and_create_profile(self, mock_send_invite):
        response = self.client.post(
            "/api/auth/users/invite-crew/",
            {
                "first_name": "Casey",
                "last_name": "Crew",
                "email": "crew.invite@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        user = User.objects.get(email="crew.invite@example.com")
        self.assertEqual(user.role, User.Role.CREW)
        self.assertFalse(user.is_active)
        self.assertTrue(CrewProfile.objects.filter(user=user).exists())
        self.assertEqual(
            response.data["detail"],
            "Crew profile created and invitation email sent.",
        )
        self.assertEqual(mock_send_invite.call_args.args[2], "crew")

    @patch("apps.accounts.views.send_portal_invitation_email", return_value=True)
    def test_duplicate_email_rejection_returns_visible_message(self, mock_send_invite):
        User.objects.create_user(
            email="existing@example.com",
            password="password123",
            first_name="Existing",
            last_name="User",
            role=User.Role.CLIENT,
        )

        response = self.client.post(
            "/api/auth/users/invite-talent/",
            {
                "first_name": "Taylor",
                "last_name": "Talent",
                "email": "existing@example.com",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.data)
        self.assertEqual(
            response.data["email"][0],
            "This email is already registered in HXVP Studio. Use a different email address for this talent profile.",
        )
        mock_send_invite.assert_not_called()

    @patch("apps.accounts.views.send_welcome_email")
    @patch("apps.accounts.views.send_portal_invitation_email", return_value=True)
    def test_email_verify_confirm_reuses_invited_profile(self, mock_send_invite, mock_welcome):
        invite_response = self.client.post(
            "/api/auth/users/invite-talent/",
            {
                "first_name": "Taylor",
                "last_name": "Talent",
                "email": "verify.invite@example.com",
            },
            format="json",
        )
        self.assertEqual(invite_response.status_code, 201)

        invited_user = User.objects.get(email="verify.invite@example.com")
        token = make_email_verify_token(invited_user.id)

        self.client.force_authenticate(user=None)
        confirm_response = self.client.post(
            "/api/auth/verify-email/confirm/",
            {"token": token, "password": "password123"},
            format="json",
        )

        self.assertEqual(confirm_response.status_code, 200)
        invited_user.refresh_from_db()
        self.assertTrue(invited_user.is_active)
        self.assertEqual(TalentProfile.objects.filter(user=invited_user).count(), 1)
        mock_welcome.assert_called_once_with(invited_user)