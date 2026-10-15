EMPLOYEE MANAGEMENT SYSTEM - STUDENT SETUP GUIDE
=================================================

Follow these steps to run the project on your machine.

-------------------------------------------------
1) Prerequisites
-------------------------------------------------
Install these first:
- Java 17+
- Maven
- Node.js 18+
- MySQL 8.0 (or Docker Desktop if you want MySQL in Docker)

-------------------------------------------------
2) Project Structure
-------------------------------------------------
- backend  -> Spring Boot API (runs on http://localhost:8080)
- frontend -> React + Vite app (runs on http://localhost:3000)

-------------------------------------------------
3) Database Setup (MySQL)
-------------------------------------------------
A) If using local MySQL:
1. Make sure MySQL is running on port 3306.
2. Create database (optional, app can auto-create):
   CREATE DATABASE IF NOT EXISTS ems_db;

B) If using Docker for MySQL (optional):
1. From project root, run:
   docker compose up -d
2. This starts MySQL container on port 3306.

-------------------------------------------------
4) Change Database Username/Password (IMPORTANT)
-------------------------------------------------
Open file:
backend/src/main/resources/application.properties

Update these properties with YOUR MySQL credentials:
- spring.datasource.username=YOUR_DB_USERNAME
- spring.datasource.password=YOUR_DB_PASSWORD

Current defaults in this project are:
- username: root
- password: admin

If your DB username/password is different, you MUST change them before starting backend.

-------------------------------------------------
5) Run Backend
-------------------------------------------------
Open terminal in project root, then run:

cd backend
mvn spring-boot:run

Backend should start on:
http://localhost:8080

-------------------------------------------------
6) Run Frontend
-------------------------------------------------
Open a NEW terminal in project root, then run:

cd frontend
npm install
npm run dev

Frontend should start on:
http://localhost:3000

-------------------------------------------------
7) Login with Demo Credentials
-------------------------------------------------
After backend starts successfully, use any of these demo accounts:

ADMIN    | admin@ems.com| password123
HR       | hr@ems.com       | password123
EMPLOYEE | employee@ems.com | password123

Note:
- Demo users are created automatically on first backend run with a fresh database.
- These are also listed in demo-credentials.txt.

-------------------------------------------------
8) Quick Troubleshooting
-------------------------------------------------
- If backend fails DB     connection: recheck username/password in application.properties.
- If frontend cannot call backend: make sure backend is running on port 8080.
- If port 3306 is busy: stop another MySQL instance/container and retry.

Done. You can now sign in and start using the system.
