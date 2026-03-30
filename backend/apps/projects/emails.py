import logging
from apps.utils.email import safe_send

logger = logging.getLogger(__name__)


def send_call_sheet_email(call_sheet, recipient_email, recipient_name):
    """Send a plain-text call sheet email to a single recipient."""

    def _time(t):
        if not t:
            return "TBD"
        h, m = t.hour, t.minute
        ampm = "AM" if h < 12 else "PM"
        return f"{h % 12 or 12}:{m:02d} {ampm}"

    # Build entry tables
    talent_lines = []
    crew_lines = []
    for entry in call_sheet.entries.all().order_by("person_type", "order"):
        line = f"  - {entry.name} ({entry.role})"
        if entry.call_time:
            line += f"  |  Call: {_time(entry.call_time)}"
        if entry.notes:
            line += f"  |  {entry.notes}"
        if entry.person_type == "talent":
            talent_lines.append(line)
        else:
            crew_lines.append(line)

    sections = [
        f"Hi {recipient_name},\n",
        f"Here is your call sheet for the upcoming shoot.\n",
        f"{'=' * 50}",
        f"  {call_sheet.title}",
        f"{'=' * 50}\n",
        f"Date:      {call_sheet.shoot_date}",
        f"Call Time:  {_time(call_sheet.call_time)}",
        f"Wrap Time:  {_time(call_sheet.est_wrap_time)}",
        f"Location:   {call_sheet.location}",
    ]

    if call_sheet.address:
        sections.append(f"Address:    {call_sheet.address}")
    if call_sheet.parking_info:
        sections.append(f"Parking:    {call_sheet.parking_info}")
    if call_sheet.weather_notes:
        sections.append(f"Weather:    {call_sheet.weather_notes}")
    if call_sheet.emergency_contact:
        sections.append(f"Emergency:  {call_sheet.emergency_contact}")

    if call_sheet.wardrobe_instructions:
        sections.append(f"\nWardrobe:\n  {call_sheet.wardrobe_instructions}")
    if call_sheet.hair_makeup_notes:
        sections.append(f"\nHair & Makeup:\n  {call_sheet.hair_makeup_notes}")
    if call_sheet.production_notes:
        sections.append(f"\nProduction Notes:\n  {call_sheet.production_notes}")

    if talent_lines:
        sections.append(f"\nTalent Roster:")
        sections.extend(talent_lines)
    if crew_lines:
        sections.append(f"\nCrew Roster:")
        sections.extend(crew_lines)

    sections.append(f"\n– HXVP Marketing Group")

    return safe_send(
        subject=f"Call Sheet: {call_sheet.title} – {call_sheet.shoot_date}",
        message="\n".join(sections),
        recipient_list=[recipient_email],
    )
