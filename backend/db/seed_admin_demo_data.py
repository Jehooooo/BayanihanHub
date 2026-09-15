"""
BayanihanHub — Comprehensive Admin Demo Data Seeder
Adds at least 2 realistic demo records for EVERY status across all Admin Panel tabs:
  1. Approvals & Identity Verification: Pending (2), Approved (2), Retry Required (2), Rejected (2), All (8)
  2. Users Tab: Pending (2), Approved (6), Suspended (2), Rejected (2), All Users (14)
  3. Posts Tab: Active & Available (10), Removed (2), All Listings (12)
  4. Requests Tab: Active & Open (3), Removed / Cancelled (2), All Requests (5)
  5. Reports Tab: Pending (2), Under Review (2), Resolved (2), Dismissed (2), All Reports (8)

Idempotent: Can be run multiple times safely without creating duplicates.
Preserves: Admin (user 5) and Jehosue (user 14), plus Jehosue's 10 active item listings.
"""

import os
import sys
from pathlib import Path
from datetime import datetime, timedelta
import pymysql
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")

AIVEN_HOST = os.getenv("AIVEN_HOST", os.getenv("MYSQL_HOST", "localhost"))
AIVEN_PORT = int(os.getenv("AIVEN_PORT", os.getenv("MYSQL_PORT", 3307)))
AIVEN_USER = os.getenv("AIVEN_USER", os.getenv("MYSQL_USER", "root"))
AIVEN_PASSWORD = os.getenv("AIVEN_PASSWORD", os.getenv("MYSQL_PASSWORD", ""))

CONFIGS = [
    {
        "name": "Local MySQL (bayanihan_hub)",
        "host": os.getenv("LOCAL_MYSQL_HOST", "localhost"),
        "port": int(os.getenv("LOCAL_MYSQL_PORT", 3307)),
        "user": os.getenv("LOCAL_MYSQL_USER", "root"),
        "password": os.getenv("LOCAL_MYSQL_PASSWORD", ""),
        "database": "bayanihan_hub",
        "ssl": False,
    },
]

if os.getenv("AIVEN_HOST") or "aivencloud.com" in os.getenv("DATABASE_URL", ""):
    CONFIGS.extend([
        {
            "name": "Aiven Cloud MySQL (bayanihan_hub)",
            "host": AIVEN_HOST,
            "port": AIVEN_PORT,
            "user": AIVEN_USER,
            "password": AIVEN_PASSWORD,
            "database": "bayanihan_hub",
            "ssl": True,
        },
        {
            "name": "Aiven Cloud MySQL (defaultdb)",
            "host": AIVEN_HOST,
            "port": AIVEN_PORT,
            "user": AIVEN_USER,
            "password": AIVEN_PASSWORD,
            "database": "defaultdb",
            "ssl": True,
        },
    ])

DEMO_LABEL = "BAYANIHANHUB_ADMIN_DEMO_SEED"

# --------------------------------------------------------------------------
# 1. USERS TO SEED (12 demo users + 2 preserved = 14 total)
# --------------------------------------------------------------------------
DEMO_USERS = [
    # APPROVED USERS (role admin)
    {
        "user_id": 19,
        "email": "student1@bayanihanhub.com",
        "password": "student123",
        "first_name": "Student",
        "last_name": "1",
        "username": "student1",
        "phone": "09171110001",
        "barangay": "Poblacion",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 1,  # admin
        "account_status_id": 2,  # APPROVED
        "is_suspended": 0,
    },
    {
        "user_id": 20,
        "email": "student2@bayanihanhub.com",
        "password": "student123",
        "first_name": "Student",
        "last_name": "2",
        "username": "student2",
        "phone": "09171110002",
        "barangay": "Poblacion",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 1,  # admin
        "account_status_id": 2,  # APPROVED
        "is_suspended": 0,
    },
    # APPROVED USERS (role user)
    {
        "user_id": 21,
        "email": "juan.delacruz@bayanihanhub.com",
        "password": "password123",
        "first_name": "Juan",
        "last_name": "Dela Cruz",
        "username": "juandelacruz",
        "phone": "09181234501",
        "barangay": "Poblacion",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 2,  # APPROVED
        "is_suspended": 0,
    },
    {
        "user_id": 22,
        "email": "maria.santos@bayanihanhub.com",
        "password": "password123",
        "first_name": "Maria",
        "last_name": "Santos",
        "username": "mariasantos",
        "phone": "09181234502",
        "barangay": "Catbangen",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 2,  # APPROVED
        "is_suspended": 0,
    },
    # PENDING USERS (minimum 2)
    {
        "user_id": 27,
        "email": "arjay.santos@bayanihanhub.com",
        "password": "password123",
        "first_name": "Arjay",
        "last_name": "Santos",
        "username": "arjaysantos",
        "phone": "09181234507",
        "barangay": "Lingsat",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 1,  # PENDING
        "is_suspended": 0,
    },
    {
        "user_id": 28,
        "email": "clarisse.velasco@bayanihanhub.com",
        "password": "password123",
        "first_name": "Clarisse",
        "last_name": "Velasco",
        "username": "clarissevelasco",
        "phone": "09181234508",
        "barangay": "Sevilla",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 1,  # PENDING
        "is_suspended": 0,
    },
    # SUSPENDED USERS (minimum 2)
    {
        "user_id": 33,
        "email": "ricardo.dalisay@bayanihanhub.com",
        "password": "password123",
        "first_name": "Ricardo",
        "last_name": "Dalisay",
        "username": "ricardodalisay",
        "phone": "09181234513",
        "barangay": "Catbangen",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 5,  # SUSPENDED
        "is_suspended": 1,
    },
    {
        "user_id": 34,
        "email": "monica.santiago@bayanihanhub.com",
        "password": "password123",
        "first_name": "Monica",
        "last_name": "Santiago",
        "username": "monicasantiago",
        "phone": "09181234514",
        "barangay": "Poblacion",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 5,  # SUSPENDED
        "is_suspended": 1,
    },
    # REJECTED USERS (minimum 2)
    {
        "user_id": 31,
        "email": "rodrigo.marquez@bayanihanhub.com",
        "password": "password123",
        "first_name": "Rodrigo",
        "last_name": "Marquez",
        "username": "rodrigomarquez",
        "phone": "09181234511",
        "barangay": "Ilocanos Norte",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 3,  # REJECTED
        "is_suspended": 0,
    },
    {
        "user_id": 32,
        "email": "jessica.alvarez@bayanihanhub.com",
        "password": "password123",
        "first_name": "Jessica",
        "last_name": "Alvarez",
        "username": "jessicaalvarez",
        "phone": "09181234512",
        "barangay": "Carlatan",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 3,  # REJECTED
        "is_suspended": 0,
    },
    # USERS FOR RETRY REQUIRED IDENTITY VERIFICATION
    {
        "user_id": 29,
        "email": "mark.bautista@bayanihanhub.com",
        "password": "password123",
        "first_name": "Mark Anthony",
        "last_name": "Bautista",
        "username": "markbautista",
        "phone": "09181234509",
        "barangay": "San Vicente",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 4,  # REQUIRES_REVIEW
        "is_suspended": 0,
    },
    {
        "user_id": 30,
        "email": "patricia.lim@bayanihanhub.com",
        "password": "password123",
        "first_name": "Patricia",
        "last_name": "Lim",
        "username": "patricialim",
        "phone": "09181234510",
        "barangay": "Biday",
        "municipality": "San Fernando",
        "province": "La Union",
        "role_id": 2,  # user
        "account_status_id": 4,  # REQUIRES_REVIEW
        "is_suspended": 0,
    },
]

# --------------------------------------------------------------------------
# 2. SUSPENSIONS FOR SUSPENDED USERS
# --------------------------------------------------------------------------
DEMO_SUSPENSIONS = [
    {
        "user_id": 33,
        "suspended_by": 5,
        "reason": "Repeated missed pickup commitments & misleading description",
        "message": "Account suspended for 14 days following 3 verified community complaints regarding missed meetup commitments in Barangay Catbangen.",
        "start_at": "2026-09-10 14:00:00",
        "expires_at": "2026-09-24 14:00:00",
        "status": "ACTIVE",
    },
    {
        "user_id": 34,
        "suspended_by": 5,
        "reason": "Commercial cash sales and external spam advertising",
        "message": "Account suspended for 30 days pending moderator investigation. Commercial sales and unauthorized advertising violate community standards.",
        "start_at": "2026-09-11 09:00:00",
        "expires_at": "2026-10-11 09:00:00",
        "status": "ACTIVE",
    },
]

# --------------------------------------------------------------------------
# 3. IDENTITY VERIFICATIONS: 2 per status (Pending, Approved, Retry, Rejected)
# Total = 8 records. ZERO REAL FACE PHOTOS.
# --------------------------------------------------------------------------
DEMO_VERIFICATIONS = [
    # 1. PENDING (2 records)
    {
        "id": 1,
        "user_id": 27,
        "id_type_id": 1,  # National ID
        "id_number": "9102-3847-1928-1102",
        "masked_id_number": "••••-••••-••••-1102",
        "full_name_on_id": "ARJAY SANTOS",
        "date_of_birth": "1999-03-24",
        "expiration_date": "2030-03-24",
        "document_reference": "DOC_PENDING_SECURE",
        "facial_selfie_reference": "",
        "facial_verification_status_id": 1,  # NOT_STARTED
        "verification_status_id": 1,  # PENDING
        "confidence_score": 0,
        "provider": "BayanihanHub-Biometric-Engine",
        "reviewed_at": None,
        "reviewed_by": None,
        "submitted_at": "2026-09-15 14:30:00",
        "rejection_reason": None,
        "retry_instructions": None,
    },
    {
        "id": 2,
        "user_id": 28,
        "id_type_id": 4,  # Postal ID
        "id_number": "PRN-8829-1920-LU",
        "masked_id_number": "••••-••••-••••-1920",
        "full_name_on_id": "CLARISSE VELASCO",
        "date_of_birth": "2001-08-11",
        "expiration_date": "2028-08-11",
        "document_reference": "DOC_PENDING_SECURE",
        "facial_selfie_reference": "",
        "facial_verification_status_id": 1,  # NOT_STARTED
        "verification_status_id": 1,  # PENDING
        "confidence_score": 0,
        "provider": "BayanihanHub-Biometric-Engine",
        "reviewed_at": None,
        "reviewed_by": None,
        "submitted_at": "2026-09-15 15:45:00",
        "rejection_reason": None,
        "retry_instructions": None,
    },
    # 2. APPROVED (2 records)
    {
        "id": 3,
        "user_id": 21,
        "id_type_id": 1,  # National ID
        "id_number": "4829-1029-4820-9921",
        "masked_id_number": "••••-••••-••••-9921",
        "full_name_on_id": "JUAN DELA CRUZ",
        "date_of_birth": "2001-05-14",
        "expiration_date": "2031-05-14",
        "document_reference": "DOC_VERIFIED_ENCRYPTED",
        "facial_selfie_reference": "",
        "facial_verification_status_id": 2,  # PASSED
        "verification_status_id": 2,  # APPROVED
        "confidence_score": 96,
        "provider": "BayanihanHub-Biometric-Engine",
        "reviewed_at": "2026-09-12 10:00:00",
        "reviewed_by": 5,
        "submitted_at": "2026-09-12 09:30:00",
        "rejection_reason": None,
        "retry_instructions": None,
    },
    {
        "id": 4,
        "user_id": 22,
        "id_type_id": 2,  # Driver's License
        "id_number": "N02-18-938210",
        "masked_id_number": "••••-••-938210",
        "full_name_on_id": "MARIA SANTOS",
        "date_of_birth": "2002-11-20",
        "expiration_date": "2029-11-20",
        "document_reference": "DOC_VERIFIED_ENCRYPTED",
        "facial_selfie_reference": "",
        "facial_verification_status_id": 2,  # PASSED
        "verification_status_id": 2,  # APPROVED
        "confidence_score": 98,
        "provider": "BayanihanHub-Biometric-Engine",
        "reviewed_at": "2026-09-12 10:15:00",
        "reviewed_by": 5,
        "submitted_at": "2026-09-12 09:45:00",
        "rejection_reason": None,
        "retry_instructions": None,
    },
    # 3. RETRY REQUIRED (2 records)
    {
        "id": 5,
        "user_id": 29,
        "id_type_id": 3,  # Passport
        "id_number": "P9182301B",
        "masked_id_number": "••••••01B",
        "full_name_on_id": "MARK ANTHONY BAUTISTA",
        "date_of_birth": "1998-06-17",
        "expiration_date": "2028-06-17",
        "document_reference": "DOC_RETRY_SECURE",
        "facial_selfie_reference": "",
        "facial_verification_status_id": 3,  # FAILED
        "verification_status_id": 4,  # RETRY_REQUIRED
        "confidence_score": 62,
        "provider": "BayanihanHub-Biometric-Engine",
        "reviewed_at": "2026-09-13 11:20:00",
        "reviewed_by": 5,
        "submitted_at": "2026-09-13 10:00:00",
        "rejection_reason": "ID photo has flash glare over biographical details.",
        "retry_instructions": "Please photograph your passport on a flat surface without camera flash in daylight so all text and MRZ lines are sharp.",
    },
    {
        "id": 6,
        "user_id": 30,
        "id_type_id": 6,  # Voter's ID
        "id_number": "VIN-3301-4920A",
        "masked_id_number": "••••-••••-4920A",
        "full_name_on_id": "PATRICIA LIM",
        "date_of_birth": "2000-01-30",
        "expiration_date": "2030-01-30",
        "document_reference": "DOC_RETRY_SECURE",
        "facial_selfie_reference": "",
        "facial_verification_status_id": 3,  # FAILED
        "verification_status_id": 4,  # RETRY_REQUIRED
        "confidence_score": 58,
        "provider": "BayanihanHub-Biometric-Engine",
        "reviewed_at": "2026-09-13 14:10:00",
        "reviewed_by": 5,
        "submitted_at": "2026-09-13 13:00:00",
        "rejection_reason": "Facial selfie angle is too low and obscured by dark shadows.",
        "retry_instructions": "Please face the camera directly in a brightly lit environment and remove glasses or face coverings.",
    },
    # 4. REJECTED (2 records)
    {
        "id": 7,
        "user_id": 31,
        "id_type_id": 5,  # UMID
        "id_number": "CRN-0112-9482-1029",
        "masked_id_number": "••••-••••-••••-1029",
        "full_name_on_id": "RODRIGO MARQUEZ",
        "date_of_birth": "1995-12-05",
        "expiration_date": "2024-12-05",  # Expired
        "document_reference": "DOC_REJECTED_SECURE",
        "facial_selfie_reference": "",
        "facial_verification_status_id": 3,  # FAILED
        "verification_status_id": 3,  # REJECTED
        "confidence_score": 34,
        "provider": "BayanihanHub-Biometric-Engine",
        "reviewed_at": "2026-09-14 09:30:00",
        "reviewed_by": 5,
        "submitted_at": "2026-09-14 08:45:00",
        "rejection_reason": "Expired ID document submitted. UMID card expired in 2024. A valid, unexpired government ID is required.",
        "retry_instructions": None,
    },
    {
        "id": 8,
        "user_id": 32,
        "id_type_id": 7,  # Student ID
        "id_number": "DMMMSU-2023-9912",
        "masked_id_number": "••••••••-9912",
        "full_name_on_id": "JESSICA ALVAREZ",
        "date_of_birth": "2003-04-19",
        "expiration_date": "2026-06-30",
        "document_reference": "DOC_REJECTED_SECURE",
        "facial_selfie_reference": "",
        "facial_verification_status_id": 3,  # FAILED
        "verification_status_id": 3,  # REJECTED
        "confidence_score": 41,
        "provider": "BayanihanHub-Biometric-Engine",
        "reviewed_at": "2026-09-14 11:15:00",
        "reviewed_by": 5,
        "submitted_at": "2026-09-14 10:20:00",
        "rejection_reason": "Invalid document. Unofficial school registration form submitted instead of a recognized government photo ID.",
        "retry_instructions": None,
    },
]

# --------------------------------------------------------------------------
# 4. REMOVED ITEMS (at least 2 removed, active items 24..33 preserved)
# --------------------------------------------------------------------------
DEMO_REMOVED_ITEMS = [
    {
        "item_id": 35,
        "owner_id": 21,
        "category_id": 6,  # Other
        "condition_id": 2,  # Good
        "item_type_id": 1,  # Donation
        "item_status_id": 7,  # REMOVED
        "location_id": 45,
        "location_address": "Rizal Avenue Plaza",
        "barangay": "Poblacion",
        "title": "Pre-loved Electronic Vape Kit & E-liquid Flavor Pods",
        "description": "Rechargeable vape mod with mint flavor pods. Giving away to adult neighbors.",
        "quantity": 1,
        "availability": "Pickup only",
        "views_count": 5,
        "image_id": 45,
        "image_url": "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80",
    },
    {
        "item_id": 36,
        "owner_id": 22,
        "category_id": 1,  # Clothing
        "condition_id": 1,  # Brand New
        "item_type_id": 1,  # Donation
        "item_status_id": 7,  # REMOVED
        "location_id": 46,
        "location_address": "Catbangen Central",
        "barangay": "Catbangen",
        "title": "Brand New Branded Designer Handbag (Resale P4,500 Cash Only)",
        "description": "Selling genuine leather shoulder bag for cash payment. No barter or donations.",
        "quantity": 1,
        "availability": "Strictly cash",
        "views_count": 9,
        "image_id": 46,
        "image_url": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80",
    },
]

# --------------------------------------------------------------------------
# 5. REMOVED / CANCELLED REQUESTS (at least 2 cancelled, 3 active preserved)
# --------------------------------------------------------------------------
DEMO_CANCELLED_REQUESTS = [
    {
        "request_id": 17,
        "user_id": 21,
        "category_id": 6,  # Other
        "urgency_id": 3,  # High
        "request_status_id": 4,  # CANCELLED
        "location_id": 47,
        "location_address": "Poblacion Barangay Hall",
        "barangay": "Poblacion",
        "title": "Direct Cash Financial Assistance for Board Exam Review Fee",
        "description": "Requesting cash financial grant of P2,000 for upcoming engineering licensure examination review enrollment.",
        "needed_before": "2026-09-30",
        "image_id": 7,
        "image_url": "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    },
    {
        "request_id": 18,
        "user_id": 22,
        "category_id": 2,  # Books
        "urgency_id": 2,  # Medium
        "request_status_id": 4,  # CANCELLED
        "location_id": 48,
        "location_address": "Catbangen Elementary Area",
        "barangay": "Catbangen",
        "title": "Duplicate Request: Elementary Science Modules & Activity Sheets",
        "description": "Looking for Grade 5 science modules. (Submitted twice by mistake, cancelling this duplicate post).",
        "needed_before": "2026-09-28",
        "image_id": 8,
        "image_url": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80",
    },
]

# --------------------------------------------------------------------------
# 6. REPORTS: 2 per status (Pending, Under Review, Resolved, Dismissed)
# Total = 8 reports
# --------------------------------------------------------------------------
DEMO_REPORTS = [
    # 1. PENDING (2 reports)
    {
        "report_id": 1,
        "reporter_id": 21,
        "target_type_id": 2,  # item
        "target_id": "35",  # vape item
        "reason_id": 20,  # prohibited_item
        "description": "Listing advertises vape electronic cigarettes and nicotine refills which are prohibited under BayanihanHub community safety policies.",
        "status_id": 1,  # pending
        "resolved_by": None,
        "resolved_at": None,
        "resolution_note": None,
        "created_at": "2026-09-15 11:30:00",
    },
    {
        "report_id": 2,
        "reporter_id": 22,
        "target_type_id": 1,  # user
        "target_id": "33",  # Ricardo Dalisay
        "reason_id": 26,  # inappropriate_behavior
        "description": "User repeatedly confirmed scheduled pickup at San Fernando Plaza but failed to show up without any prior notice 3 times.",
        "status_id": 1,  # pending
        "resolved_by": None,
        "resolved_at": None,
        "resolution_note": None,
        "created_at": "2026-09-15 13:15:00",
    },
    # 2. UNDER REVIEW (2 reports)
    {
        "report_id": 3,
        "reporter_id": 27,
        "target_type_id": 2,  # item
        "target_id": "36",  # commercial handbag
        "reason_id": 21,  # misleading_information
        "description": "Post advertises a community donation but seller privately demands cash payment of P4,500 via private chat.",
        "status_id": 2,  # reviewed / under_review
        "resolved_by": None,
        "resolved_at": None,
        "resolution_note": None,
        "created_at": "2026-09-14 15:40:00",
    },
    {
        "report_id": 4,
        "reporter_id": 28,
        "target_type_id": 5,  # request
        "target_id": "17",  # cash solicitation
        "reason_id": 30,  # prohibited_request
        "description": "Help request solicits direct cash transfers via electronic wallets, violating non-monetary community guidelines.",
        "status_id": 2,  # reviewed / under_review
        "resolved_by": None,
        "resolved_at": None,
        "resolution_note": None,
        "created_at": "2026-09-14 16:20:00",
    },
    # 3. RESOLVED (2 reports)
    {
        "report_id": 5,
        "reporter_id": 21,
        "target_type_id": 2,  # item
        "target_id": "24",  # school supplies
        "reason_id": 5,  # duplicate
        "description": "Identical school supplies pack was submitted twice in different category channels.",
        "status_id": 3,  # resolved
        "resolved_by": 5,
        "resolved_at": "2026-09-13 14:00:00",
        "resolution_note": "Confirmed accidental duplicate posting. Duplicate listing closed and owner notified on how to update quantities.",
        "created_at": "2026-09-13 10:00:00",
    },
    {
        "report_id": 6,
        "reporter_id": 22,
        "target_type_id": 1,  # user
        "target_id": "34",  # Monica Santiago
        "reason_id": 19,  # scam_fraud
        "description": "Account sent unsolicited external promotional links claiming free brand giveaways in exchange for phone numbers.",
        "status_id": 3,  # resolved
        "resolved_by": 5,
        "resolved_at": "2026-09-13 16:30:00",
        "resolution_note": "Confirmed unauthorized external promotional spamming. Account suspended for 30 days per community safety protocol.",
        "created_at": "2026-09-13 11:20:00",
    },
    # 4. DISMISSED (2 reports)
    {
        "report_id": 7,
        "reporter_id": 27,
        "target_type_id": 2,  # item
        "target_id": "27",  # cooking utensils
        "reason_id": 24,  # wrong_category
        "description": "Reporter thought stainless steel pots should be filed under Tools rather than Kitchenware.",
        "status_id": 4,  # dismissed
        "resolved_by": 5,
        "resolved_at": "2026-09-12 15:00:00",
        "resolution_note": "Reviewed. Item is appropriately listed under Kitchen & Home Essentials. No rule violation found.",
        "created_at": "2026-09-12 12:10:00",
    },
    {
        "report_id": 8,
        "reporter_id": 28,
        "target_type_id": 5,  # request
        "target_id": "14",  # pantry essentials
        "reason_id": 28,  # false_information
        "description": "Reporter questioned whether requester family is from Barangay Poblacion.",
        "status_id": 4,  # dismissed
        "resolved_by": 5,
        "resolved_at": "2026-09-12 17:00:00",
        "resolution_note": "Verified with community volunteer roster. Requester is a resident in need following typhoon rains. Dismissed.",
        "created_at": "2026-09-12 13:45:00",
    },
]


def seed_database(config):
    print(f"\n{'='*70}")
    print(f"Seeding All Admin Tabs on: {config['name']}")
    print(f"{'='*70}")

    kwargs = {
        "host": config["host"],
        "port": config["port"],
        "user": config["user"],
        "password": config["password"],
        "database": config["database"],
        "autocommit": False,
        "cursorclass": pymysql.cursors.DictCursor,
    }
    if config["ssl"]:
        kwargs["ssl"] = {"ssl_mode": "REQUIRED"}

    conn = pymysql.connect(**kwargs)
    try:
        with conn.cursor() as cur:
            cur.execute("SET FOREIGN_KEY_CHECKS=0;")

            # ----------------------------------------------------
            # 1. PRESERVE ADMIN (5) & JEHOSUE (14)
            # ----------------------------------------------------
            cur.execute("""
                UPDATE users SET account_status_id = 2, is_suspended = 0, is_trusted = 1
                WHERE user_id IN (5, 14)
            """)

            # ----------------------------------------------------
            # 2. UPSERT DEMO USERS
            # ----------------------------------------------------
            for u in DEMO_USERS:
                cur.execute("""
                    INSERT INTO users (user_id, email, password_hash, account_status_id, is_suspended, is_trusted, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, 1, '2026-09-12 20:17:00', '2026-09-12 20:17:00')
                    ON DUPLICATE KEY UPDATE
                        email = VALUES(email),
                        password_hash = VALUES(password_hash),
                        account_status_id = VALUES(account_status_id),
                        is_suspended = VALUES(is_suspended),
                        is_trusted = 1
                """, (u["user_id"], u["email"], u["password"], u["account_status_id"], u["is_suspended"]))

                cur.execute("""
                    INSERT INTO profiles (user_id, username, first_name, last_name, phone, address_line, barangay, municipality, province, created_at, updated_at)
                    VALUES (%s, %s, %s, %s, %s, 'Community Center Area', %s, %s, %s, '2026-09-12 20:17:00', '2026-09-12 20:17:00')
                    ON DUPLICATE KEY UPDATE
                        username = VALUES(username),
                        first_name = VALUES(first_name),
                        last_name = VALUES(last_name),
                        phone = VALUES(phone),
                        barangay = VALUES(barangay),
                        municipality = VALUES(municipality),
                        province = VALUES(province)
                """, (u["user_id"], u["username"], u["first_name"], u["last_name"], u["phone"], u["barangay"], u["municipality"], u["province"]))

                cur.execute("""
                    INSERT INTO user_roles (user_id, role_id, assigned_at)
                    VALUES (%s, %s, '2026-09-12 20:17:00')
                    ON DUPLICATE KEY UPDATE role_id = VALUES(role_id)
                """, (u["user_id"], u["role_id"]))

            # Clean up users that are not in the core allowed set
            all_valid_user_ids = [5, 14] + [u["user_id"] for u in DEMO_USERS]
            id_list_str = ",".join(map(str, all_valid_user_ids))
            cur.execute(f"DELETE FROM users WHERE user_id NOT IN ({id_list_str})")
            cur.execute(f"DELETE FROM profiles WHERE user_id NOT IN ({id_list_str})")
            cur.execute(f"DELETE FROM user_roles WHERE user_id NOT IN ({id_list_str})")

            # ----------------------------------------------------
            # 3. UPSERT USER SUSPENSIONS (for users 33 and 34)
            # ----------------------------------------------------
            cur.execute("DELETE FROM user_suspensions")
            for s in DEMO_SUSPENSIONS:
                cur.execute("""
                    INSERT INTO user_suspensions (user_id, suspended_by, reason, message, start_at, expires_at, status, created_at)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (s["user_id"], s["suspended_by"], s["reason"], s["message"], s["start_at"], s["expires_at"], s["status"], s["start_at"]))

            # ----------------------------------------------------
            # 4. UPSERT IDENTITY VERIFICATIONS (8 total: 2 each status)
            # ----------------------------------------------------
            cur.execute("DELETE FROM identity_verifications")
            for v in DEMO_VERIFICATIONS:
                cur.execute("""
                    INSERT INTO identity_verifications (
                        identity_verification_id, user_id, id_type_id, id_number, masked_id_number,
                        full_name_on_id, date_of_birth, expiration_date,
                        document_reference, facial_selfie_reference,
                        facial_verification_status_id, verification_status_id,
                        confidence_score, provider, reviewed_at, reviewed_by, submitted_at,
                        rejection_reason, retry_instructions
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    v["id"], v["user_id"], v["id_type_id"], v["id_number"], v["masked_id_number"],
                    v["full_name_on_id"], v["date_of_birth"], v["expiration_date"],
                    v["document_reference"], v["facial_selfie_reference"],
                    v["facial_verification_status_id"], v["verification_status_id"],
                    v["confidence_score"], v["provider"], v["reviewed_at"], v["reviewed_by"],
                    v["submitted_at"], v["rejection_reason"], v["retry_instructions"]
                ))

            # ----------------------------------------------------
            # 5. UPSERT POSTS / LISTINGS (10 active available + 2 removed = 12 total)
            # ----------------------------------------------------
            # Ensure items 24..33 remain active (available)
            cur.execute("UPDATE items SET item_status_id = 1 WHERE item_id BETWEEN 24 AND 33")

            for item in DEMO_REMOVED_ITEMS:
                # Location
                cur.execute("""
                    INSERT INTO item_locations (location_id, address_line, barangay, municipality, province, latitude, longitude, created_at)
                    VALUES (%s, %s, %s, 'San Fernando', 'La Union', 16.6150, 120.3210, '2026-09-12 10:00:00')
                    ON DUPLICATE KEY UPDATE address_line = VALUES(address_line), barangay = VALUES(barangay)
                """, (item["location_id"], item["location_address"], item["barangay"]))

                # Item
                cur.execute("""
                    INSERT INTO items (
                        item_id, owner_id, category_id, condition_id, item_type_id, item_status_id,
                        location_id, title, description, quantity, availability, views_count,
                        created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, '2026-09-14 10:00:00', '2026-09-14 10:00:00')
                    ON DUPLICATE KEY UPDATE
                        item_status_id = VALUES(item_status_id),
                        title = VALUES(title),
                        description = VALUES(description)
                """, (
                    item["item_id"], item["owner_id"], item["category_id"], item["condition_id"],
                    item["item_type_id"], item["item_status_id"], item["location_id"],
                    item["title"], item["description"], item["quantity"], item["availability"], item["views_count"]
                ))

                # Image
                cur.execute("""
                    INSERT INTO item_images (item_image_id, item_id, image_url, display_order, created_at)
                    VALUES (%s, %s, %s, 0, '2026-09-14 10:00:00')
                    ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)
                """, (item["image_id"], item["item_id"], item["image_url"]))

            # ----------------------------------------------------
            # 6. UPSERT REQUESTS (3 active + 2 cancelled = 5 total)
            # ----------------------------------------------------
            # Ensure requests 12, 13, 14 remain active
            cur.execute("UPDATE item_requests SET request_status_id = 1 WHERE request_id IN (12, 13, 14)")

            for req in DEMO_CANCELLED_REQUESTS:
                cur.execute("""
                    INSERT INTO item_locations (location_id, address_line, barangay, municipality, province, latitude, longitude, created_at)
                    VALUES (%s, %s, %s, 'San Fernando', 'La Union', 16.6120, 120.3180, '2026-09-12 10:00:00')
                    ON DUPLICATE KEY UPDATE address_line = VALUES(address_line), barangay = VALUES(barangay)
                """, (req["location_id"], req["location_address"], req["barangay"]))

                cur.execute("""
                    INSERT INTO item_requests (
                        request_id, user_id, category_id, urgency_id, request_status_id, location_id,
                        title, description, needed_before, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, '2026-09-14 11:00:00', '2026-09-14 11:00:00')
                    ON DUPLICATE KEY UPDATE
                        request_status_id = VALUES(request_status_id),
                        title = VALUES(title),
                        description = VALUES(description)
                """, (
                    req["request_id"], req["user_id"], req["category_id"], req["urgency_id"],
                    req["request_status_id"], req["location_id"], req["title"],
                    req["description"], req["needed_before"]
                ))

                cur.execute("""
                    INSERT INTO request_images (request_image_id, request_id, image_url, display_order, created_at)
                    VALUES (%s, %s, %s, 0, '2026-09-14 11:00:00')
                    ON DUPLICATE KEY UPDATE image_url = VALUES(image_url)
                """, (req["image_id"], req["request_id"], req["image_url"]))

            # ----------------------------------------------------
            # 7. UPSERT REPORTS (8 total: 2 each status)
            # ----------------------------------------------------
            cur.execute("DELETE FROM reports")
            for rep in DEMO_REPORTS:
                cur.execute("""
                    INSERT INTO reports (
                        report_id, reporter_id, target_type_id, target_id, reason_id,
                        description, status_id, resolved_by, resolved_at, resolution_note, created_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    rep["report_id"], rep["reporter_id"], rep["target_type_id"], rep["target_id"],
                    rep["reason_id"], rep["description"], rep["status_id"], rep["resolved_by"],
                    rep["resolved_at"], rep["resolution_note"], rep["created_at"]
                ))

            cur.execute("SET FOREIGN_KEY_CHECKS=1;")
            conn.commit()

            # ----------------------------------------------------
            # REPORT STATS VERIFICATION
            # ----------------------------------------------------
            print("\n[VERIFICATION COUNTERS]")
            
            # Approvals
            cur.execute("SELECT COUNT(*) as total FROM identity_verifications")
            v_all = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as cnt FROM identity_verifications WHERE verification_status_id = 1")
            v_pend = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM identity_verifications WHERE verification_status_id = 2")
            v_appr = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM identity_verifications WHERE verification_status_id = 4")
            v_retry = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM identity_verifications WHERE verification_status_id = 3")
            v_rej = cur.fetchone()["cnt"]
            print(f"Approvals Tab: Pending ({v_pend}), Approved ({v_appr}), Retry Required ({v_retry}), Rejected ({v_rej}), All ({v_all})")

            # Users
            cur.execute("SELECT COUNT(*) as total FROM users")
            u_all = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as cnt FROM users WHERE account_status_id = 1 AND is_suspended = 0")
            u_pend = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM users WHERE account_status_id = 2 AND is_suspended = 0")
            u_appr = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM users WHERE is_suspended = 1 OR account_status_id = 5")
            u_susp = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM users WHERE account_status_id = 3")
            u_rej = cur.fetchone()["cnt"]
            print(f"Users Tab: All Users ({u_all}), Pending ({u_pend}), Approved ({u_appr}), Suspended ({u_susp}), Rejected ({u_rej})")

            # Posts
            cur.execute("SELECT COUNT(*) as total FROM items")
            p_all = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as cnt FROM items WHERE item_status_id = 1")
            p_avail = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM items WHERE item_status_id = 7")
            p_rem = cur.fetchone()["cnt"]
            print(f"Posts Tab: All Listings ({p_all}), Active & Available ({p_avail}), Removed ({p_rem})")

            # Requests
            cur.execute("SELECT COUNT(*) as total FROM item_requests")
            r_all = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as cnt FROM item_requests WHERE request_status_id = 1")
            r_open = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM item_requests WHERE request_status_id = 4")
            r_canc = cur.fetchone()["cnt"]
            print(f"Requests Tab: All Requests ({r_all}), Active & Open ({r_open}), Removed / Cancelled ({r_canc})")

            # Reports
            cur.execute("SELECT COUNT(*) as total FROM reports")
            rep_all = cur.fetchone()["total"]
            cur.execute("SELECT COUNT(*) as cnt FROM reports WHERE status_id = 1")
            rep_pend = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM reports WHERE status_id IN (2, 6)")
            rep_ur = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM reports WHERE status_id = 3")
            rep_res = cur.fetchone()["cnt"]
            cur.execute("SELECT COUNT(*) as cnt FROM reports WHERE status_id = 4")
            rep_dism = cur.fetchone()["cnt"]
            print(f"Reports Tab: All Reports ({rep_all}), Pending ({rep_pend}), Under Review ({rep_ur}), Resolved ({rep_res}), Dismissed ({rep_dism})")

    except Exception as e:
        conn.rollback()
        print(f"ERROR on {config['name']}: {e}")
        raise e
    finally:
        conn.close()


if __name__ == "__main__":
    for c in CONFIGS:
        seed_database(c)
