from io import BytesIO
import os

from django.core.files.base import ContentFile
from django.db import transaction
from django.utils.html import escape
from django.utils.text import slugify
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from apps.projects.models import TalentConsideration
from apps.talent.models import TalentProfile

from .models import TalentRosterShare, TalentRosterShareItem


def create_talent_roster_share(*, client, talent_ids, shared_by, project=None, message=""):
    talent_ids = list(dict.fromkeys(talent_ids))
    profiles = list(
        TalentProfile.objects.filter(id__in=talent_ids)
        .select_related("user")
        .prefetch_related("photos")
    )
    profile_map = {profile.id: profile for profile in profiles}
    missing_ids = [talent_id for talent_id in talent_ids if talent_id not in profile_map]
    if missing_ids:
        raise ValueError(f"Unknown talent ids: {', '.join(str(item) for item in missing_ids)}")

    with transaction.atomic():
        share = TalentRosterShare.objects.create(
            project=project,
            client=client,
            talent_ids=talent_ids,
            message=message,
            shared_by=shared_by,
        )

        notes_by_talent_id = {}
        if project:
            existing_considerations = {
                consideration.talent_id: consideration
                for consideration in TalentConsideration.objects.filter(
                    project=project,
                    talent_id__in=talent_ids,
                )
            }
            missing_considerations = [
                TalentConsideration(
                    project=project,
                    talent_id=talent_id,
                    added_by=shared_by,
                )
                for talent_id in talent_ids
                if talent_id not in existing_considerations
            ]
            if missing_considerations:
                TalentConsideration.objects.bulk_create(missing_considerations)
            notes_by_talent_id = {
                consideration.talent_id: consideration.notes
                for consideration in TalentConsideration.objects.filter(
                    project=project,
                    talent_id__in=talent_ids,
                )
            }

        TalentRosterShareItem.objects.bulk_create(
            [
                TalentRosterShareItem(
                    share=share,
                    talent=profile_map[talent_id],
                    notes=notes_by_talent_id.get(talent_id, ""),
                    sort_order=index,
                )
                for index, talent_id in enumerate(talent_ids)
            ]
        )

        share = (
            TalentRosterShare.objects.select_related("client", "shared_by", "project")
            .prefetch_related("items__talent__user", "items__talent__photos")
            .get(pk=share.pk)
        )
        generate_talent_roster_pdf(share)

    return share


def generate_talent_roster_pdf(share):
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
        topMargin=0.7 * inch,
        bottomMargin=0.7 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = styles["Title"]
    heading_style = styles["Heading2"]
    body_style = styles["BodyText"]
    body_style.spaceAfter = 8
    label_style = ParagraphStyle(
        "ShortlistLabel",
        parent=styles["BodyText"],
        fontName="Helvetica-Bold",
        textColor=colors.HexColor("#1f2937"),
        spaceAfter=4,
    )

    story = [Paragraph("Talent Shortlist", title_style)]

    meta_lines = []
    if share.project_id:
        meta_lines.append(f"<b>Project:</b> {escape(share.project.name)}")
    meta_lines.append(f"<b>Client:</b> {escape(share.client.get_full_name() or share.client.email)}")
    meta_lines.append(f"<b>Shared:</b> {share.shared_at.strftime('%B %d, %Y')}")
    if share.message:
        meta_lines.append(f"<b>Production note:</b> {escape(share.message).replace(chr(10), '<br/>')}")
    story.append(Paragraph("<br/>".join(meta_lines), body_style))
    story.append(Spacer(1, 0.2 * inch))

    items = list(share.items.select_related("talent__user").prefetch_related("talent__photos"))
    for index, item in enumerate(items):
        talent = item.talent
        story.append(Paragraph(escape(talent.user.get_full_name()), heading_style))

        detail_bits = [
            talent.get_talent_type_display(),
            f"Age {talent.age}" if talent.age else "",
            talent.get_gender_display() if talent.gender else "",
            f"${talent.hourly_rate}/hr" if talent.hourly_rate else "",
            talent.availability.replace("_", " ").title() if talent.availability else "",
        ]
        story.append(Paragraph(" • ".join(bit for bit in detail_bits if bit), body_style))

        profile_lines = []
        if talent.race_ethnicity:
            profile_lines.append(f"<b>Race / Ethnicity:</b> {escape(talent.get_race_ethnicity_display())}")
        if talent.height:
            profile_lines.append(f"<b>Height:</b> {escape(talent.height)}")
        if talent.measurements:
            profile_lines.append(f"<b>Measurements:</b> {escape(talent.measurements)}")
        if talent.specializations:
            profile_lines.append(f"<b>Specializations:</b> {escape(talent.specializations).replace(chr(10), '<br/>')}")
        if talent.portfolio_url:
            profile_lines.append(f"<b>Portfolio:</b> {escape(talent.portfolio_url)}")
        if item.notes:
            profile_lines.append(f"<b>Production Notes:</b> {escape(item.notes).replace(chr(10), '<br/>')}")

        if profile_lines:
            story.append(Paragraph("<br/>".join(profile_lines), body_style))

        if talent.bio:
            story.append(Paragraph("Profile", label_style))
            story.append(Paragraph(escape(talent.bio).replace(chr(10), "<br/>"), body_style))

        image_cells = []
        for photo in talent.photos.all()[:4]:
            image_path = getattr(photo.image, "path", None)
            if not image_path or not os.path.exists(image_path):
                continue
            image_cells.append(Image(image_path, width=2.1 * inch, height=2.6 * inch, kind="proportional"))

        if image_cells:
            story.append(Paragraph("Photos", label_style))
            rows = []
            for row_start in range(0, len(image_cells), 2):
                row = image_cells[row_start:row_start + 2]
                while len(row) < 2:
                    row.append("")
                rows.append(row)
            table = Table(rows, colWidths=[2.4 * inch, 2.4 * inch])
            table.setStyle(
                TableStyle(
                    [
                        ("VALIGN", (0, 0), (-1, -1), "TOP"),
                        ("LEFTPADDING", (0, 0), (-1, -1), 0),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 12),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                    ]
                )
            )
            story.append(table)

        if index != len(items) - 1:
            story.append(Spacer(1, 0.15 * inch))
            story.append(PageBreak())

    doc.build(story)
    file_name_root = share.project.name if share.project_id else share.client.get_full_name() or "shortlist"
    file_name = f"{slugify(file_name_root) or 'shortlist'}-{share.pk}.pdf"
    share.pdf_file.save(file_name, ContentFile(buffer.getvalue()), save=False)
    share.save(update_fields=["pdf_file"])
    buffer.close()