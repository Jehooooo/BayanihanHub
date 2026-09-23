import os
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv()


PORT: int = int(os.getenv("PORT", "3001"))
HOST: str = os.getenv("HOST", "0.0.0.0")
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
DEBUG: bool = os.getenv("DEBUG", "false").lower() in ("true", "1", "yes")
JWT_SECRET: str = os.getenv("JWT_SECRET", "bayanihan-hub-secret-key-beta-2026")
if ENVIRONMENT == "production" and JWT_SECRET == "bayanihan-hub-secret-key-beta-2026":
    import warnings
    warnings.warn("CRITICAL SECURITY: Using default JWT_SECRET in production environment! Set a unique JWT_SECRET in .env.")

VERIFICATION_PROVIDER: str = os.getenv("VERIFICATION_PROVIDER", "biometric")
VERIFICATION_API_KEY: str = os.getenv("VERIFICATION_API_KEY", "")

# Default allowed origins (restrictive localhost instead of open wildcard)
DEFAULT_CORS = "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
CORS_ORIGINS: list[str] = [o.strip() for o in os.getenv("CORS_ORIGINS", DEFAULT_CORS).split(",") if o.strip()]

# Upload constraints
MAX_DOCUMENT_SIZE_BYTES: int = 10 * 1024 * 1024  # 10MB limit
MAX_IMAGE_SIZE_BYTES: int = 5 * 1024 * 1024       # 5MB limit for images
ALLOWED_IMAGE_EXTENSIONS: set[str] = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_IMAGE_MIME_TYPES: set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}
ALLOWED_ATTACHMENT_EXTENSIONS: set[str] = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif",
    ".pdf", ".doc", ".docx", ".txt", ".zip",
}
ALLOWED_ATTACHMENT_MIME_TYPES: set[str] = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
}

# SMTP / Email Configuration
SMTP_HOST: str = os.getenv("SMTP_HOST", "")
SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER: str = os.getenv("SMTP_USER", "")
SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL: str = os.getenv("SMTP_FROM_EMAIL", "noreply@bayanihanhub.com")
SMTP_FROM_NAME: str = os.getenv("SMTP_FROM_NAME", "BayanihanHub")
SMTP_USE_TLS: bool = os.getenv("SMTP_USE_TLS", "false").lower() in ("true", "1", "yes")
SMTP_USE_SSL: bool = os.getenv("SMTP_USE_SSL", "false").lower() in ("true", "1", "yes")

FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")

# MySQL Database Configuration
MYSQL_HOST: str = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT: int = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER: str = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD: str = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE: str = os.getenv("MYSQL_DATABASE", "bayanihan_hub")
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4",
)
