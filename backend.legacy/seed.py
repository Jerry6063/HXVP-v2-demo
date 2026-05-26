#!/usr/bin/env python
"""Seed the database with sample data for development."""
import os
import sys
import django
from datetime import date, time, timedelta
from decimal import Decimal

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from apps.accounts.models import User
from apps.projects.models import Project, Shoot, ActivityLog
from apps.talent.models import TalentProfile, Booking
from apps.crew.models import CrewProfile, CrewAssignment, Equipment, EquipmentCheckout
from apps.deliverables.models import Deliverable, Contract
from apps.finance.models import Expense, Earning


def run():
    print("Seeding database...")

    # Users
    admin_user = User.objects.create_user(
        email="admin@studio.com",
        password="password123",
        first_name="Sarah",
        last_name="Director",
        role="production_admin",
    )

    client1 = User.objects.create_user(
        email="client@brandco.com",
        password="password123",
        first_name="James",
        last_name="Wilson",
        role="client",
    )
    client2 = User.objects.create_user(
        email="client2@luxe.com",
        password="password123",
        first_name="Emma",
        last_name="Chen",
        role="client",
    )

    talent_users = []
    talent_data = [
        ("Ava", "Martinez", "model", 150),
        ("Liam", "Brooks", "model", 175),
        ("Sophia", "Park", "actor", 200),
        ("Noah", "Reed", "model", 125),
        ("Isabella", "Foster", "dancer", 160),
        ("Ethan", "Gray", "voiceover", 100),
        ("Mia", "Sullivan", "model", 185),
        ("Lucas", "Rivera", "actor", 140),
    ]
    for i, (fn, ln, ttype, rate) in enumerate(talent_data):
        u = User.objects.create_user(
            email=f"talent{i+1}@studio.com",
            password="password123",
            first_name=fn,
            last_name=ln,
            role="talent",
        )
        talent_users.append(u)
        avail = ["available", "available", "booked", "available", "available", "unavailable", "available", "booked"]
        TalentProfile.objects.create(
            user=u,
            talent_type=ttype,
            hourly_rate=Decimal(str(rate)),
            availability=avail[i],
            bio=f"Professional {ttype} with 5+ years of experience.",
            portfolio_url=f"https://portfolio.example.com/{fn.lower()}",
        )

    crew_users = []
    crew_data = [
        ("Alex", "Thompson", "photographer", 95),
        ("Jordan", "Lee", "videographer", 85),
        ("Casey", "Morgan", "lighting", 70),
        ("Riley", "Davis", "audio", 75),
        ("Morgan", "Taylor", "hair_makeup", 80),
        ("Taylor", "Kim", "stylist", 70),
        ("Sam", "Patel", "assistant", 45),
    ]
    for i, (fn, ln, crole, rate) in enumerate(crew_data):
        u = User.objects.create_user(
            email=f"crew{i+1}@studio.com",
            password="password123",
            first_name=fn,
            last_name=ln,
            role="crew",
        )
        crew_users.append(u)
        avail = ["available", "available", "booked", "available", "available", "unavailable", "available"]
        CrewProfile.objects.create(
            user=u,
            crew_role=crole,
            hourly_rate=Decimal(str(rate)),
            availability=avail[i],
            bio=f"Experienced {crole} specializing in studio and on-location work.",
        )

    # Projects
    today = date.today()
    p1 = Project.objects.create(
        name="Summer Fashion Campaign",
        client=client1,
        status="active",
        budget=Decimal("25000"),
        start_date=today - timedelta(days=10),
        deadline=today + timedelta(days=30),
        description="High-end summer fashion editorial for BrandCo's new collection.",
    )
    p2 = Project.objects.create(
        name="Luxe Cosmetics Product Launch",
        client=client2,
        status="active",
        budget=Decimal("18000"),
        start_date=today - timedelta(days=5),
        deadline=today + timedelta(days=45),
        description="Product photography and video for Luxe cosmetics new skincare line.",
    )
    p3 = Project.objects.create(
        name="Corporate Headshots – TechCorp",
        client=client1,
        status="active",
        budget=Decimal("5000"),
        start_date=today + timedelta(days=2),
        deadline=today + timedelta(days=14),
        description="Professional headshots for TechCorp executive team.",
    )
    p4 = Project.objects.create(
        name="Spring Catalog 2025",
        client=client2,
        status="archived",
        budget=Decimal("32000"),
        start_date=today - timedelta(days=90),
        deadline=today - timedelta(days=30),
        description="Spring catalog shoot completed and delivered.",
    )
    p5 = Project.objects.create(
        name="Holiday Ad Campaign",
        client=client1,
        status="completed",
        budget=Decimal("40000"),
        start_date=today - timedelta(days=120),
        deadline=today - timedelta(days=60),
        description="Multi-channel holiday advertising campaign.",
    )

    # Shoots
    s1 = Shoot.objects.create(
        project=p1,
        shoot_date=today + timedelta(days=3),
        call_time=time(8, 0),
        est_wrap_time=time(17, 0),
        location="Studio A",
        address="123 Creative Blvd, Suite 100",
        wardrobe_instructions="Summer casual – light fabrics, pastels and whites.",
        hair_makeup_notes="Natural beach-wave look, minimal makeup.",
        comments="Catering provided. Parking in lot B.",
        status="scheduled",
    )
    s2 = Shoot.objects.create(
        project=p1,
        shoot_date=today + timedelta(days=7),
        call_time=time(9, 0),
        est_wrap_time=time(16, 0),
        location="Malibu Beach",
        address="21000 Pacific Coast Hwy, Malibu",
        wardrobe_instructions="Resort wear – flowing dresses, swimwear.",
        hair_makeup_notes="Sun-kissed glow, waterproof makeup.",
        comments="Tide schedule checked. Sunset shots at 6:30 PM.",
        status="scheduled",
    )
    s3 = Shoot.objects.create(
        project=p2,
        shoot_date=today + timedelta(days=5),
        call_time=time(10, 0),
        est_wrap_time=time(18, 0),
        location="Studio B",
        address="123 Creative Blvd, Suite 200",
        wardrobe_instructions="Clean, minimal – white tee and natural skin focus.",
        hair_makeup_notes="Focus on skincare glow, product application shots.",
        comments="Product samples arriving day before.",
        status="scheduled",
    )
    s4 = Shoot.objects.create(
        project=p3,
        shoot_date=today + timedelta(days=4),
        call_time=time(9, 0),
        est_wrap_time=time(15, 0),
        location="TechCorp HQ",
        address="500 Innovation Drive",
        wardrobe_instructions="Business professional.",
        comments="12 executives, 20 minutes each.",
        status="scheduled",
    )

    # Bookings
    tp = TalentProfile.objects.all()
    Booking.objects.create(shoot=s1, talent=tp[0], status="accepted")
    Booking.objects.create(shoot=s1, talent=tp[1], status="accepted")
    Booking.objects.create(shoot=s1, talent=tp[6], status="pending")
    Booking.objects.create(shoot=s2, talent=tp[0], status="accepted")
    Booking.objects.create(shoot=s2, talent=tp[3], status="pending")
    Booking.objects.create(shoot=s3, talent=tp[2], status="accepted")
    Booking.objects.create(shoot=s3, talent=tp[4], status="pending")

    # Crew assignments
    cp = CrewProfile.objects.all()
    CrewAssignment.objects.create(shoot=s1, crew=cp[0], role_on_shoot="photographer", status="accepted")
    CrewAssignment.objects.create(shoot=s1, crew=cp[2], role_on_shoot="lighting", status="accepted")
    CrewAssignment.objects.create(shoot=s1, crew=cp[4], role_on_shoot="hair_makeup", status="accepted")
    CrewAssignment.objects.create(shoot=s1, crew=cp[6], role_on_shoot="assistant", status="accepted")
    CrewAssignment.objects.create(shoot=s2, crew=cp[0], role_on_shoot="photographer", status="accepted")
    CrewAssignment.objects.create(shoot=s2, crew=cp[1], role_on_shoot="videographer", status="pending")
    CrewAssignment.objects.create(shoot=s2, crew=cp[3], role_on_shoot="audio", status="pending")
    CrewAssignment.objects.create(shoot=s3, crew=cp[0], role_on_shoot="photographer", status="accepted")
    CrewAssignment.objects.create(shoot=s3, crew=cp[2], role_on_shoot="lighting", status="accepted")
    CrewAssignment.objects.create(shoot=s3, crew=cp[5], role_on_shoot="stylist", status="accepted")
    CrewAssignment.objects.create(shoot=s4, crew=cp[0], role_on_shoot="photographer", status="accepted")
    CrewAssignment.objects.create(shoot=s4, crew=cp[6], role_on_shoot="assistant", status="accepted")

    # Equipment
    equip_data = [
        ("Canon R5", "camera", "available"),
        ("Sony A7IV", "camera", "checked_out"),
        ("Canon RF 70-200mm", "lens", "available"),
        ("Profoto B10 Plus", "lighting", "checked_out"),
        ("Profoto B10 Plus #2", "lighting", "available"),
        ("Godox SL200", "lighting", "available"),
        ("Rode NTG5", "audio", "available"),
        ("C-Stand Kit (x4)", "grip", "available"),
    ]
    equip_objects = []
    for name, etype, estatus in equip_data:
        e = Equipment.objects.create(name=name, equipment_type=etype, status=estatus)
        equip_objects.append(e)

    EquipmentCheckout.objects.create(
        equipment=equip_objects[1], crew=cp[0], shoot=s1,
        checkout_date=today, return_date=today + timedelta(days=3),
    )
    EquipmentCheckout.objects.create(
        equipment=equip_objects[3], crew=cp[2], shoot=s1,
        checkout_date=today,
    )

    # Deliverables
    Deliverable.objects.create(project=p1, name="Edited Photos – Look 1", deliverable_type="photo", status="in_progress", deadline=today + timedelta(days=20))
    Deliverable.objects.create(project=p1, name="Edited Photos – Look 2", deliverable_type="photo", status="pending", deadline=today + timedelta(days=25))
    Deliverable.objects.create(project=p1, name="Behind-the-Scenes Video", deliverable_type="video", status="pending", deadline=today + timedelta(days=28))
    Deliverable.objects.create(project=p2, name="Product Hero Shots", deliverable_type="photo", status="pending", deadline=today + timedelta(days=35))
    Deliverable.objects.create(project=p2, name="Social Media Cuts", deliverable_type="video", status="pending", deadline=today + timedelta(days=40))
    Deliverable.objects.create(project=p3, name="Executive Headshots", deliverable_type="photo", status="pending", deadline=today + timedelta(days=10))

    # Contracts
    Contract.objects.create(project=p1, user=client1, contract_type="client", status="signed", title="BrandCo Master Agreement")
    Contract.objects.create(project=p1, user=talent_users[0], contract_type="talent", status="signed", title="Talent Release – Ava Martinez")
    Contract.objects.create(project=p1, user=talent_users[1], contract_type="talent", status="signed", title="Talent Release – Liam Brooks")
    Contract.objects.create(project=p1, user=crew_users[0], contract_type="crew", status="signed", title="Crew Agreement – Alex Thompson")
    Contract.objects.create(project=p2, user=client2, contract_type="client", status="signed", title="Luxe Cosmetics Agreement")
    Contract.objects.create(project=p2, user=talent_users[2], contract_type="talent", status="sent", title="Talent Release – Sophia Park")
    Contract.objects.create(project=p3, user=client1, contract_type="client", status="draft", title="TechCorp Headshot Agreement")

    # Expenses
    Expense.objects.create(project=p1, category="location", amount=Decimal("2500"), description="Studio A rental – 2 days", date=today - timedelta(days=5))
    Expense.objects.create(project=p1, category="talent", amount=Decimal("3200"), description="Talent fees – Day 1", date=today - timedelta(days=3))
    Expense.objects.create(project=p1, category="crew", amount=Decimal("1800"), description="Crew fees – Day 1", date=today - timedelta(days=3))
    Expense.objects.create(project=p1, category="catering", amount=Decimal("450"), description="On-set catering", date=today - timedelta(days=3))
    Expense.objects.create(project=p2, category="equipment", amount=Decimal("800"), description="Additional lighting rental", date=today - timedelta(days=2))
    Expense.objects.create(project=p2, category="location", amount=Decimal("1500"), description="Studio B rental", date=today - timedelta(days=1))

    # Earnings
    Earning.objects.create(user=client1, project=p1, amount=Decimal("12500"), description="50% upfront payment", date=today - timedelta(days=10), status="paid")
    Earning.objects.create(user=client1, project=p5, amount=Decimal("40000"), description="Full payment", date=today - timedelta(days=60), status="paid")
    Earning.objects.create(user=client2, project=p2, amount=Decimal("9000"), description="50% upfront payment", date=today - timedelta(days=5), status="paid")
    Earning.objects.create(user=client1, project=p3, amount=Decimal("2500"), description="Deposit", date=today, status="pending")

    # Activity logs
    ActivityLog.objects.create(project=p1, user=admin_user, action="Project created")
    ActivityLog.objects.create(project=p1, user=admin_user, action="Shoot scheduled for Studio A")
    ActivityLog.objects.create(project=p1, user=admin_user, action="Talent Ava Martinez booked")
    ActivityLog.objects.create(project=p1, user=admin_user, action="Talent Liam Brooks booked")
    ActivityLog.objects.create(project=p1, user=admin_user, action="Crew Alex Thompson assigned")
    ActivityLog.objects.create(project=p2, user=admin_user, action="Project created")
    ActivityLog.objects.create(project=p2, user=admin_user, action="Product shoot scheduled")
    ActivityLog.objects.create(project=p3, user=admin_user, action="Project created")

    print("Done! Seed data created successfully.")
    print(f"\nLogin credentials (all passwords: password123):")
    print(f"  Production Admin: admin@studio.com")
    print(f"  Client: client@brandco.com")
    print(f"  Talent: talent1@studio.com")
    print(f"  Crew: crew1@studio.com")


if __name__ == "__main__":
    run()
