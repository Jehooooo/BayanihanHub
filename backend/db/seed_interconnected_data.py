"""
Bayanihan Hub — Comprehensive Interconnected Mock Data Seeder
Populates all modules and categories in the active MySQL database while
strictly preserving existing user accounts, schema, UI, and features.
"""

import sys
import os
from datetime import datetime, date, timedelta

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import text
from app.db import SessionLocal
from app.routers.auth import hash_password


def run_seed():
    db = SessionLocal()
    try:
        print("[SEED] Starting Bayanihan Hub interconnected data seeding...")
        db.execute(text("SET FOREIGN_KEY_CHECKS = 0"))

        # =====================================================================
        # 1. ITEM CATEGORIES (All 13 Categories with Subcategory Descriptions)
        # =====================================================================
        categories_data = [
            (1, "clothing", "Clothing", "Shirt", "Daily wear, school uniforms, formal attire, shoes, and bags", 1),
            (2, "school-supplies", "School Supplies", "GraduationCap", "Backpacks, notebooks, calculators, art & drafting kits", 2),
            (3, "appliances", "Appliances", "Refrigerator", "Electric fans, rice cookers, kettles, blenders, and home appliances", 3),
            (4, "books", "Books", "BookOpen", "STEM textbooks, nursing reviewers, literature, and children's books", 4),
            (5, "toys", "Toys & Games", "Gamepad2", "Educational wooden blocks, LEGO sets, board games, and puzzles", 5),
            (6, "furniture", "Furniture", "Sofa", "Study desks, ergonomic chairs, bookshelves, and dining tables", 6),
            (7, "food", "Food & Pantry", "UtensilsCrossed", "Rice packs, canned goods, fresh harvest produce, and infant nutrition", 7),
            (8, "electronics", "Electronics", "Smartphone", "Student laptops, monitors, keyboards, webcams, and study gadgets", 8),
            (9, "tools", "Tools & Hardware", "Wrench", "Hand tool kits, cordless drills, carpentry tools, and repair gear", 9),
            (10, "other", "Others", "Package", "Musical instruments, emergency solar kits, handwoven textiles, and misc.", 10),
            (11, "sports", "Sports & Outdoors", "Dumbbell", "Basketballs, volleyballs, badminton sets, dumbbells, and cycling gear", 11),
            (12, "baby-kids", "Baby & Kids", "Baby", "Baby strollers, wooden cribs, carriers, sterilizers, and toddler gear", 12),
            (13, "health", "Health & Medical", "HeartPulse", "Wheelchairs, crutches, BP monitors, nebulizers, and first aid kits", 13),
        ]
        for cid, slug, name, icon, desc, order in categories_data:
            db.execute(
                text("""
                    INSERT INTO item_categories (category_id, slug, name, icon, description)
                    VALUES (:cid, :slug, :name, :icon, :desc)
                    ON DUPLICATE KEY UPDATE
                        slug = VALUES(slug),
                        name = VALUES(name),
                        icon = VALUES(icon),
                        description = VALUES(description)
                """),
                {"cid": cid, "slug": slug, "name": name, "icon": icon, "desc": desc},
            )
        print("[SEED] 13 item categories synced.")

        # =====================================================================
        # 2. USERS, PROFILES, ROLES, PREFERENCES, AVATARS, VERIFICATIONS, BADGES
        # =====================================================================
        default_pw_hash = hash_password("User@123")
        admin_pw_hash = hash_password("Admin@123")

        # Update existing core accounts' profiles so they have rich bios & addresses
        db.execute(
            text("""
                UPDATE profiles
                SET bio = 'System Administrator & Community Coordinator for Bayanihan Hub La Union.',
                    address_line = 'City Hall Complex, Quezon Ave',
                    barangay = 'Ili Norte',
                    municipality = 'San Juan',
                    province = 'La Union',
                    latitude = 16.67140000,
                    longitude = 120.34260000
                WHERE user_id = 5
            """)
        )
        db.execute(
            text("""
                UPDATE profiles
                SET bio = 'Full-stack developer, guitarist, and active Bayanihan Hub community organizer in Agoo & San Fernando.',
                    address_line = '42 MacArthur Highway',
                    barangay = 'San Nicolas Norte',
                    municipality = 'Agoo',
                    province = 'La Union',
                    latitude = 16.32280000,
                    longitude = 120.36440000
                WHERE user_id = 14
            """)
        )
        db.execute(
            text("""
                UPDATE profiles
                SET first_name = 'Bryan',
                    last_name = 'Beza',
                    bio = 'IT enthusiast and gadget donor sharing refurbished laptops and monitors with students.',
                    address_line = '88 National Highway',
                    barangay = 'Catbangen',
                    municipality = 'City of San Fernando',
                    province = 'La Union',
                    latitude = 16.61220000,
                    longitude = 120.31550000
                WHERE user_id = 35
            """)
        )
        db.execute(
            text("""
                UPDATE profiles
                SET first_name = 'Trisha',
                    last_name = 'Mae',
                    bio = 'Culinary student and home cook in San Fernando who loves bartering kitchenware and books.',
                    address_line = '19 Ortega Street',
                    barangay = 'Barangay I (Poblacion)',
                    municipality = 'City of San Fernando',
                    province = 'La Union',
                    latitude = 16.61680000,
                    longitude = 120.31980000
                WHERE user_id = 48
            """)
        )

        # Clear user_roles for community users before re-assigning exact role IDs (1=admin, 2=user)
        db.execute(text("DELETE FROM user_roles WHERE user_id IN (6, 7, 8, 9, 10, 11, 12, 13, 15, 16, 19, 20, 35, 48)"))
        db.execute(text("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (5, 1), (5, 2), (14, 1), (14, 2), (35, 2), (48, 2)"))

        community_users = [
            # (user_id, email, pw_hash, status_id, is_susp, is_trusted, username, fname, mname, lname, phone, bio, addr, brgy, muni, prov, lat, lng, roles)
            (
                6, "maria.santos@bayanihan.ph", default_pw_hash, 2, 0, 1,
                "maria_santos", "Maria", "Reyes", "Santos", "09172010006",
                "Public school teacher and community pantry volunteer donating uniforms, books, and fresh backyard harvest.",
                "24 Gov. Lucero Street", "Lingsat", "City of San Fernando", "La Union", 16.63310000, 120.31250000, [2]
            ),
            (
                7, "juan.delacruz@bayanihan.ph", default_pw_hash, 2, 0, 1,
                "juan_delacruz", "Juan", "Pascual", "Dela Cruz", "09172010007",
                "Civil engineering student at DMMMSU sharing drafting supplies and seeking study references.",
                "112 Mabini Street", "Catbangen", "City of San Fernando", "La Union", 16.60950000, 120.31420000, [2]
            ),
            (
                8, "carlo.mendoza@bayanihan.ph", default_pw_hash, 2, 0, 1,
                "carlo_mendoza", "Carlo", "Lopez", "Mendoza", "09172010008",
                "Fitness coach and DIY woodworker active in community tool and sports gear exchanges.",
                "56 Pennsylvania Avenue", "Parian", "City of San Fernando", "La Union", 16.59780000, 120.31940000, [2]
            ),
            (
                9, "elena.reyes@bayanihan.ph", default_pw_hash, 2, 0, 1,
                "elena_reyes", "Elena", "Gomez", "Reyes", "09172010009",
                "Mother of two in San Juan exchanging outgrown baby cribs and toddler gear with fellow parents.",
                "14 Surf Beach Road", "Urbiztondo", "San Juan", "La Union", 16.66120000, 120.32480000, [2]
            ),
            (
                10, "roberto.garcia@bayanihan.ph", default_pw_hash, 2, 0, 1,
                "roberto_garcia", "Roberto", "Diaz", "Garcia", "09172010010",
                "Master carpenter and cycling enthusiast donating handcrafted study desks and household appliances.",
                "78 National Highway", "Central East", "Bauang", "La Union", 16.52840000, 120.33290000, [2]
            ),
            (
                11, "angela.villanueva@bayanihan.ph", default_pw_hash, 2, 0, 1,
                "angela_v", "Angela", "Cruz", "Villanueva", "09172010011",
                "Registered nurse donating medical mobility aids, nursing textbooks, and baby essentials.",
                "33 Diversion Road", "Sevilla", "City of San Fernando", "La Union", 16.60410000, 120.32370000, [2]
            ),
            (
                12, "mark.soriano@bayanihan.ph", default_pw_hash, 5, 1, 0,
                "mark_soriano", "Mark", "Tan", "Soriano", "09172010012",
                "Community member in Pagdalagan.",
                "90 Coastal Road", "Pagdalagan", "City of San Fernando", "La Union", 16.57890000, 120.32100000, [2]
            ),
            (
                13, "luisa.castro@bayanihan.ph", default_pw_hash, 2, 0, 1,
                "luisa_castro", "Luisa", "Flores", "Castro", "09172010013",
                "Barangay health volunteer organizing disaster preparedness kits and blood pressure monitors.",
                "15 Marcos Highway", "San Nicolas Norte", "Agoo", "La Union", 16.32410000, 120.36620000, [2]
            ),
            (
                15, "ramon.bautista@bayanihan.ph", default_pw_hash, 1, 0, 0,
                "ramon_bautista", "Ramon", "Aquino", "Bautista", "09172010015",
                "Local fisherman and community volunteer applying for neighborhood verification.",
                "41 Brgy Road", "Ili Norte", "San Juan", "La Union", 16.67300000, 120.34100000, [2]
            ),
            (
                16, "patricia.aquino@bayanihan.ph", default_pw_hash, 1, 0, 0,
                "patricia_aquino", "Patricia", "Ramos", "Aquino", "09172010016",
                "College librarian in Bauang excited to share educational books once verified.",
                "62 P. Burgos Street", "Central West", "Bauang", "La Union", 16.52690000, 120.33010000, [2]
            ),
            (
                19, "student1@bayanihanhub.com", admin_pw_hash, 2, 0, 1,
                "student_admin1", "Student", "One", "Admin", "09172010019",
                "Student Moderator assisting with community approvals and listing reviews.",
                "10 Campus Ave", "Catbangen", "City of San Fernando", "La Union", 16.61400000, 120.31700000, [1, 2]
            ),
            (
                20, "student2@bayanihanhub.com", admin_pw_hash, 2, 0, 1,
                "student_admin2", "Student", "Two", "Admin", "09172010020",
                "Student Moderator supporting neighborhood safety and request verification.",
                "12 Campus Ave", "Catbangen", "City of San Fernando", "La Union", 16.61450000, 120.31750000, [1, 2]
            ),
        ]

        for (
            uid, email, pwh, st_id, is_susp, is_trust,
            uname, fname, mname, lname, phone, bio, addr, brgy, muni, prov, lat, lng, roles
        ) in community_users:
            db.execute(
                text("""
                    INSERT INTO users (user_id, email, password_hash, account_status_id, is_suspended, is_trusted, created_at, updated_at, last_active_at)
                    VALUES (:uid, :email, :pwh, :st_id, :is_susp, :is_trust, NOW() - INTERVAL 45 DAY, NOW(), NOW() - INTERVAL 2 HOUR)
                    ON DUPLICATE KEY UPDATE
                        email = VALUES(email),
                        account_status_id = VALUES(account_status_id),
                        is_suspended = VALUES(is_suspended),
                        is_trusted = VALUES(is_trusted)
                """),
                {"uid": uid, "email": email, "pwh": pwh, "st_id": st_id, "is_susp": is_susp, "is_trust": is_trust},
            )
            db.execute(
                text("""
                    INSERT INTO profiles (user_id, username, first_name, middle_name, last_name, phone, bio, address_line, barangay, municipality, province, latitude, longitude)
                    VALUES (:uid, :uname, :fname, :mname, :lname, :phone, :bio, :addr, :brgy, :muni, :prov, :lat, :lng)
                    ON DUPLICATE KEY UPDATE
                        username = VALUES(username),
                        first_name = VALUES(first_name),
                        middle_name = VALUES(middle_name),
                        last_name = VALUES(last_name),
                        phone = VALUES(phone),
                        bio = VALUES(bio),
                        address_line = VALUES(address_line),
                        barangay = VALUES(barangay),
                        municipality = VALUES(municipality),
                        province = VALUES(province),
                        latitude = VALUES(latitude),
                        longitude = VALUES(longitude)
                """),
                {
                    "uid": uid, "uname": uname, "fname": fname, "mname": mname, "lname": lname,
                    "phone": phone, "bio": bio, "addr": addr, "brgy": brgy, "muni": muni, "prov": prov,
                    "lat": lat, "lng": lng,
                },
            )
            for rid in roles:
                db.execute(
                    text("INSERT IGNORE INTO user_roles (user_id, role_id) VALUES (:uid, :rid)"),
                    {"uid": uid, "rid": rid},
                )
            db.execute(
                text("INSERT IGNORE INTO notification_preferences (user_id) VALUES (:uid)"),
                {"uid": uid},
            )

        # Ensure notification_preferences for existing users too
        for existing_uid in [5, 14, 35, 48]:
            db.execute(
                text("INSERT IGNORE INTO notification_preferences (user_id) VALUES (:uid)"),
                {"uid": existing_uid},
            )

        # Profile Pictures (Approved active avatars + 2 Pending photo approvals for Admin Queue)
        db.execute(text("DELETE FROM profile_pictures"))
        avatars_data = [
            (1, 5, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            (2, 6, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            (3, 7, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            (4, 8, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            (5, 10, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            (6, 11, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            (7, 14, "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            (8, 35, "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            (9, 48, "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80", 2, 1, None, 5),
            # 2 Pending Profile Picture Submissions for Admin Approvals Queue
            (10, 9, "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80", 1, 0, None, None),
            (11, 13, "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80", 1, 0, None, None),
        ]
        for pp_id, uid, url, st_id, is_act, rej, rev_by in avatars_data:
            db.execute(
                text("""
                    INSERT INTO profile_pictures (profile_picture_id, user_id, file_reference, status_id, is_active, rejection_reason, submitted_at, reviewed_at, reviewed_by)
                    VALUES (:pp_id, :uid, :url, :st_id, :is_act, :rej, NOW() - INTERVAL 5 DAY, CASE WHEN :st_id = 2 THEN NOW() - INTERVAL 4 DAY ELSE NULL END, :rev_by)
                """),
                {"pp_id": pp_id, "uid": uid, "url": url, "st_id": st_id, "is_act": is_act, "rej": rej, "rev_by": rev_by},
            )

        # Identity Verifications (Preserve existing 14, 35, 48; add Approved for 6..11, 13 + 2 Pending for 15, 16)
        db.execute(text("DELETE FROM identity_verifications WHERE user_id NOT IN (14, 35, 48)"))
        verifications_data = [
            (101, 6, 1, "1234-5678-9012-0006", "****-****-****-0006", "Maria Reyes Santos", "1985-04-12", "2030-04-12", 2, 2, 96, 5),
            (102, 7, 6, "2023-10492-SF", "****-***92-SF", "Juan Pascual Dela Cruz", "2003-09-18", "2027-06-30", 2, 2, 95, 5),
            (103, 8, 3, "B01-19-004821", "***-**-**4821", "Carlo Lopez Mendoza", "1992-11-05", "2029-11-05", 2, 2, 94, 5),
            (104, 9, 4, "PRN-8841-2024-09", "****-****-2024-09", "Elena Gomez Reyes", "1994-02-22", "2028-02-22", 2, 2, 93, 5),
            (105, 10, 1, "1234-5678-9012-0010", "****-****-****-0010", "Roberto Diaz Garcia", "1978-07-30", "2031-07-30", 2, 2, 97, 5),
            (106, 11, 2, "P8492014B", "*****014B", "Angela Cruz Villanueva", "1990-12-14", "2032-12-14", 2, 2, 98, 5),
            (107, 13, 5, "SSS-01-4492018-3", "***-**-***2018-3", "Luisa Flores Castro", "1983-06-08", "2030-06-08", 2, 2, 95, 5),
            # 2 Pending Identity Verification Applications for Admin Queue
            (108, 15, 1, "1234-5678-9012-0015", "****-****-****-0015", "Ramon Aquino Bautista", "1988-03-19", "2031-03-19", 2, 1, 91, None),
            (109, 16, 4, "PRN-9920-2025-16", "****-****-2025-16", "Patricia Ramos Aquino", "1996-08-25", "2028-08-25", 2, 1, 92, None),
        ]
        for vid, uid, id_type, id_num, masked_num, full_name, dob, exp_dt, f_st, v_st, conf, rev_by in verifications_data:
            db.execute(
                text("""
                    INSERT INTO identity_verifications (
                        identity_verification_id, user_id, id_type_id, id_number, masked_id_number,
                        full_name_on_id, date_of_birth, expiration_date, document_reference,
                        facial_selfie_reference, facial_verification_status_id, verification_status_id,
                        confidence_score, provider, submitted_at, reviewed_at, reviewed_by
                    )
                    VALUES (
                        :vid, :uid, :id_type, :id_num, :masked_num,
                        :full_name, :dob, :exp_dt,
                        'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=80',
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
                        :f_st, :v_st, :conf, 'BayanihanHub-Biometric-Engine',
                        NOW() - INTERVAL 3 DAY,
                        CASE WHEN :v_st = 2 THEN NOW() - INTERVAL 2 DAY ELSE NULL END,
                        :rev_by
                    )
                """),
                {
                    "vid": vid, "uid": uid, "id_type": id_type, "id_num": id_num,
                    "masked_num": masked_num, "full_name": full_name, "dob": dob,
                    "exp_dt": exp_dt, "f_st": f_st, "v_st": v_st, "conf": conf, "rev_by": rev_by,
                },
            )

        # User Badges (Active badges for contributors + 1 revoked historical badge)
        db.execute(text("DELETE FROM user_badges"))
        user_badges_data = [
            (6, 1, 5, "Verified community educator and pantry organizer", "active", None),
            (6, 3, 5, "Donated school uniforms, toys, and family relief packs", "active", None),
            (7, 1, 5, "Verified student neighbor", "active", None),
            (8, 1, 5, "Verified neighbor", "active", None),
            (8, 4, 5, "Completed multiple fair tool and furniture exchanges", "active", None),
            (9, 1, 5, "Verified neighbor", "active", None),
            (10, 1, 5, "Verified neighbor", "active", None),
            (10, 3, 5, "Donated handcrafted study furniture, appliances, and infant nutrition", "active", None),
            (10, 5, 5, "Rapidly fulfilled urgent infant formula request in San Juan", "active", None),
            (11, 1, 5, "Verified healthcare professional", "active", None),
            (11, 3, 5, "Donated wheelchair, crutches, and nursing review books", "active", None),
            (11, 5, 5, "Fulfilled critical nursing textbook request for student", "active", None),
            (13, 1, 5, "Verified barangay health volunteer", "active", None),
            (14, 1, 5, "Verified platform builder & community donor", "active", None),
            (14, 4, 5, "Completed multiple 5-star community barter exchanges", "active", None),
            (14, 2, 5, "Test badge revocation audit trail", "revoked", datetime.now() - timedelta(days=2)),
            (35, 1, 5, "Verified tech donor", "active", None),
            (35, 3, 5, "Donated student laptop and computer peripherals", "active", None),
            (48, 1, 5, "Verified community member", "active", None),
        ]
        for uid, bid, aw_by, reason, st, rev_at in user_badges_data:
            db.execute(
                text("""
                    INSERT INTO user_badges (user_id, badge_id, earned_at, awarded_by, reason, status, revoked_at)
                    VALUES (:uid, :bid, NOW() - INTERVAL 15 DAY, :aw_by, :reason, :st, :rev_at)
                """),
                {"uid": uid, "bid": bid, "aw_by": aw_by, "reason": reason, "st": st, "rev_at": rev_at},
            )
        print("[SEED] 16 users, profiles, avatars, verifications, and badges synced.")

        # =====================================================================
        # 3. ITEMS (35 Unique Items across ALL 13 Categories: 20 Donations, 15 Exchanges)
        # =====================================================================
        # Clear dependent item tables cleanly and repopulate deterministic IDs
        db.execute(text("DELETE FROM saved_items"))
        db.execute(text("DELETE FROM item_pickup_options"))
        db.execute(text("DELETE FROM item_images"))
        db.execute(text("DELETE FROM exchange_items"))
        db.execute(text("DELETE FROM items"))
        db.execute(text("DELETE FROM item_requests"))
        db.execute(text("DELETE FROM request_images"))
        db.execute(text("DELETE FROM item_locations"))

        # Insert 45 locations (35 for items: 101..135, 10 for requests: 201..210)
        locations_pool = [
            ("42 MacArthur Highway", "San Nicolas Norte", "Agoo", "La Union", "2504", 16.3228, 120.3644),
            ("24 Gov. Lucero Street", "Lingsat", "City of San Fernando", "La Union", "2500", 16.6331, 120.3125),
            ("112 Mabini Street", "Catbangen", "City of San Fernando", "La Union", "2500", 16.6095, 120.3142),
            ("56 Pennsylvania Avenue", "Parian", "City of San Fernando", "La Union", "2500", 16.5978, 120.3194),
            ("14 Surf Beach Road", "Urbiztondo", "San Juan", "La Union", "2514", 16.6612, 120.3248),
            ("78 National Highway", "Central East", "Bauang", "La Union", "2501", 16.5284, 120.3329),
            ("33 Diversion Road", "Sevilla", "City of San Fernando", "La Union", "2500", 16.6041, 120.3237),
            ("90 Coastal Road", "Pagdalagan", "City of San Fernando", "La Union", "2500", 16.5789, 120.3210),
            ("15 Marcos Highway", "San Nicolas Norte", "Agoo", "La Union", "2504", 16.3241, 120.3662),
            ("88 National Highway", "Catbangen", "City of San Fernando", "La Union", "2500", 16.6122, 120.3155),
            ("19 Ortega Street", "Barangay I (Poblacion)", "City of San Fernando", "La Union", "2500", 16.6168, 120.3198),
        ]

        user_loc_map = {
            14: locations_pool[0],
            6: locations_pool[1],
            7: locations_pool[2],
            8: locations_pool[3],
            9: locations_pool[4],
            10: locations_pool[5],
            11: locations_pool[6],
            12: locations_pool[7],
            13: locations_pool[8],
            35: locations_pool[9],
            48: locations_pool[10],
        }

        # (item_id, owner_id, cat_id, cond_id, type_id, status_id, title, description, qty, avail, views, img_url, days_ago)
        # type_id: 1 = donation, 2 = exchange
        # status_id: 1 = available, 2 = reserved, 3 = exchanged, 4 = donated, 7 = removed
        items_data = [
            # --- 1. CLOTHING (cat_id = 1) ---
            (
                24, 14, 1, 2, 1, 1,
                "Men's Casual Jackets & Polo Shirts Bundle (5 Pcs)",
                "Clean, freshly laundered men's medium casual jackets and collared polo shirts. Great for college students or job interviews.",
                5, "Weekdays after 5PM or Weekends", 42,
                "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&auto=format&fit=crop&q=80", 18
            ),
            (
                25, 6, 1, 2, 1, 1,
                "Complete High School Uniform Set — Boys Medium (3 Pairs)",
                "Three pairs of white polo shirts and navy blue slacks for junior high school students. No stains or tears, ready to wear.",
                3, "Afternoons 3PM - 6PM", 37,
                "https://images.unsplash.com/photo-1604671801908-6f0c6a092c05?w=600&auto=format&fit=crop&q=80", 16
            ),
            (
                38, 11, 1, 1, 2, 1,
                "Filipiniana Bolero & Barong Tagalog Formal Attire Set",
                "Worn only once for a graduation ceremony. Includes embroidered Piña-style Barong (Large) and Mestiza bolero (Medium).\n\nLooking for: Heavy-duty fabric shears, sewing organizer box, or hospital scrubs (Medium)",
                2, "Weekends 9AM - 5PM", 29,
                "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80", 11
            ),

            # --- 2. SCHOOL SUPPLIES (cat_id = 2) ---
            (
                26, 14, 2, 2, 1, 1,
                "Casio fx-991ES Plus Scientific Calculator & Geometry Compass Set",
                "Fully functional natural-display scientific calculator with slide-on hard case, metal compass, protractor, and triangle rulers.",
                1, "Anytime in Agoo or San Fernando", 64,
                "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80", 17
            ),
            (
                33, 8, 2, 1, 1, 1,
                "Waterproof Elementary School Backpack, Crayons & 10 Spiral Notebooks",
                "Brand new ergonomic school bag loaded with 10 ruled composition notebooks, 24-color crayons, pencils, and plastic envelope.",
                1, "Daily 8AM - 6PM", 51,
                "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80", 14
            ),
            (
                39, 7, 2, 2, 2, 1,
                "Architectural Drafting Table Board (20x24), Acrylic T-Square & Tech Pens",
                "Portable wooden drawing board with 24-inch acrylic T-square, Staedtler technical pens (0.1, 0.3, 0.5), and canister tube.\n\nLooking for: USB Condenser Microphone or 1080p Webcam for online thesis defense",
                1, "Weekdays after 4PM", 33,
                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&auto=format&fit=crop&q=80", 9
            ),

            # --- 3. APPLIANCES (cat_id = 3) ---
            (
                27, 10, 3, 3, 1, 1,
                "Standard 16-Inch Oscillating Stand Fan & 1.8L Rice Cooker",
                "Both appliances are in great working condition. Ideal for a family recovering from typhoon damage or students moving into a dorm.",
                2, "Saturdays & Sundays", 78,
                "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80", 15
            ),
            (
                40, 14, 3, 2, 2, 3,  # exchanged in Exchange #6
                "Heavy-Duty Glass Blender (1.5L) & Stainless Electric Kettle Combo",
                "Oster 5-speed glass jar blender and 1.7L auto-shutoff electric kettle. Both tested and spotless.\n\nLooking for: 24-inch IPS Computer Monitor or Mechanical Keyboard",
                2, "Flexible meetup", 49,
                "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop&q=80", 20
            ),
            (
                62, 48, 3, 2, 2, 2,  # reserved in Exchange #10
                "Portable Single-Burner Touch Induction Cooker with Stainless Pot",
                "Energy-saving 2000W induction stove with timer control and compatible stainless steel soup pot.\n\nLooking for: HD Webcam and Noise-Cancelling USB Headset for online culinary classes",
                1, "Weekdays 1PM - 6PM", 38,
                "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&auto=format&fit=crop&q=80", 7
            ),

            # --- 4. BOOKS (cat_id = 4) ---
            (
                31, 14, 4, 3, 1, 1,
                "Senior High STEM & College Engineering Mathematics Textbooks (4 Vols)",
                "Includes Calculus by Stewart, University Physics, Differential Equations, and General Chemistry. Clean pages with plastic covers.",
                4, "Weekdays after 5PM", 55,
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80", 15
            ),
            (
                32, 14, 4, 2, 2, 1,
                "Philippine Literature, Noli Me Tangere & Classic Hardcover Novels Set",
                "Six well-preserved volumes including Rizal's Noli Me Tangere & El Filibusterismo, Nick Joaquin stories, and world classics.\n\nLooking for: Handwoven Inabel Blankets, Iloko Table Runners, or Acoustic Guitar Strings",
                6, "Weekends in Agoo or San Fernando", 46,
                "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80", 12
            ),
            (
                41, 11, 4, 2, 1, 4,  # donated in Exchange #7 / Request #19
                "Complete Nursing & Anatomy Board Exam Review Books (5th Ed.)",
                "Brunner & Suddarth's Medical-Surgical Nursing and Marieb Human Anatomy & Physiology with Saunders NCLEX reviewer.",
                3, "Afternoons at Sevilla", 61,
                "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80", 19
            ),

            # --- 5. TOYS & GAMES (cat_id = 5) ---
            (
                42, 6, 5, 2, 1, 1,
                "Wooden Educational Alphabet Blocks, Magnetic Chess & Scrabble Board",
                "Complete family and classroom play bundle. All letter tiles and magnetic chess pieces are complete and sanitized.",
                3, "Weekdays 3PM - 6PM", 34,
                "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80", 11
            ),
            (
                43, 35, 5, 2, 2, 1,
                "LEGO Classic Creative Brick Box (484 Pieces) with Storage Tub",
                "Genuine LEGO Classic set with wheels, windows, baseplates, and idea booklet in its yellow brick storage container.\n\nLooking for: Laptop Cooling Pad, USB-C Hub, or Desk Lamp",
                1, "Weekends at Catbangen", 47,
                "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=600&auto=format&fit=crop&q=80", 8
            ),

            # --- 6. FURNITURE (cat_id = 6) ---
            (
                44, 10, 6, 3, 1, 1,
                "Solid Narra Wood Study Desk & Ergonomic Mesh Task Chair",
                "Sturdy 120cm wooden study table with two drawers paired with an adjustable swivel mesh chair. Ideal for students.",
                2, "Pickup in Bauang (can help load)", 69,
                "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&auto=format&fit=crop&q=80", 10
            ),
            (
                45, 8, 6, 2, 2, 3,  # exchanged in Exchange #5
                "4-Tier Solid Pine Bookshelf & Foldable Space-Saving Dining Table",
                "Handcrafted varnished pine bookshelf and 4-seater folding dining table.\n\nLooking for: Complete Household Hand Tool & Socket Wrench Kit",
                2, "Weekends", 58,
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80", 24
            ),

            # --- 7. FOOD & PANTRY (cat_id = 7) ---
            (
                34, 6, 7, 1, 1, 1,
                "Family Pantry Relief Pack (10kg Sinandomeng Rice, Canned Goods & Oats)",
                "Sealed 10kg sack of freshly milled rice, 12 cans of sardines and corned beef, 1kg rolled oats, and munggo beans (expiry 2027).",
                1, "Daily 8AM - 5PM at Lingsat", 83,
                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80", 13
            ),
            (
                46, 6, 7, 1, 2, 3,  # exchanged in Exchange #9
                "Fresh Backyard Harvest: 8kg Sweet Carabao Mangoes, Guyabano & Tablea",
                "Tree-ripened La Union Carabao mangoes, two large organic guyabanos, and 10 packs of pure homemade cacao tablea.\n\nLooking for: Acoustic Guitar for school music club or Ukulele",
                1, "Weekends", 52,
                "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80", 16
            ),
            (
                47, 10, 7, 1, 1, 4,  # donated in Exchange #8 / Request #20
                "Infant Formula Milk (0–6 Months, 3 Sealed 800g Cans) & Baby Cereal",
                "Three unopened, factory-sealed cans of stage-1 infant milk formula (expiry Nov 2027) plus two boxes of infant rice cereal.",
                5, "Anytime for urgent family need", 67,
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80", 14
            ),

            # --- 8. ELECTRONICS (cat_id = 8) ---
            (
                48, 35, 8, 3, 1, 1,
                "Lenovo ThinkPad T480 Laptop (Core i5, 8GB RAM, 256GB SSD) for Students",
                "Refurbished business-grade laptop with Windows 11 Pro, MS Office, working webcam, charger, and 4-hour battery life.",
                1, "Weekdays 5PM - 8PM or Weekends", 112,
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80", 6
            ),
            (
                49, 35, 8, 2, 2, 3,  # exchanged in Exchange #6
                "24-Inch Full HD IPS LED Monitor (HDMI) & Tactile Mechanical Keyboard",
                "Frameless 1080p 75Hz IPS monitor with HDMI cable plus hot-swappable brown-switch mechanical keyboard.\n\nLooking for: Heavy-Duty Kitchen Blender and Electric Kettle for home",
                2, "Flexible", 74,
                "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80", 21
            ),
            (
                63, 7, 8, 2, 2, 2,  # reserved in Exchange #10
                "Logitech C920 HD Pro Webcam & Noise-Cancelling USB Headset",
                "Crystal-clear 1080p autofocus webcam and padded USB headset with flip-to-mute microphone.\n\nLooking for: Portable Single-Burner Induction Cooker for dorm room",
                2, "Weekdays after 4PM", 41,
                "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=600&auto=format&fit=crop&q=80", 7
            ),

            # --- 9. TOOLS & HARDWARE (cat_id = 9) ---
            (
                50, 10, 9, 2, 2, 3,  # exchanged in Exchange #5
                "Stanley 65-Piece Household Hand Tool & Ratchet Socket Wrench Kit",
                "Chrome-vanadium socket set, claw hammer, pliers, adjustable wrench, tape measure, and screwdrivers in molded case.\n\nLooking for: Wooden Bookshelf or Folding Dining Table",
                1, "Weekends", 63,
                "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600&auto=format&fit=crop&q=80", 25
            ),
            (
                51, 8, 9, 2, 2, 1,
                "Bosch 12V Cordless Drill Driver Kit with Two Li-Ion Batteries & Bits",
                "Variable-speed cordless drill/driver with charger, two 2.0Ah battery packs, and 30 wood/metal/masonry drill bits.\n\nLooking for: Heavy-Duty 20m Extension Cord Reel or Solar Outdoor Floodlight",
                1, "Daily 10AM - 6PM", 54,
                "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80", 5
            ),

            # --- 10. OTHERS (cat_id = 10) ---
            (
                52, 13, 10, 1, 1, 1,
                "Emergency Solar Lantern, Heavy-Duty Rain Ponchos & AM/FM Dynamo Radio",
                "Typhoon preparedness kit with USB solar rechargeable lantern, hand-crank weather radio, whistle, and 2 waterproof ponchos.",
                1, "Daily at Agoo Municipal Plaza", 48,
                "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&auto=format&fit=crop&q=80", 9
            ),
            (
                53, 14, 10, 2, 2, 3,  # exchanged in Exchange #9
                "Yamaha F310 Acoustic Folk Guitar with Padded Gig Bag & Capo",
                "Warm-sounding spruce top acoustic guitar with newly installed phosphor bronze strings, padded backpack case, and clip-on tuner.\n\nLooking for: Fresh local farm fruits, organic mangoes, or native cacao tablea",
                1, "Weekends", 68,
                "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80", 16
            ),
            (
                57, 6, 10, 1, 2, 1,
                "Handwoven Bangar Inabel Cotton Blankets (2 Pcs) & Iloko Table Runners",
                "Authentic loom-woven Abel Iloko blankets and geometric table runners crafted by local weavers.\n\nLooking for: Philippine Literature Books, Rizal Novels, or Hardcover Classics for school library",
                4, "Weekends in San Fernando", 44,
                "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600&auto=format&fit=crop&q=80", 4
            ),

            # --- 11. SPORTS & OUTDOORS (cat_id = 11) ---
            (
                54, 8, 11, 2, 1, 1,
                "Molten Size 7 Basketball, Mikasa Volleyball & 2 Badminton Rackets",
                "Complete barangay youth sports pack including an inflating pump, net bag, and 1 tube of feather shuttlecocks.",
                4, "Afternoons at Parian", 59,
                "https://images.unsplash.com/photo-1519861531473-9200262188bf?w=600&auto=format&fit=crop&q=80", 10
            ),
            (
                58, 8, 11, 2, 2, 1,
                "Adjustable Cast-Iron Dumbbell Set (20kg Total) with Non-Slip Yoga Mat",
                "Two chrome spinlock bars with cast-iron weight plates (4x2.5kg, 4x1.25kg, 4x0.5kg) and 8mm TPE exercise mat.\n\nLooking for: Mountain Bike Helmet, Cycling Gloves, or Rechargeable Bike Light",
                1, "Daily 9AM - 7PM", 45,
                "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80", 3
            ),
            (
                59, 10, 11, 2, 2, 1,
                "GIRO Adult Mountain Bike Helmet (M/L), Gel Cycling Gloves & USB Tail Light",
                "Ventilated trail helmet with MIPS liner, breathable half-finger gloves, and waterproof rechargeable LED bike light.\n\nLooking for: Adjustable Cast-Iron Dumbbells or Home Workout Set",
                3, "Weekends in Bauang or San Fernando", 36,
                "https://images.unsplash.com/photo-1557803175-2f8c4e1c2b20?w=600&auto=format&fit=crop&q=80", 3
            ),

            # --- 12. BABY & KIDS (cat_id = 12) ---
            (
                55, 11, 12, 2, 1, 1,
                "Lightweight Foldable Baby Stroller, Ergonomic Carrier & Bottle Sterilizer",
                "One-hand fold travel stroller with sun canopy, breathable baby carrier wrap, and electric steam bottle sterilizer.",
                3, "Weekends at Sevilla", 53,
                "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&auto=format&fit=crop&q=80", 8
            ),
            (
                60, 9, 12, 2, 2, 1,
                "Convertible Solid Wood Baby Crib with Hypoallergenic Foam Mattress",
                "Three-level adjustable baby crib with teething rails, mosquito net stand, and waterproof fitted mattress.\n\nLooking for: Toddler Tricycle, Foam Playpen Mat, or High Chair Booster Seat",
                1, "Daily in San Juan", 41,
                "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&auto=format&fit=crop&q=80", 6
            ),

            # --- 13. HEALTH & MEDICAL (cat_id = 13) ---
            (
                56, 11, 13, 2, 1, 1,
                "Standard Folding Wheelchair (Steel Frame) & Adjustable Aluminum Crutches",
                "Clean, sanitized folding wheelchair with footrests and a pair of height-adjustable underarm crutches for patient recovery.",
                2, "Anytime for urgent medical need", 79,
                "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80", 12
            ),
            (
                61, 13, 13, 1, 1, 1,
                "Omron Digital Upper-Arm Blood Pressure Monitor, Oximeter & First Aid Kit",
                "Validated automatic BP monitor with universal cuff, fingertip pulse oximeter, and stocked family trauma first-aid kit.",
                3, "Daily at Agoo", 49,
                "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=600&auto=format&fit=crop&q=80", 5
            ),
            (
                64, 12, 13, 4, 1, 7,  # removed (status_id = 7) via Report #1
                "Unverified Unlabeled Herbal Supplement Capsules (10 Bottles)",
                "Unlabeled loose herbal capsules without FDA registration or expiration dates.",
                10, "Anytime", 12,
                "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80", 11
            ),
        ]

        for idx, (
            iid, owner_id, cat_id, cond_id, type_id, status_id,
            title, desc, qty, avail, views, img_url, days_ago
        ) in enumerate(items_data, start=1):
            loc_id = 100 + idx
            addr, brgy, muni, prov, pcode, lat, lng = user_loc_map.get(owner_id, locations_pool[0])
            db.execute(
                text("""
                    INSERT INTO item_locations (location_id, address_line, barangay, municipality, province, postal_code, latitude, longitude)
                    VALUES (:loc_id, :addr, :brgy, :muni, :prov, :pcode, :lat, :lng)
                """),
                {"loc_id": loc_id, "addr": addr, "brgy": brgy, "muni": muni, "prov": prov, "pcode": pcode, "lat": lat, "lng": lng},
            )
            db.execute(
                text("""
                    INSERT INTO items (
                        item_id, owner_id, category_id, condition_id, item_type_id, item_status_id,
                        location_id, title, description, quantity, availability, views_count, created_at, updated_at
                    )
                    VALUES (
                        :iid, :owner_id, :cat_id, :cond_id, :type_id, :status_id,
                        :loc_id, :title, :desc, :qty, :avail, :views,
                        NOW() - INTERVAL :days_ago DAY, NOW() - INTERVAL 1 DAY
                    )
                """),
                {
                    "iid": iid, "owner_id": owner_id, "cat_id": cat_id, "cond_id": cond_id,
                    "type_id": type_id, "status_id": status_id, "loc_id": loc_id,
                    "title": title, "desc": desc, "qty": qty, "avail": avail,
                    "views": views, "days_ago": days_ago,
                },
            )
            db.execute(
                text("""
                    INSERT INTO item_images (item_id, image_url, display_order)
                    VALUES (:iid, :img_url, 0)
                """),
                {"iid": iid, "img_url": img_url},
            )
            db.execute(
                text("""
                    INSERT INTO item_pickup_options (item_id, option_name)
                    VALUES (:iid, 'Meet up'), (:iid, 'Barangay Hall Handover')
                """),
                {"iid": iid},
            )

        # Saved Items / Bookmarks (Interconnected)
        saved_items_data = [
            (14, 25), (14, 48), (14, 57), (14, 56),
            (6, 31), (6, 32), (7, 26), (7, 44), (7, 48),
            (8, 59), (9, 55), (10, 51), (10, 58), (48, 63),
        ]
        for uid, iid in saved_items_data:
            db.execute(
                text("INSERT IGNORE INTO saved_items (user_id, item_id, saved_at) VALUES (:uid, :iid, NOW() - INTERVAL 3 DAY)"),
                {"uid": uid, "iid": iid},
            )
        print("[SEED] 35 unique items across all 13 categories synced.")

        # =====================================================================
        # 4. COMMUNITY HELP REQUESTS (10 Unique Requests across Urgencies & Statuses)
        # =====================================================================
        # status_id: 1 = active, 2 = in_progress, 3 = completed, 4 = cancelled
        # urgency_id: 1 = low, 2 = medium, 3 = high, 4 = critical
        requests_data = [
            (
                12, 14, 1, 2, 1,
                "Children's Raincoats & Rubber Boots (Sizes 6–10) for Monsoon Season",
                "Collecting durable raincoats, umbrellas, and boots for 5 elementary pupils in Barangay San Nicolas Norte walking to school during rainy days.",
                14, "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80", 9
            ),
            (
                13, 7, 2, 3, 1,
                "Engineering Drawing Instruments, Scale Ruler & Scientific Calculator",
                "Third-year civil engineering student needing a triangular metric scale ruler and backup scientific calculator for upcoming structural design exams.",
                10, "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80", 8
            ),
            (
                14, 9, 7, 4, 1,
                "Emergency Family Grocery Relief & Toddler Milk Pack",
                "Our household in Urbiztondo was affected by coastal flooding this week. Seeking rice, canned goods, and stage-3 toddler milk while repairs are underway.",
                5, "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80", 4
            ),
            (
                15, 13, 13, 4, 1,
                "Portable Compressor Nebulizer Kit for Barangay Health Station",
                "Our barangay health center in Agoo urgently needs an extra compressor nebulizer machine and pediatric masks for children and seniors with asthma.",
                7, "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80", 3
            ),
            (
                16, 6, 12, 2, 1,
                "Filipino Children's Storybooks & Washable Foam Play Mat for Reading Corner",
                "Setting up a free after-school reading nook in Barangay Lingsat for 25 early-grade learners. Illustrated storybooks and floor mats are deeply appreciated.",
                21, "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80", 6
            ),
            (
                17, 7, 8, 3, 2,  # in_progress (being assisted by Bryan Beza #35)
                "Second-Hand Laptop or Tablet for Online Engineering Thesis Defense",
                "My old laptop motherboard failed two weeks before our final capstone presentation. Bryan Beza (#35) reached out to lend/donate his ThinkPad unit!",
                7, "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop&q=80", 5
            ),
            (
                18, 9, 3, 2, 2,  # in_progress (being assisted by Roberto Garcia #10)
                "Working Oscillating Stand Fan for Infants' Bedroom",
                "Looking for a functioning electric fan to keep my twins comfortable during warm afternoons. Roberto Garcia (#10) offered to drop off his stand fan.",
                10, "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop&q=80", 5
            ),
            (
                19, 7, 4, 3, 3,  # completed / fulfilled by Angela Villanueva (#11) via Item #41 & Exchange #7
                "Medical-Surgical Nursing & Human Anatomy Review Textbooks",
                "Requested on behalf of my sister preparing for the Philippine Nursing Licensure Exam. Fulfilled by Nurse Angela Villanueva (#11) with her complete 3-volume review set!",
                15, "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80", 18
            ),
            (
                20, 9, 7, 4, 3,  # completed / fulfilled by Roberto Garcia (#10) via Item #47 & Exchange #8
                "Infant Formula Milk (0–6 Months) & Rice Cereal for Newborn",
                "Urgent request for sealed stage-1 infant formula milk. Fulfilled within 24 hours by neighbor Roberto Garcia (#10) at San Juan Municipal Hall!",
                7, "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80", 14
            ),
            (
                21, 12, 8, 1, 4,  # cancelled / removed by Admin via Report #4
                "Direct GCash Solicitations for Gaming Console Purchase",
                "Soliciting direct cash transfers outside platform rules.",
                30, "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&auto=format&fit=crop&q=80", 12
            ),
        ]

        for idx, (
            req_id, uid, cat_id, urg_id, st_id, title, desc, days_ahead, img_url, days_ago
        ) in enumerate(requests_data, start=1):
            loc_id = 200 + idx
            addr, brgy, muni, prov, pcode, lat, lng = user_loc_map.get(uid, locations_pool[0])
            db.execute(
                text("""
                    INSERT INTO item_locations (location_id, address_line, barangay, municipality, province, postal_code, latitude, longitude)
                    VALUES (:loc_id, :addr, :brgy, :muni, :prov, :pcode, :lat, :lng)
                """),
                {"loc_id": loc_id, "addr": addr, "brgy": brgy, "muni": muni, "prov": prov, "pcode": pcode, "lat": lat, "lng": lng},
            )
            needed_date = date.today() + timedelta(days=days_ahead)
            db.execute(
                text("""
                    INSERT INTO item_requests (
                        request_id, user_id, category_id, urgency_id, request_status_id,
                        location_id, title, description, needed_before, created_at, updated_at
                    )
                    VALUES (
                        :req_id, :uid, :cat_id, :urg_id, :st_id,
                        :loc_id, :title, :desc, :needed_date,
                        NOW() - INTERVAL :days_ago DAY, NOW() - INTERVAL 1 DAY
                    )
                """),
                {
                    "req_id": req_id, "uid": uid, "cat_id": cat_id, "urg_id": urg_id,
                    "st_id": st_id, "loc_id": loc_id, "title": title, "desc": desc,
                    "needed_date": needed_date, "days_ago": days_ago,
                },
            )
            db.execute(
                text("""
                    INSERT INTO request_images (request_id, image_url, display_order)
                    VALUES (:req_id, :img_url, 0)
                """),
                {"req_id": req_id, "img_url": img_url},
            )
        print("[SEED] 10 unique community help requests synced.")

        # =====================================================================
        # 5. TRANSACTIONS: EXCHANGES, PARTICIPANTS, ITEMS, HISTORY, RATINGS
        # =====================================================================
        db.execute(text("DELETE FROM ratings"))
        db.execute(text("DELETE FROM exchange_history"))
        db.execute(text("DELETE FROM exchange_items"))
        db.execute(text("DELETE FROM exchange_participants"))
        db.execute(text("DELETE FROM exchanges"))

        # exchange_status_id: 1 = pending, 2 = accepted, 4 = completed
        exchanges_data = [
            # #5: Completed Barter (Carlo #8 <-> Roberto #10: Bookshelf #45 for Hand Tool Kit #50)
            (
                5, 4,
                "Hi Kuya Roberto! I'd love to swap my 4-Tier Pine Bookshelf & Folding Table for your Stanley 65-Piece Hand Tool Kit.",
                "San Fernando City Plaza Covered Court", 20, 18,
                8, 10, 45, 50
            ),
            # #6: Completed Barter (Bryan #35 <-> Jehosue #14: 24" IPS Monitor #49 for Blender & Kettle #40)
            (
                6, 4,
                "Hey Jeho! Offering my 24-inch Full HD IPS Monitor & Mechanical Keyboard in exchange for your Oster Blender & Electric Kettle combo.",
                "Catbangen Barangay Hall, City of San Fernando", 16, 14,
                35, 14, 49, 40
            ),
            # #7: Completed Request Fulfillment / Donation Handover (Angela #11 -> Juan #7: Nursing Books #41 for Request #19)
            (
                7, 4,
                "Fulfilling Community Request #19: Donating my complete 3-volume Medical-Surgical Nursing & Anatomy review books for your sister's board exam.",
                "Sevilla Barangay Reading Center, City of San Fernando", 15, 13,
                11, 7, 41, 39
            ),
            # #8: Completed Request Fulfillment / Donation Handover (Roberto #10 -> Elena #9: Infant Formula #47 for Request #20)
            (
                8, 4,
                "Fulfilling Urgent Request #20: Handing over 3 sealed cans of stage-1 infant formula milk and baby cereal for your newborn.",
                "San Juan Municipal Hall Lobby", 13, 12,
                10, 9, 47, 60
            ),
            # #9: Completed Barter (Maria #6 <-> Jehosue #14: Fresh Mangoes & Tablea #46 for Yamaha Acoustic Guitar #53)
            (
                9, 4,
                "Good day Jeho! Offering 8kg of our sweet backyard Carabao mangoes, guyabano, and homemade cacao tablea in exchange for your Yamaha F310 Guitar for our school music club.",
                "Lingsat Elementary School Gate, San Fernando", 11, 9,
                6, 14, 46, 53
            ),
            # #10: Accepted Active Barter (Juan #7 <-> Trisha #48: Logitech Webcam & Headset #63 for Induction Cooker #62)
            (
                10, 2,
                "Hi Trisha! I have a Logitech 1080p Webcam & Noise-Cancelling USB Headset to swap for your Portable Single-Burner Induction Cooker.",
                "Plaza Maestro Complex, City of San Fernando", 4, None,
                7, 48, 63, 62
            ),
            # #11: Pending Barter Proposal (Maria #6 -> Jehosue #14: Handwoven Inabel Blankets #57 for Philippine Literature Books #32)
            (
                11, 1,
                "Kumusta Jeho! Would you like to exchange your Philippine Literature & Rizal Hardcover Collection for two handwoven Bangar Inabel cotton blankets and table runners?",
                "City of San Fernando Public Library", 2, None,
                6, 14, 57, 32
            ),
            # #12: Pending Barter Proposal (Roberto #10 -> Carlo #8: Giro Bike Helmet & Gloves #59 for Adjustable Dumbbells #58)
            (
                12, 1,
                "Hi Carlo! Offering my Giro Mountain Bike Helmet, Gel Gloves & USB Tail Light in exchange for your 20kg Adjustable Cast-Iron Dumbbell Set.",
                "Parian Barangay Sports Complex", 1, None,
                10, 8, 59, 58
            ),
            # #13: Historical Completed Exchange (Mark #12 <-> Carlo #8) for Moderated Rating Demonstration
            (
                13, 4,
                "Swapping surplus extension cord for sports gear.",
                "Pagdalagan Covered Court", 22, 21,
                12, 8, 64, 54
            ),
        ]

        for (
            exc_id, st_id, msg, meet_loc, created_days_ago, completed_days_ago,
            offerer_id, receiver_id, offered_item_id, requested_item_id
        ) in exchanges_data:
            meet_dt = datetime.now() - timedelta(days=(completed_days_ago or 1)) if completed_days_ago else datetime.now() + timedelta(days=2)
            comp_dt = datetime.now() - timedelta(days=completed_days_ago) if completed_days_ago else None

            db.execute(
                text("""
                    INSERT INTO exchanges (
                        exchange_id, exchange_status_id, message, meeting_date, meeting_location,
                        created_at, updated_at, completed_at
                    )
                    VALUES (
                        :exc_id, :st_id, :msg, :meet_dt, :meet_loc,
                        NOW() - INTERVAL :c_days DAY, NOW() - INTERVAL 1 DAY, :comp_dt
                    )
                """),
                {
                    "exc_id": exc_id, "st_id": st_id, "msg": msg, "meet_dt": meet_dt,
                    "meet_loc": meet_loc, "c_days": created_days_ago, "comp_dt": comp_dt,
                },
            )
            db.execute(
                text("""
                    INSERT INTO exchange_participants (exchange_id, user_id, participant_role)
                    VALUES (:exc_id, :offerer_id, 'offerer'), (:exc_id, :receiver_id, 'receiver')
                """),
                {"exc_id": exc_id, "offerer_id": offerer_id, "receiver_id": receiver_id},
            )
            db.execute(
                text("""
                    INSERT INTO exchange_items (exchange_id, item_id, offered_by_user_id, role)
                    VALUES
                        (:exc_id, :off_item, :offerer_id, 'offered'),
                        (:exc_id, :req_item, :receiver_id, 'requested')
                """),
                {
                    "exc_id": exc_id, "off_item": offered_item_id, "offerer_id": offerer_id,
                    "req_item": requested_item_id, "receiver_id": receiver_id,
                },
            )
            # Chronological exchange history
            db.execute(
                text("""
                    INSERT INTO exchange_history (exchange_id, action, performed_by, details, timestamp)
                    VALUES (:exc_id, 'PROPOSAL_CREATED', :offerer_id, :details, NOW() - INTERVAL :c_days DAY)
                """),
                {
                    "exc_id": exc_id, "offerer_id": offerer_id,
                    "details": f"Exchange proposal #{exc_id} submitted.", "c_days": created_days_ago,
                },
            )
            if st_id in (2, 4):
                db.execute(
                    text("""
                        INSERT INTO exchange_history (exchange_id, action, performed_by, details, timestamp)
                        VALUES (:exc_id, 'PROPOSAL_ACCEPTED', :receiver_id, :details, NOW() - INTERVAL :a_days DAY)
                    """),
                    {
                        "exc_id": exc_id, "receiver_id": receiver_id,
                        "details": f"Proposal accepted and meetup scheduled at {meet_loc}.",
                        "a_days": max(1, created_days_ago - 1),
                    },
                )
            if st_id == 4 and completed_days_ago is not None:
                db.execute(
                    text("""
                        INSERT INTO exchange_history (exchange_id, action, performed_by, details, timestamp)
                        VALUES (:exc_id, 'EXCHANGE_COMPLETED', :receiver_id, 'Handover verified and marked completed by both neighbors.', NOW() - INTERVAL :comp_days DAY)
                    """),
                    {"exc_id": exc_id, "receiver_id": receiver_id, "comp_days": completed_days_ago},
                )

        # Ratings (12 ratings: 11 active + 1 hidden for admin moderation view)
        ratings_data = [
            (1, 6, 35, 14, 5, "Smooth transaction! Jeho arrived right on time in Catbangen and the blender & kettle work like brand new.", "active", 14),
            (2, 6, 14, 35, 5, "Bryan's 24-inch IPS monitor and mechanical keyboard are in pristine condition. Huge help for my coding setup!", "active", 14),
            (3, 5, 8, 10, 5, "Kuya Roberto's Stanley socket wrench and tool kit is complete and heavy-duty. Salamat sa maayos na barter!", "active", 18),
            (4, 5, 10, 8, 5, "Carlo's handcrafted pine bookshelf and folding dining table fit our living room in Bauang perfectly.", "active", 18),
            (5, 7, 7, 11, 5, "Maraming salamat Nurse Angela! The Medical-Surgical Nursing and Anatomy reviewers helped my sister tremendously.", "active", 13),
            (6, 7, 11, 7, 5, "Juan was very polite, punctual, and appreciative during our handover at Sevilla Reading Center.", "active", 13),
            (7, 8, 9, 10, 5, "God bless you Kuya Roberto! Thank you for delivering the sealed infant formula cans so quickly after the storm.", "active", 12),
            (8, 8, 10, 9, 5, "Happy to help Elena and her family in San Juan. Very respectful and communicative neighbor.", "active", 12),
            (9, 9, 6, 14, 5, "Our high school music club students are thrilled with the Yamaha acoustic guitar! Thank you so much, Jeho!", "active", 9),
            (10, 9, 14, 6, 5, "Ma'am Maria's Carabao mangoes and homemade cacao tablea are the best in La Union! Maraming salamat po!", "active", 9),
            (11, 13, 12, 8, 1, "Unfair hostile rant containing inappropriate language.", "hidden", 20),
            (12, 13, 8, 12, 4, "Item worked as described though meetup was delayed by 30 minutes.", "active", 20),
        ]
        for rid, exc_id, rater_id, rated_id, score, rev, st, days_ago in ratings_data:
            db.execute(
                text("""
                    INSERT INTO ratings (
                        rating_id, exchange_id, rater_id, rated_user_id, score, review,
                        status, created_at, updated_at
                    )
                    VALUES (
                        :rid, :exc_id, :rater_id, :rated_id, :score, :rev,
                        :st, NOW() - INTERVAL :days_ago DAY, NOW() - INTERVAL :days_ago DAY
                    )
                """),
                {
                    "rid": rid, "exc_id": exc_id, "rater_id": rater_id, "rated_id": rated_id,
                    "score": score, "rev": rev, "st": st, "days_ago": days_ago,
                },
            )
        print("[SEED] 9 exchanges, history logs, and 12 ratings synced.")

        # =====================================================================
        # 6. CONVERSATIONS & MESSAGES (6 Interconnected Threads, 20 Messages)
        # =====================================================================
        db.execute(text("DELETE FROM message_reactions"))
        db.execute(text("DELETE FROM messages"))
        db.execute(text("DELETE FROM conversation_participants"))
        db.execute(text("DELETE FROM conversations"))

        conversations_data = [
            (
                1, "Exchange #6: 24\" IPS Monitor <-> Blender & Kettle", 14, 35,
                [
                    (35, "Hi Jeho! I saw your Oster Blender & Kettle listing. Would you be open to trading for my 24-inch IPS Monitor and Mechanical Keyboard?", 16),
                    (14, "Hi Bryan! Yes, that's an awesome trade! I actually need a secondary monitor for development.", 15),
                    (35, "Great! Let's meet at Catbangen Barangay Hall tomorrow at 4:00 PM.", 15),
                    (14, "Deal! Handover completed smoothly. I just left you a 5-star review!", 14),
                ]
            ),
            (
                2, "Exchange #9 & #11: Inabel Blankets & Mangoes <-> Guitar & Books", 14, 6,
                [
                    (6, "Good afternoon Jeho! Thank you again for trading your Yamaha guitar for our school music club.", 9),
                    (14, "Always happy to help Ma'am Maria! The mangoes and tablea were delicious.", 9),
                    (6, "I also noticed your Philippine Literature & Noli Me Tangere collection (#32). I just submitted an exchange proposal offering two handwoven Bangar Inabel blankets (#57)!", 2),
                    (14, "Wow, authentic Inabel blankets! Let me check the proposal on my Exchanges tab.", 1),
                ]
            ),
            (
                3, "Request #19 Fulfilled: Nursing Review Textbooks", 7, 11,
                [
                    (11, "🤝 Community Assistance for \"Medical-Surgical Nursing & Human Anatomy Review Textbooks\":\n\nHi Juan! I have the complete 3-volume Medical-Surgical Nursing and Saunders NCLEX review set (#41) ready for your sister.", 15),
                    (7, "Maraming salamat po Nurse Angela! Can I pick them up at Sevilla Reading Center this afternoon?", 14),
                    (11, "Yes, see you at 3:30 PM! Good luck to your sister on her nursing board exam!", 13),
                ]
            ),
            (
                4, "Request #20 Fulfilled: Infant Formula Milk Handover", 9, 10,
                [
                    (10, "🤝 Community Assistance for \"Infant Formula Milk (0–6 Months) & Rice Cereal for Newborn\":\n\nHi Elena! I saw your critical request. I have 3 sealed cans of stage-1 infant formula and 2 boxes of baby cereal (#47) ready to drop off in San Juan.", 13),
                    (9, "Thank you so much Kuya Roberto! This is a huge relief for our twins after the flooding.", 12),
                    (10, "You're very welcome! Stay safe and let us know if you also need the stand fan (#27) this week.", 5),
                ]
            ),
            (
                5, "Exchange #10: Logitech HD Webcam <-> Portable Induction Cooker", 7, 48,
                [
                    (7, "Hi Trisha! I proposed exchanging my Logitech C920 HD Webcam & USB Headset (#63) for your Portable Induction Cooker (#62).", 4),
                    (48, "Hi Juan! I just accepted your proposal! Both items are now reserved.", 3),
                    (7, "Awesome! See you this Saturday at 2:00 PM at Plaza Maestro Complex.", 2),
                ]
            ),
            (
                6, "Request #17 In Progress: ThinkPad Laptop for Thesis Defense", 7, 35,
                [
                    (7, "Hi Kuya Bryan! I saw your Lenovo ThinkPad T480 donation listing (#48). Our engineering thesis defense is next week.", 5),
                    (35, "Hi Juan! I reserved the ThinkPad for you and loaded MS Office and AutoCAD viewer. Let's meet at DMMMSU Mid-La Union Campus gate tomorrow!", 2),
                ]
            ),
        ]

        msg_id_counter = 1
        for conv_id, title, u1, u2, msgs in conversations_data:
            db.execute(
                text("""
                    INSERT INTO conversations (conversation_id, title, created_at, updated_at)
                    VALUES (:cid, :title, NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 1 HOUR)
                """),
                {"cid": conv_id, "title": title},
            )
            db.execute(
                text("""
                    INSERT INTO conversation_participants (conversation_id, user_id, joined_at, last_read_at)
                    VALUES
                        (:cid, :u1, NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 30 MINUTE),
                        (:cid, :u2, NOW() - INTERVAL 16 DAY, NOW() - INTERVAL 30 MINUTE)
                """),
                {"cid": conv_id, "u1": u1, "u2": u2},
            )
            for sender_id, content, days_ago in msgs:
                db.execute(
                    text("""
                        INSERT INTO messages (message_id, conversation_id, sender_id, message_type_id, content, created_at)
                        VALUES (:mid, :cid, :sid, 1, :content, NOW() - INTERVAL :days_ago DAY)
                    """),
                    {"mid": msg_id_counter, "cid": conv_id, "sid": sender_id, "content": content, "days_ago": days_ago},
                )
                msg_id_counter += 1
        print("[SEED] 6 conversations and 20 interconnected messages synced.")

        # =====================================================================
        # 7. NOTIFICATIONS (Clean, Non-Duplicate, Interconnected Notifications)
        # =====================================================================
        db.execute(text("DELETE FROM notifications"))
        # notification_type_id (from live DB):
        # 1=new_message, 2=exchange_request, 3=exchange_accepted, 4=exchange_rejected,
        # 5=exchange_completed, 6=item_favorited, 7=request_response, 10=profile_picture_approved,
        # 12=identity_verification_approved, 14=system, 15=post_removed, 16=request_removed,
        # 17=report_resolved, 18=account_suspended, 22=new_rating
        notifications_data = [
            # For Jehosue (user 14)
            (1, 14, 2, "New Exchange Proposal Received", "Maria Santos offered \"Handwoven Bangar Inabel Cotton Blankets (2 Pcs) & Iloko Table Runners\" for your item \"Philippine Literature, Noli Me Tangere & Classic Hardcover Novels Set\".", 6, 32, "/exchanges", 0, 2),
            (2, 14, 1, "New Message from Maria Santos", "Maria Santos sent you a message regarding your Philippine Literature & Noli Me Tangere collection.", 6, 32, "/messages", 0, 1),
            (3, 14, 5, "Exchange Successfully Completed!", "Your barter exchange (#exc-9) with Maria Santos has been marked completed.", 6, 53, "/exchanges", 1, 9),
            (4, 14, 22, "New 5-Star Rating Received!", "Maria Santos gave you a 5-star rating: \"Our high school music club students are thrilled with the Yamaha acoustic guitar!\"", 6, 53, "/profile", 1, 9),
            (5, 14, 5, "Exchange Successfully Completed!", "Your barter exchange (#exc-6) with Bryan Beza has been marked completed.", 35, 40, "/exchanges", 1, 14),
            (6, 14, 22, "New 5-Star Rating Received!", "Bryan Beza gave you a 5-star rating: \"Smooth transaction! Jeho arrived right on time in Catbangen.\"", 35, 40, "/profile", 1, 14),
            (7, 14, 6, "Item Saved to Favorites", "Juan Dela Cruz bookmarked your listing \"Casio fx-991ES Plus Scientific Calculator & Geometry Compass Set\".", 7, 26, "/items/26", 0, 3),

            # For Admin (user 5)
            (8, 5, 14, "Pending Identity Verifications in Queue", "Ramon Bautista and Patricia Aquino submitted identity verification documents awaiting administrator review.", 15, None, "/admin/approvals", 0, 1),
            (9, 5, 14, "High-Priority Safety Report Flagged", "Luisa Castro submitted a safety verification report (#report-3) on listing #51 awaiting moderation review.", 13, 51, "/admin/reports", 0, 2),
            (10, 5, 14, "Pending Profile Picture Submissions", "Elena Reyes and Luisa Castro uploaded new profile photos awaiting moderation approval.", 9, None, "/admin/approvals", 0, 3),

            # For Maria Santos (user 6)
            (11, 6, 22, "New 5-Star Rating Received!", "Jehosue Biscarra gave you a 5-star rating for Exchange #9.", 14, 46, "/profile", 1, 9),
            (12, 6, 17, "Your Report Has Been Reviewed", "Your report regarding Request #21 was reviewed and appropriate moderation action (Request Removed) was taken.", 5, None, "/dashboard", 1, 10),

            # For Juan Dela Cruz (user 7)
            (13, 7, 7, "Community Assistance Fulfilled!", "Angela Villanueva offered support and your request \"Medical-Surgical Nursing & Human Anatomy Review Textbooks\" has been fulfilled!", 11, 41, "/requests", 1, 13),
            (14, 7, 3, "Exchange Proposal Accepted!", "Trisha Mae accepted your trade proposal (#exc-10) for \"Portable Single-Burner Touch Induction Cooker with Stainless Pot\".", 48, 62, "/exchanges", 0, 3),
            (15, 7, 1, "New Message from Bryan Beza", "Bryan Beza reserved the Lenovo ThinkPad T480 Laptop (#48) for your thesis defense.", 35, 48, "/messages", 0, 2),

            # For Carlo Mendoza (user 8)
            (16, 8, 2, "New Exchange Proposal Received", "Roberto Garcia offered \"GIRO Adult Mountain Bike Helmet (M/L), Gel Cycling Gloves & USB Tail Light\" for your item \"Adjustable Cast-Iron Dumbbell Set (20kg Total)\".", 10, 58, "/exchanges", 0, 1),
            (17, 8, 22, "New 5-Star Rating Received!", "Roberto Garcia gave you a 5-star rating for Exchange #5.", 10, 45, "/profile", 1, 18),

            # For Elena Reyes (user 9)
            (18, 9, 7, "Community Assistance Fulfilled!", "Roberto Garcia fulfilled your urgent request \"Infant Formula Milk (0–6 Months) & Rice Cereal for Newborn\"!", 10, 47, "/requests", 1, 12),

            # For Roberto Garcia (user 10)
            (19, 10, 22, "New 5-Star Rating Received!", "Elena Reyes gave you a 5-star rating: \"God bless you Kuya Roberto! Thank you for delivering the sealed infant formula cans so quickly.\"", 9, 47, "/profile", 1, 12),

            # For Angela Villanueva (user 11)
            (20, 11, 22, "New 5-Star Rating Received!", "Juan Dela Cruz gave you a 5-star rating for donating the Nursing Review Textbooks (#41).", 7, 41, "/profile", 1, 13),
            (21, 11, 17, "Your Report Has Been Reviewed", "Your report regarding prohibited item #64 was reviewed and resolved by removing the listing.", 5, 64, "/dashboard", 1, 10),

            # For Mark Soriano (user 12)
            (22, 12, 15, "Your Post Was Removed", "Your post \"Unverified Unlabeled Herbal Supplement Capsules (10 Bottles)\" was removed for violating health & medical safety policies.", 5, 64, "/help/community-guidelines", 0, 10),
            (23, 12, 18, "Account Temporarily Suspended", "Your account has been suspended for 14 days following repeated prohibited medical listings and cash solicitation violations.", 5, None, "/help/community-guidelines", 0, 9),

            # For Bryan Beza (user 35) & Trisha Mae (user 48)
            (24, 35, 6, "Item Saved to Favorites", "Jehosue Biscarra and Juan Dela Cruz bookmarked your listing \"Lenovo ThinkPad T480 Laptop\".", 14, 48, "/items/48", 0, 2),
            (25, 48, 3, "Exchange Proposal Accepted & Reserved", "Your induction cooker exchange (#exc-10) with Juan Dela Cruz is scheduled for Saturday at Plaza Maestro.", 7, 62, "/exchanges", 0, 3),
        ]

        for nid, uid, ntype, title, msg, rel_uid, rel_iid, link, is_read, days_ago in notifications_data:
            db.execute(
                text("""
                    INSERT INTO notifications (
                        notification_id, user_id, notification_type_id, title, message,
                        related_user_id, related_item_id, link, is_read, created_at, read_at
                    )
                    VALUES (
                        :nid, :uid, :ntype, :title, :msg,
                        :rel_uid, :rel_iid, :link, :is_read,
                        NOW() - INTERVAL :days_ago DAY,
                        CASE WHEN :is_read = 1 THEN NOW() - INTERVAL :days_ago DAY ELSE NULL END
                    )
                """),
                {
                    "nid": nid, "uid": uid, "ntype": ntype, "title": title, "msg": msg,
                    "rel_uid": rel_uid, "rel_iid": rel_iid, "link": link,
                    "is_read": is_read, "days_ago": days_ago,
                },
            )
        print("[SEED] 25 clean, interconnected notifications synced.")

        # =====================================================================
        # 8. MODERATION REPORTS, USER SUSPENSIONS & AUDIT LOGS
        # =====================================================================
        db.execute(text("DELETE FROM reports"))
        db.execute(text("DELETE FROM user_suspensions"))
        db.execute(text("DELETE FROM audit_logs"))

        # report_target_types (from live DB): 1=user, 2=item, 3=message, 5=request
        # report_reasons (from live DB): 1=inappropriate, 2=spam, 3=scam, 19=scam_fraud, 20=prohibited_item, 29=inappropriate_request
        # report_statuses (from live DB): 1=pending, 2=reviewed, 3=resolved, 4=dismissed, 6=under_review
        reports_data = [
            (
                1, 11, 2, "item-64", 20, 3,
                "Listing offers unlabeled, unverified herbal capsules without FDA registration or expiration dates, which poses a health risk to residents.",
                5, "Action: Post Removed. Message: Unregistered medicines and supplements are strictly prohibited on Bayanihan Hub.",
                11, 10
            ),
            (
                2, 8, 1, "user-12", 19, 3,
                "User attempted to demand cash payments via GCash during an exchange chat and left an abusive review when declined.",
                14, "Action: User Suspended (14 days) & Abusive Rating Hidden. Message: Commercial cash solicitation and harassment violate community guidelines.",
                10, 9
            ),
            (
                3, 13, 2, "item-51", 20, 1,  # PENDING HIGH-PRIORITY REPORT FOR ADMIN QUEUE
                "Requesting admin safety verification to confirm the lithium battery pack on this cordless power drill includes its proper insulated charger.",
                None, None,
                2, None
            ),
            (
                4, 6, 5, "req-21", 29, 3,
                "This community request asks neighbors to send direct GCash funds for a gaming console rather than requesting essential goods.",
                5, "Action: Request Removed. Message: Direct monetary solicitation is not permitted in Community Requests.",
                12, 11
            ),
            (
                5, 7, 2, "item-34", 2, 4,
                "Flagged to check if this pantry relief pack was already distributed last week.",
                14, "Action: Dismissed (No Violation). Verified with donor Maria Santos that this is a fresh batch of 10kg rice and canned goods.",
                6, 5
            ),
        ]

        for rep_id, reporter_id, ttype_id, tid, reason_id, st_id, desc, res_by, res_note, c_days, r_days in reports_data:
            res_at = (datetime.now() - timedelta(days=r_days)) if r_days is not None else None
            db.execute(
                text("""
                    INSERT INTO reports (
                        report_id, reporter_id, target_type_id, target_id, reason_id,
                        description, status_id, resolved_by, resolution_note, created_at, resolved_at
                    )
                    VALUES (
                        :rep_id, :reporter_id, :ttype_id, :tid, :reason_id,
                        :desc, :st_id, :res_by, :res_note,
                        NOW() - INTERVAL :c_days DAY, :res_at
                    )
                """),
                {
                    "rep_id": rep_id, "reporter_id": reporter_id, "ttype_id": ttype_id,
                    "tid": tid, "reason_id": reason_id, "desc": desc, "st_id": st_id,
                    "res_by": res_by, "res_note": res_note, "c_days": c_days, "res_at": res_at,
                },
            )

        # User Suspensions (Interconnected with existing users 12 and 10)
        suspensions_data = [
            (
                1, 10, 5,
                datetime.now() - timedelta(days=35),
                datetime.now() - timedelta(days=32),
                "Automated duplicate post cooldown",
                "Temporary 3-day cooldown lifted after verifying legitimate workshop donations.",
                "LIFTED"
            ),
            (
                2, 12, 14,
                datetime.now() - timedelta(days=9),
                datetime.now() + timedelta(days=5),
                "Repeated policy violations: unlisted herbal supplements (#64) and cash solicitation (#21)",
                "Your account is suspended for 14 days due to violations of health safety and non-monetary exchange rules.",
                "ACTIVE"
            ),
        ]
        for sid, uid, s_by, s_at, exp_at, reason, msg, st in suspensions_data:
            db.execute(
                text("""
                    INSERT INTO user_suspensions (
                        suspension_id, user_id, suspended_by, start_at, expires_at,
                        reason, message, status, created_at
                    )
                    VALUES (:sid, :uid, :s_by, :s_at, :exp_at, :reason, :msg, :st, :s_at)
                """),
                {"sid": sid, "uid": uid, "s_by": s_by, "s_at": s_at, "exp_at": exp_at, "reason": reason, "msg": msg, "st": st},
            )

        # Audit Logs (16 clean, chronological records referencing real users, items, requests, and reports)
        # audit_actions (from live DB):
        # 1=USER_APPROVED, 2=USER_REJECTED, 3=VERIFICATION_REVIEWED, 4=PROFILE_PICTURE_APPROVED,
        # 5=PROFILE_PICTURE_REJECTED, 6=ITEM_REMOVED, 7=USER_SUSPENDED, 8=REPORT_RESOLVED,
        # 9=REQUEST_REMOVED, 10=USER_UNSUSPENDED, 19=REPORT_REVIEWED, 20=REPORT_DISMISSED, 21=USER_WARNED
        audit_logs_data = [
            (1, 5, 1, "user", "6", "Approved PhilSys National ID verification for Maria Santos (user #6).", 30),
            (2, 5, 1, "user", "8", "Approved Driver's License identity verification for Carlo Mendoza (user #8).", 28),
            (3, 5, 1, "user", "10", "Approved National ID verification for Roberto Garcia (user #10).", 26),
            (4, 5, 1, "user", "11", "Approved PRC & Passport identity verification for Nurse Angela Villanueva (user #11).", 24),
            (5, 5, 10, "user", "10", "Suspension lifted for Roberto Garcia (user #10) after verifying workshop donations.", 22),
            (6, 5, 4, "user", "35", "Approved profile photo submission for Bryan Beza (user #35).", 16),
            (7, 5, 4, "user", "48", "Approved profile photo submission for Trisha Mae (user #48).", 14),
            (8, 5, 9, "request", "21", "Removed request #21 ('Direct GCash Solicitations for Gaming Console Purchase') via Report #4.", 11),
            (9, 5, 8, "report", "4", "Report #4 on req-21 marked resolved. Action: Request Removed.", 11),
            (10, 5, 6, "item", "64", "Removed item #64 ('Unverified Unlabeled Herbal Supplement Capsules') via Report #1. Reason: Prohibited unverified medical product.", 10),
            (11, 5, 8, "report", "1", "Report #1 on item-64 marked resolved. Action: Post Removed.", 10),
            (12, 14, 7, "user", "12", "Suspended Mark Soriano (user #12) for 14 days from Report #2. Reason: Commercial solicitation & abusive rating.", 9),
            (13, 14, 8, "report", "2", "Report #2 on user-12 marked resolved. Action: User Suspended & Abusive Rating #11 Hidden.", 9),
            (14, 14, 20, "report", "5", "Report #5 on item-34 ('Family Pantry Relief Pack') dismissed after verifying fresh donation batch with Maria Santos.", 5),
            (15, 5, 3, "user", "11", "Awarded 'Trusted Donor' and 'Active Exchanger' badges to Angela Villanueva (user #11) for fulfilling Request #19.", 3),
            (16, 14, 3, "user", "10", "Awarded 'Trusted Donor' badge to Roberto Garcia (user #10) for fulfilling Urgent Infant Formula Request #20.", 2),
        ]

        for al_id, admin_id, act_id, etype, eid, details, days_ago in audit_logs_data:
            db.execute(
                text("""
                    INSERT INTO audit_logs (
                        audit_log_id, admin_id, action_id, target_entity_type,
                        target_entity_id, details, created_at
                    )
                    VALUES (
                        :al_id, :admin_id, :act_id, :etype,
                        :eid, :details, NOW() - INTERVAL :days_ago DAY
                    )
                """),
                {
                    "al_id": al_id, "admin_id": admin_id, "act_id": act_id,
                    "etype": etype, "eid": eid, "details": details, "days_ago": days_ago,
                },
            )
        print("[SEED] 5 reports, 2 user suspensions, and 16 audit logs synced.")

        db.execute(text("SET FOREIGN_KEY_CHECKS = 1"))
        db.commit()
        print("[SEED] SUCCESS! All Bayanihan Hub modules and categories are populated and interconnected.")
    except Exception as exc:
        db.rollback()
        print(f"[SEED ERROR] {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
