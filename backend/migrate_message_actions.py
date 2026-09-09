"""
migrate_message_actions.py
--------------------------
One-time migration to add message-actions columns and the message_reactions table.
Compatible with MySQL / MariaDB.

Run from the project root:
    backend\\.venv\\Scripts\\python.exe backend\\migrate_message_actions.py

Safe to run multiple times - checks column existence before adding.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import engine


def column_exists(conn, table: str, column: str) -> bool:
    result = conn.exec_driver_sql(
        "SELECT COUNT(*) FROM information_schema.COLUMNS "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s AND COLUMN_NAME = %s",
        (table, column),
    )
    return result.scalar() > 0


def table_exists(conn, table: str) -> bool:
    result = conn.exec_driver_sql(
        "SELECT COUNT(*) FROM information_schema.TABLES "
        "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = %s",
        (table,),
    )
    return result.scalar() > 0


COLUMN_ADDITIONS = [
    # (table, column, ddl_fragment)
    ("messages", "reply_to_message_id",
     "ALTER TABLE messages ADD COLUMN reply_to_message_id BIGINT NULL, "
     "ADD CONSTRAINT fk_reply_msg FOREIGN KEY (reply_to_message_id) REFERENCES messages(message_id) ON DELETE SET NULL"),
    ("messages", "is_unsent",
     "ALTER TABLE messages ADD COLUMN is_unsent TINYINT(1) NOT NULL DEFAULT 0"),
    ("messages", "unsent_at",
     "ALTER TABLE messages ADD COLUMN unsent_at DATETIME NULL"),
    ("messages", "is_edited",
     "ALTER TABLE messages ADD COLUMN is_edited TINYINT(1) NOT NULL DEFAULT 0"),
    ("messages", "edited_at",
     "ALTER TABLE messages ADD COLUMN edited_at DATETIME NULL"),
]

CREATE_REACTIONS_TABLE = """
CREATE TABLE IF NOT EXISTS message_reactions (
    reaction_id  BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    message_id   BIGINT NOT NULL,
    user_id      BIGINT NOT NULL,
    reaction     VARCHAR(32) NOT NULL,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_react_message FOREIGN KEY (message_id) REFERENCES messages(message_id) ON DELETE CASCADE,
    CONSTRAINT fk_react_user    FOREIGN KEY (user_id)    REFERENCES users(user_id)    ON DELETE CASCADE,
    CONSTRAINT uq_message_user_reaction UNIQUE (message_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
"""

ALLOW_NULL_CONTENT = "ALTER TABLE messages MODIFY COLUMN content TEXT NULL"


def run_migration():
    with engine.begin() as conn:
        # 1. Add columns to messages
        for table, col, ddl in COLUMN_ADDITIONS:
            if column_exists(conn, table, col):
                print(f"  SKIP  {table}.{col} already exists")
            else:
                try:
                    conn.exec_driver_sql(ddl)
                    print(f"  OK    Added {table}.{col}")
                except Exception as exc:
                    print(f"  ERROR {table}.{col}: {str(exc)[:200]}")

        # 2. Allow messages.content to be NULL (needed for unsent messages)
        try:
            conn.exec_driver_sql(ALLOW_NULL_CONTENT)
            print("  OK    messages.content is now nullable")
        except Exception as exc:
            print(f"  SKIP  content nullable: {str(exc)[:120]}")

        # 3. Create message_reactions table
        if table_exists(conn, "message_reactions"):
            print("  SKIP  message_reactions table already exists")
        else:
            try:
                conn.exec_driver_sql(CREATE_REACTIONS_TABLE)
                print("  OK    Created message_reactions table")
            except Exception as exc:
                print(f"  ERROR message_reactions: {str(exc)[:200]}")

    print("\nMigration complete.")


if __name__ == "__main__":
    run_migration()
