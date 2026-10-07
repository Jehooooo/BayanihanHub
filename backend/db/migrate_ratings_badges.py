import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db import engine

def run_migration():
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            # 1. Update ratings table
            cols = [r[0] for r in conn.execute(text("DESCRIBE ratings"))]
            if "status" not in cols:
                print("Adding status column to ratings...")
                conn.execute(text("ALTER TABLE ratings ADD COLUMN status ENUM('active', 'hidden') NOT NULL DEFAULT 'active'"))
            if "updated_at" not in cols:
                print("Adding updated_at column to ratings...")
                conn.execute(text("ALTER TABLE ratings ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
            
            print("Modifying review column to allow NULL...")
            conn.execute(text("ALTER TABLE ratings MODIFY COLUMN review TEXT COLLATE utf8mb4_unicode_ci NULL"))

            indexes = [r[2] for r in conn.execute(text("SHOW INDEX FROM ratings"))]
            if "idx_ratings_rated_status" not in indexes:
                print("Adding idx_ratings_rated_status...")
                conn.execute(text("CREATE INDEX idx_ratings_rated_status ON ratings(rated_user_id, status)"))

            # 2. Update user_badges table
            ub_cols = [r[0] for r in conn.execute(text("DESCRIBE user_badges"))]
            if "awarded_by" not in ub_cols:
                print("Adding awarded_by to user_badges...")
                conn.execute(text("ALTER TABLE user_badges ADD COLUMN awarded_by BIGINT UNSIGNED NULL"))
                conn.execute(text("ALTER TABLE user_badges ADD CONSTRAINT fk_user_badges_awarded_by FOREIGN KEY (awarded_by) REFERENCES users(user_id) ON DELETE SET NULL"))
            if "reason" not in ub_cols:
                print("Adding reason to user_badges...")
                conn.execute(text("ALTER TABLE user_badges ADD COLUMN reason VARCHAR(255) NULL"))
            if "status" not in ub_cols:
                print("Adding status to user_badges...")
                conn.execute(text("ALTER TABLE user_badges ADD COLUMN status ENUM('active', 'revoked') NOT NULL DEFAULT 'active'"))
            if "revoked_at" not in ub_cols:
                print("Adding revoked_at to user_badges...")
                conn.execute(text("ALTER TABLE user_badges ADD COLUMN revoked_at TIMESTAMP NULL"))

            # 3. Seed additional standard badges if missing
            existing_codes = [r[0] for r in conn.execute(text("SELECT badge_code FROM badges"))]
            new_badges = [
                ("trusted_helper", "Trusted Helper", "shield", "Consistently receives positive ratings from completed interactions"),
                ("highly_rated", "Highly Rated", "star", "Maintains an excellent average rating with enough valid ratings"),
                ("community_champion", "Community Champion", "award", "Strong overall contribution and reputation in the community"),
                ("reliable_member", "Reliable Member", "check-circle", "Consistently completes successful transactions and deals"),
            ]
            for code, name, icon, desc in new_badges:
                if code not in existing_codes:
                    print(f"Adding badge {code}...")
                    conn.execute(
                        text("INSERT INTO badges (badge_code, name, icon, description) VALUES (:c, :n, :i, :d)"),
                        {"c": code, "n": name, "i": icon, "d": desc}
                    )

            # 4. Ensure notification_type for new_rating exists
            notif_types = [r[0] for r in conn.execute(text("SELECT type_code FROM notification_types"))]
            if "new_rating" not in notif_types:
                print("Adding new_rating notification type...")
                conn.execute(text("INSERT INTO notification_types (notification_type_id, type_code, display_name, description) VALUES (22, 'new_rating', 'New Rating Received', 'You received a new rating from a neighbor')"))

            trans.commit()
            print("MIGRATION COMPLETED SUCCESSFULLY!")
        except Exception as e:
            trans.rollback()
            print("MIGRATION FAILED:", e)
            raise e

if __name__ == "__main__":
    run_migration()
