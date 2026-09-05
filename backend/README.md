# Bayanihan Hub — Python FastAPI Backend

This backend service is built with **Python 3** and **FastAPI** to power identity verification and facial biometric matching for Bayanihan Hub registrations.

## Architecture

```text
User Registration
      ↓
Valid Philippine ID Selection
      ↓
Dynamic ID Information & Validation
      ↓
ID Document Upload & Server-side Validation
      ↓
Facial Biometric Selfie Capture
      ↓
Python Biometric Cross-Comparison Engine (ID Photo vs. Live Selfie)
      ↓
Verification Result (VERIFIED / REJECTED / RETRY_REQUIRED)
      ↓
Account Activation & Admin Moderation Record
```

## Features

- **FastAPI Framework**: High-performance, async Python API with automatic OpenAPI / Swagger documentation.
- **Biometric Matching Engine** (`app/services/biometric_engine.py`):
  - Normalized token and string similarity for legal name matching.
  - Biometric cross-comparison between ID document photo and live facial selfie.
  - Liveness verification and image clarity checks.
  - Expiration date checking against current UTC date.
  - Automatic masking of sensitive identification numbers (`mask_id_number`).
- **Pluggable Providers** (`app/services/providers.py`):
  - Built-in Core Biometric Engine
  - AWS Rekognition provider (pluggable via `VERIFICATION_PROVIDER=aws_rekognition`)
  - Google Cloud Vision provider (pluggable via `VERIFICATION_PROVIDER=google_vision`)

## Getting Started

### 1. Create and activate a virtual environment:

**Windows (PowerShell):**
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install dependencies:
```powershell
pip install -r requirements.txt
```

### 3. Run the development server:
```powershell
python run.py
```
Or via uvicorn directly:
```powershell
uvicorn app.main:app --reload --port 3001
```

The API will be running at `http://localhost:3001`.
View interactive Swagger API docs at `http://localhost:3001/docs`.

## API Endpoints

- `POST /api/verification/verify`: Process ID information and facial selfie for biometric verification.
- `POST /api/verification/validate-document`: Validate uploaded document format and size limit.
- `GET /api/verification/supported-ids`: List all 16 supported Philippine government IDs.
- `GET /health`: Backend service health check.
