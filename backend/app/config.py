import os
from dotenv import load_dotenv

load_dotenv()

PORT: int = int(os.getenv("PORT", "3001"))
HOST: str = os.getenv("HOST", "0.0.0.0")
VERIFICATION_PROVIDER: str = os.getenv("VERIFICATION_PROVIDER", "biometric")
VERIFICATION_API_KEY: str = os.getenv("VERIFICATION_API_KEY", "")
CORS_ORIGINS: list[str] = os.getenv("CORS_ORIGINS", "*").split(",")
MAX_DOCUMENT_SIZE_BYTES: int = 10 * 1024 * 1024  # 10MB limit

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
