import hashlib
from datetime import datetime, date
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.db import SessionLocal
from app.models.user import User, Profile, UserRole, Role, AccountStatus, ProfilePicture
from app.models.verification import (
    IdentityVerification,
    IdType,
    VerificationStatus,
    FacialVerificationStatus,
)
from app.services.biometric_engine import mask_id_number


def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode("utf-8")).hexdigest()


def seed():
    db = SessionLocal()
    try:
        # Default password for seed users
        default_hash = hash_pw("password123")

        users_data = [
            {
                "email": "maria@example.com",
                "username": "maria_santos",
                "first_name": "Maria",
                "last_name": "Santos",
                "phone": "+63 912 345 6789",
                "address": "123 Rizal St.",
                "barangay": "San Antonio",
                "municipality": "Aringay",
                "province": "La Union",
                "account_status_id": 2,  # APPROVED
                "is_trusted": True,
                "id_type_name": "Philippine National ID / PhilSys ID",
                "id_number": "1234-5678-9012-3456",
                "full_name_on_id": "Maria Santos",
                "dob": date(1992, 5, 14),
                "verif_status_id": 2,  # APPROVED
                "confidence": 96,
                "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
                "id_doc": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
            },
            {
                "email": "juan@example.com",
                "username": "juan_dc",
                "first_name": "Juan",
                "last_name": "Dela Cruz",
                "phone": "+63 917 654 3210",
                "address": "456 Bonifacio Ave.",
                "barangay": "Poblacion",
                "municipality": "San Fernando",
                "province": "La Union",
                "account_status_id": 2,  # APPROVED
                "is_trusted": False,
                "id_type_name": "Driver's License",
                "id_number": "N01-23-456789",
                "full_name_on_id": "Juan Dela Cruz",
                "dob": date(1988, 11, 20),
                "verif_status_id": 2,  # APPROVED
                "confidence": 94,
                "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                "id_doc": "https://images.unsplash.com/photo-1554415707-9e44264e402e?w=600&auto=format&fit=crop&q=80",
            },
            {
                "email": "ana@example.com",
                "username": "ana_reyes",
                "first_name": "Ana",
                "last_name": "Reyes",
                "phone": "+63 918 111 2233",
                "address": "789 Mabini St.",
                "barangay": "Carlatan",
                "municipality": "San Fernando",
                "province": "La Union",
                "account_status_id": 1,  # PENDING
                "is_trusted": False,
                "id_type_name": "Philippine Passport",
                "id_number": "P8934521A",
                "full_name_on_id": "Ana Reyes",
                "dob": date(1995, 3, 12),
                "verif_status_id": 1,  # PENDING
                "confidence": 92,
                "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                "id_doc": "https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80",
            },
            {
                "email": "marco@example.com",
                "username": "marco_ramos",
                "first_name": "Marco",
                "last_name": "Ramos",
                "phone": "+63 919 444 5566",
                "address": "101 Luna St.",
                "barangay": "Pagdaraoan",
                "municipality": "San Fernando",
                "province": "La Union",
                "account_status_id": 4,  # REQUIRES_REVIEW
                "is_trusted": False,
                "id_type_name": "Postal ID",
                "id_number": "PRN-99882211",
                "full_name_on_id": "Marco Ramos",
                "dob": date(1990, 7, 4),
                "verif_status_id": 4,  # RETRY_REQUIRED
                "confidence": 68,
                "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                "id_doc": "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80",
            },
        ]

        # Get user role
        user_role = db.query(Role).filter(Role.role_name == "user").first()
        role_id = user_role.role_id if user_role else 2

        # Get admin user id for reviewed_by
        admin_user = db.query(User).filter(User.email == "admin@bayanihan.ph").first()
        admin_id = admin_user.user_id if admin_user else 1

        for udata in users_data:
            existing = db.query(User).filter(User.email == udata["email"]).first()
            if existing:
                print(f"User {udata['email']} already exists. Skipping.")
                continue

            # Create User
            user = User(
                email=udata["email"],
                password_hash=default_hash,
                account_status_id=udata["account_status_id"],
                is_suspended=False,
                is_trusted=udata["is_trusted"],
            )
            db.add(user)
            db.flush()

            # Add Role
            db.add(UserRole(user_id=user.user_id, role_id=role_id))

            # Add Profile
            profile = Profile(
                user_id=user.user_id,
                username=udata["username"],
                first_name=udata["first_name"],
                middle_name=None,
                last_name=udata["last_name"],
                phone=udata["phone"],
                bio="Community member",
                address_line=udata["address"],
                barangay=udata["barangay"],
                municipality=udata["municipality"],
                province=udata["province"],
            )
            db.add(profile)

            # Match ID Type
            id_type_rec = db.query(IdType).filter(IdType.type_name == udata["id_type_name"]).first()
            id_type_id = id_type_rec.id_type_id if id_type_rec else 1

            # Add Verification
            id_verif = IdentityVerification(
                user_id=user.user_id,
                id_type_id=id_type_id,
                id_number=udata["id_number"],
                masked_id_number=mask_id_number(udata["id_number"]),
                full_name_on_id=udata["full_name_on_id"],
                date_of_birth=udata["dob"],
                document_reference=udata["id_doc"],
                facial_selfie_reference=udata["avatar"],
                facial_verification_status_id=2,  # PASSED
                verification_status_id=udata["verif_status_id"],
                confidence_score=udata["confidence"],
                provider="BayanihanHub-Biometric-Engine",
                reviewed_by=admin_id if udata["verif_status_id"] == 2 else None,
                reviewed_at=datetime.now() if udata["verif_status_id"] == 2 else None,
            )
            db.add(id_verif)

            # Add ProfilePicture
            pfp = ProfilePicture(
                user_id=user.user_id,
                file_reference=udata["avatar"],
                status_id=2 if udata["account_status_id"] == 2 else 1,
                is_active=True,
            )
            db.add(pfp)

            print(f"Created seed user: {udata['email']} (ID: {user.user_id})")

        db.commit()
        print("Seed completed successfully!")
    except Exception as e:
        db.rollback()
        print("Seed error:", e)
    finally:
        db.close()


if __name__ == "__main__":
    seed()
