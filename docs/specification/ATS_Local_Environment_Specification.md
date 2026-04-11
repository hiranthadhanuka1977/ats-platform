# ATS Local Environment Specification

## Architecture Best Practices & Setup Guidelines

---

## 1. Purpose

This document defines the recommended local development environment, architectural principles, and technical guidelines for building the ATS.

Goals:
- Keep initial cost low
- Enable local-first development
- Support future cloud and on-prem deployment
- Avoid rework due to poor early decisions

---

## 2. Objectives

The local environment must:
- Support full MVP development
- Be deployment-ready in design
- Use configuration-driven setup
- Support DB migrations
- Store files outside DB
- Be simple and scalable

---

## 3. Architectural Principles

### 3.1 Local-First, Deployment-Ready
System should run locally but be deployable to:
- Cloud VM
- On-prem server
- Docker environment

---

### 3.2 Configuration-Driven Design
No hardcoding.

Examples:
- DB connection
- Upload paths
- Email configs
- OAuth configs

---

### 3.3 Database is NOT File Storage
DB stores:
- structured data
- metadata
- file references

Files stored outside:
- resumes
- PDFs
- images

---

### 3.4 Migration-Driven Schema
Always use migrations.

Avoid:
- manual DB edits
- undocumented changes

---

### 3.5 Modular Expansion
Design for future modules:
- interviews
- workflows
- RBAC
- reporting

---

## 4. Local Architecture

```
Developer Machine
 ├── Frontend
 ├── Backend
 ├── PostgreSQL
 ├── File Storage
 └── Config Files
```

---

## 5. Tech Stack

### Database
- PostgreSQL

### DB Tools
- pgAdmin / DBeaver

### Migrations
- Prisma / Knex / Flyway

### File Storage
```
/storage
  /resumes
  /banners
  /avatars
```

---

## 6. Project Structure

```
/ats-project
  /frontend
  /backend
  /database
    /migrations
    /seeds
  /storage
  /docs
  .env
  .env.example
```

---

## 7. Environment Config

Example:

```
APP_ENV=local
DATABASE_URL=postgresql://user:pass@localhost:5432/ats_db
UPLOAD_ROOT=./storage
```

Rules:
- no hardcoded values
- no secrets in repo

---

## 8. Database Best Practices

- Build MVP schema first
- Use seed data
- Add constraints
- Add indexes
- Keep future expansion fields (e.g., company_id)

---

## 9. File Handling

- Store files outside DB
- Store metadata in DB
- Validate uploads
- Separate folders by type

---

## 10. Dev Workflow

### Setup
1. Install PostgreSQL
2. Create DB
3. Run migrations
4. Seed data
5. Start app

### Daily Flow
- Pull code
- Run migrations
- Develop & test

---

## 11. Security

- Hash passwords
- Validate uploads
- Use env variables
- Separate user roles

---

## 12. Logging

Log:
- DB connection
- API errors
- uploads
- auth events

---

## 13. Backup

- DB dumps
- optional file backup

---

## 14. Deployment Readiness

Ensure:
- PostgreSQL used everywhere
- config-driven paths
- migration consistency

---

## 15. Transition Path

### Stage 1
Local setup

### Stage 2
Dockerize

### Stage 3
Deploy to cloud

### Stage 4
Package for on-prem

---

## 16. Summary

- Start simple
- Use PostgreSQL
- Use migrations
- Store files outside DB
- Keep config external
- Design for scalability

---

## 17. Final Recommendation

Use:
- Local PostgreSQL
- Local storage
- Migration tools
- Clean project structure

This ensures:
- Low cost
- Fast development
- Future scalability
