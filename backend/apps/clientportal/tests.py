import os
import shutil
import tempfile
from unittest.mock import patch

from django.test import override_settings
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.clientportal.models import TalentRosterShare
from apps.projects.models import Project, TalentConsideration
from apps.talent.models import TalentProfile


class TalentRosterShareFlowTests(APITestCase):
    def setUp(self):
        super().setUp()
        self.temp_media_root = tempfile.mkdtemp()
        self.override = override_settings(MEDIA_ROOT=self.temp_media_root)
        self.override.enable()
        self.addCleanup(self.override.disable)
        self.addCleanup(lambda: shutil.rmtree(self.temp_media_root, ignore_errors=True))

        self.production_user = User.objects.create_user(
            email="producer@example.com",
            password="password123",
            first_name="Prod",
            last_name="User",
            role=User.Role.PRODUCTION_ADMIN,
        )
        self.client_user = User.objects.create_user(
            email="client@example.com",
            password="password123",
            first_name="Client",
            last_name="Owner",
            role=User.Role.CLIENT,
        )
        self.other_client = User.objects.create_user(
            email="other-client@example.com",
            password="password123",
            first_name="Other",
            last_name="Client",
            role=User.Role.CLIENT,
        )
        self.talent_user = User.objects.create_user(
            email="talent@example.com",
            password="password123",
            first_name="Taylor",
            last_name="Talent",
            role=User.Role.TALENT,
        )
        self.talent_profile = TalentProfile.objects.create(
            user=self.talent_user,
            talent_type=TalentProfile.TalentType.MODEL,
            approval_status=TalentProfile.ApprovalStatus.APPROVED,
            bio="Experienced studio talent.",
            age=27,
            gender=TalentProfile.Gender.FEMALE,
            availability=TalentProfile.Availability.AVAILABLE,
        )
        self.project = Project.objects.create(
            name="Spring Campaign",
            client=self.client_user,
            status=Project.Status.ACTIVE,
            description="Seasonal campaign project.",
        )

    @patch("apps.clientportal.views.emails.send_talent_roster_email", return_value=True)
    def test_production_can_create_project_shortlist_with_pdf(self, mocked_email):
        self.client.force_authenticate(self.production_user)

        response = self.client.post(
            "/api/clientportal/talent-roster-shares/",
            {
                "project": self.project.id,
                "talent_ids": [self.talent_profile.id],
                "message": "Please review this first-pass shortlist.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        share = TalentRosterShare.objects.get()
        self.assertEqual(share.project, self.project)
        self.assertEqual(share.client, self.client_user)
        self.assertTrue(share.pdf_file.name)
        self.assertTrue(os.path.exists(share.pdf_file.path))
        self.assertEqual(share.items.count(), 1)
        self.assertTrue(
            TalentConsideration.objects.filter(
                project=self.project,
                talent=self.talent_profile,
            ).exists()
        )
        self.assertTrue(mocked_email.called)
        self.assertEqual(response.data["talent_details"][0]["full_name"], self.talent_user.get_full_name())

    @patch("apps.clientportal.views.emails.send_talent_roster_email", return_value=True)
    def test_client_can_favorite_only_their_own_shortlist_item(self, mocked_email):
        self.client.force_authenticate(self.production_user)
        create_response = self.client.post(
            "/api/clientportal/talent-roster-shares/",
            {
                "project": self.project.id,
                "talent_ids": [self.talent_profile.id],
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, 201)
        self.assertTrue(mocked_email.called)

        share = TalentRosterShare.objects.get()
        item = share.items.get()

        self.client.force_authenticate(self.client_user)
        favorite_response = self.client.patch(
            f"/api/clientportal/talent-roster-shares/{share.id}/update_favorite/",
            {
                "item_id": item.id,
                "client_favorite": True,
                "client_note": "Strong fit for this production.",
            },
            format="json",
        )

        self.assertEqual(favorite_response.status_code, 200)
        item.refresh_from_db()
        self.assertTrue(item.client_favorite)
        self.assertEqual(item.client_note, "Strong fit for this production.")

        self.client.force_authenticate(self.other_client)
        forbidden_response = self.client.patch(
            f"/api/clientportal/talent-roster-shares/{share.id}/update_favorite/",
            {
                "item_id": item.id,
                "client_favorite": False,
            },
            format="json",
        )

        self.assertEqual(forbidden_response.status_code, 404)