# Laragon MySQL Setup for Bayanihan Hub

This guide explains how **Laragon** is configured on this machine to host the **Bayanihan Hub** relational database (3NF architecture).

---

## 1. Connection Details

| Setting | Value |
| :--- | :--- |
| **Host** | localhost / 127.0.0.1 |
| **Port** | 3307 |
| **Username** | oot |
| **Password** | *(empty / blank)* |
| **Database** | ayanihan_hub |
| **MySQL Engine** | MySQL 8.4.3 Community Server (Laragon) |
| **Data Directory** | C:\laragon\data\mysql-8.4 |

> **Why Port 3307?**  
> A pre-existing Windows service (MySQL80 / MySQL Server 9.6) was installed on the machine listening on port 3306. To prevent port collisions and eliminate the need for Windows Administrator elevation, Laragon MySQL is configured on port 3307.

---

## 2. Opening the Database in HeidiSQL (Laragon)

1. Open **Laragon**.
2. Click the **Database** button in the Laragon window (this launches HeidiSQL).
3. In HeidiSQL session manager, set:
   - **Hostname / IP**: 127.0.0.1
   - **User**: oot
   - **Password**: *(leave blank)*
   - **Port**: 3307
   - **Databases**: ayanihan_hub
4. Click **Open**. You will see all 44 normalized 3NF tables and reference seed data.

---

## 3. Database Initialization & Verification

The database is fully initialized with:
- **44 relational tables** across 10 functional domains (Third Normal Form compliant)
- **16 Philippine Government IDs** with validation regex patterns and formatting rules
- **Account statuses**: PENDING, APPROVED, REJECTED, REQUIRES_REVIEW
- **Roles**: dmin, user, guest

To re-run migrations or verify the connection anytime:
`powershell
cd backend
.\.venv\Scripts\python.exe db\init_db.py
`

---

## 4. Running the Backend Server

From the ackend/ folder:
`powershell
cd backend
.\.venv\Scripts\python.exe run.py
`
The FastAPI backend will start on http://localhost:3001 and connect directly to Laragon MySQL.
