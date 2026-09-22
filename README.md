# PTalk – Medical AI Platform

PTalk is a role-based medical AI platform developed as part of the project work at PTIT.

The system combines:

- Next.js frontend
- Fastify backend
- PostgreSQL
- n8n workflows
- Obsidian-based patient knowledge storage
- RAG for patient-specific AI conversations
- Gemma as the language model
- Browser-based audio recording/upload
- Role-based authentication for patients, medical teams and administrators
- Weglot multilingual support

> Important: This repository contains application code, workflow definitions and the database schema. It must not contain real patient data, passwords, API keys, access tokens or other secrets.

---

## 1. System Overview

The general PTalk flow is:

```text
Patient / Medical Team / Admin
              |
              v
        Next.js Frontend
              |
              v
        Fastify Backend
              |
       +------+------+
       |             |
       v             v
 PostgreSQL        n8n
                     |
          +----------+----------+
          |                     |
          v                     v
   Medical AI Pipeline      Patient RAG
          |                     |
          v                     v
      PostgreSQL             Obsidian
                                |
                                v
                              Gemma
```

The backend is the security boundary for the application. Frontend route protection alone must not be treated as authorization.

---

# 2. Repository Structure

```text
medical-ai/
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── auth/
│   │   ├── database/
│   │   └── server/
│   ├── Dockerfile
│   ├── package.json
│   └── ...
│
├── src/
│   ├── app/
│   ├── components/
│   └── ...
│
├── public/
│   └── ptit-logo.png
│
├── n8n/
│   └── workflows/
│       ├── medical-ai-main.json
│       ├── patient-rag.json
│       └── patient-administration.json
│
├── database/
│   └── ptalk-schema.sql
│
├── .gitignore
├── README.md
└── ...
```

---

# 3. Main Components

## Frontend

The frontend is built with Next.js.

Main areas:

```text
/                  Public landing page
/login             Login
/register          Patient registration
/register/medical  Medical-team registration

/patient            Patient dashboard
/patient/history    Patient consultation history
/patient/ai         Patient AI chat
/patient/profile    Patient profile

/team               Medical-team dashboard

/admin              Administrator dashboard
```

The patient navigation contains:

```text
Home
History
AI
Profile
```

The interface also contains Weglot language support.

---

# 4. Backend

The backend is a Fastify application running on port `4000`.

The backend is containerized with Docker.

The Dockerfile is located at:

```text
backend/Dockerfile
```

The backend connects to PostgreSQL using environment variables.

Typical configuration:

```env
PORT=4000

DB_HOST=n8n-postgres
DB_PORT=5432
DB_NAME=n8n
DB_USER=n8n
DB_PASSWORD=YOUR_DATABASE_PASSWORD
```

The exact values depend on the local deployment.

Do not commit the real `.env` file.

---

# 5. Docker Networking

The PTalk backend, PostgreSQL and n8n are intended to communicate through the Docker network:

```text
n8n-network
```

The backend uses the PostgreSQL Docker service name instead of `localhost` when PostgreSQL runs in another container.

For example:

```env
DB_HOST=n8n-postgres
```

This is important.

Inside a Docker container:

```text
localhost
```

means the current container, not another container.

---

# 6. PostgreSQL Database

The PTalk database uses PostgreSQL.

The repository contains the PTalk schema here:

```text
database/ptalk-schema.sql
```

The schema contains the main PTalk tables:

```text
patient_identity
patient_consultations

symptoms
diseases
disease_symptoms

consultation_symptoms
consultation_disease_matches

ptalk_users
ptalk_sessions
```

The schema contains:

- primary keys
- unique constraints
- foreign keys
- indexes
- role constraints
- account-status constraints

The schema file does not contain patient data.

---

# 7. Patient Data Model

Patient identity is stored in:

```text
patient_identity
```

Relevant fields:

```text
patient_id
first_name
last_name
date_of_birth
created_at
updated_at
```

Consultations are stored in:

```text
patient_consultations
```

Important fields include:

```text
consultation_id
patient_id
consultation_date
language
transcript
chief_complaint
duration
severity
relevant_history
clinical_summary
emergency
urgency
red_flags
emergency_reason
```

Symptoms and disease relationships are stored separately:

```text
symptoms
diseases
disease_symptoms
consultation_symptoms
consultation_disease_matches
```

---

# 8. Authentication

PTalk uses session-based authentication.

The main authentication tables are:

```text
ptalk_users
ptalk_sessions
```

Users can have one of three roles:

```text
patient
medical_team
admin
```

Medical-team accounts also have a status:

```text
pending
approved
rejected
```

A medical-team account cannot access protected medical-team functionality until it is approved.

---

# 9. Patient Registration

The patient registration flow is:

```text
Patient
  |
  v
/register
  |
  v
POST /api/auth/register
  |
  v
Fastify backend
  |
  +--> patient_identity
  |
  +--> ptalk_users
  |
  +--> ptalk_sessions
```

A patient registration creates the patient identity and user account.

The patient receives an authenticated session after successful registration.

---

# 10. Medical-Team Registration

Medical-team registration is separate from patient registration.

Frontend:

```text
/register/medical
```

API:

```text
POST /api/auth/register-medical
```

The registration creates:

```text
role = medical_team
status = pending
```

No authenticated session is created at this point.

An administrator must approve the account.

Flow:

```text
Medical Team Registration
          |
          v
       pending
          |
          v
    Administrator
          |
     +----+----+
     |         |
     v         v
  approved   rejected
     |
     v
 Medical Team Login
```

---

# 11. Administrator

The administrator can manage medical-team accounts.

Admin area:

```text
/admin
```

The backend provides:

```text
GET  /api/admin/medical-users

POST /api/admin/medical-users/:id/approve

POST /api/admin/medical-users/:id/reject
```

Only users with:

```text
role = admin
```

can access these operations.

The default development admin used during the project was:

```text
email: admin@ptalk.local
```

The password must not be stored in this README or in the repository.

If a new installation needs an administrator, create one securely in the database instead of committing credentials.

---

# 12. Medical-Team Dashboard

Medical-team users can access:

```text
/team
```

The dashboard provides:

- patient overview
- consultation count
- latest consultation
- emergency status
- date filtering
- patient history

Backend endpoints include:

```text
GET /api/team/patients
GET /api/team/patients/:patient_id/history
```

The backend verifies the authenticated role before returning medical-team data.

---

# 13. Patient Data Access

Patient endpoints are protected by authentication and patient ownership.

Examples:

```text
GET /api/patient/me
PUT /api/patient/me
GET /api/patient/history
```

A patient may only access data belonging to the authenticated `patient_id`.

The frontend must never be considered the security mechanism for this.

The backend performs the actual authorization.

---

# 14. Consultation Pipeline

A consultation is processed through n8n.

The main workflow is:

```text
n8n/workflows/medical-ai-main.json
```

The general pipeline is:

```text
Consultation input
       |
       v
Speech / transcript processing
       |
       v
Symptom extraction
       |
       v
Disease matching
       |
       v
Emergency / red-flag analysis
       |
       v
Clinical summary
       |
       v
PostgreSQL
       |
       +------------------+
       |                  |
       v                  v
Patient Administration   Obsidian
```

The workflow stores consultation information and connects it to symptoms and disease matches.

---

# 15. Patient Administration Workflow

Workflow:

```text
n8n/workflows/patient-administration.json
```

This workflow is responsible for creating/updating the patient's Obsidian structure.

The structure is approximately:

```text
/data/obsidian/
└── Patients/
    └── <patient_id>/
        ├── Patient.md
        └── Consultations/
            ├── ...
            ├── ...
            └── ...
```

`Patient.md` contains patient information and links to consultations.

The workflow uses PostgreSQL to obtain patient and consultation information.

---

# 16. Obsidian

Obsidian acts as the human-readable patient knowledge layer.

The expected directory is:

```text
/data/obsidian/Patients/
```

This path must exist or be writable by the n8n environment.

If the Obsidian storage location changes, update the relevant n8n workflow nodes.

The Patient Administration workflow currently uses paths similar to:

```text
/data/obsidian/Patients/<patient_id>/
```

and:

```text
/data/obsidian/Patients/<patient_id>/Consultations/
```

---

# 17. Patient RAG

The patient AI uses:

```text
n8n/workflows/patient-rag.json
```

The frontend sends a patient question to:

```text
/api/patient/ai
```

The backend authenticates the patient and forwards the request to n8n.

The n8n webhook is:

```text
ptalk/patient/ask
```

The general flow is:

```text
Patient question
       |
       v
Next.js
       |
       v
Fastify authentication
       |
       v
n8n Patient RAG
       |
       v
Patient Obsidian files
       |
       v
Consultation context
       |
       v
Gemma
       |
       v
AI response
       |
       v
Patient
```

The patient ID is supplied by the authenticated backend session.

The frontend must not be allowed to freely choose another patient's ID.

---

# 18. Gemma Configuration

The n8n workflows call the Gemma API.

The public workflow files intentionally use placeholders rather than private credentials.

Examples of placeholders:

```text
API_URL
Bearer_GEMMA
```

Before running the workflows in another environment, replace these with the appropriate Gemma endpoint and authentication mechanism.

Do not commit the real token.

Recommended approach:

```text
GitHub
  |
  +--> workflow JSON with placeholders
  |
  +--> no secrets

n8n
  |
  +--> real API endpoint
  +--> real credentials
```

If the Gemma API changes, update the HTTP Request nodes in:

```text
n8n/workflows/medical-ai-main.json
n8n/workflows/patient-rag.json
```

---

# 19. Speech-to-Text

The consultation pipeline can use a speech-to-text API.

The public workflow intentionally contains placeholders such as:

```text
Transcribe_URL
X-ASK
```

These must be replaced in the local n8n instance with the actual STT endpoint and authentication configuration.

Do not commit STT tokens to GitHub.

If an API token has previously been exposed, revoke/rotate it before using the public repository.

---

# 20. n8n Setup

The repository contains workflow definitions only.

It does not contain:

- the n8n installation
- n8n credentials
- PostgreSQL passwords
- Gemma API keys
- STT API keys
- real patient data

Import the workflows into the target n8n instance:

```text
n8n/workflows/medical-ai-main.json
n8n/workflows/patient-rag.json
n8n/workflows/patient-administration.json
```

After importing, check all credentials.

In particular, PostgreSQL nodes use an n8n credential reference.

The target n8n installation may require reconnecting the PostgreSQL credential manually.

Also verify the subworkflow references between:

```text
medical-ai-main
patient-administration
```

and:

```text
medical-ai-main
Obsidian-related workflow
```

Workflow IDs can differ between n8n installations.

---

# 21. PostgreSQL Credential

n8n needs a PostgreSQL credential pointing to the PTalk database.

The exact values depend on the Docker setup.

Typical values are:

```text
Host: n8n-postgres
Port: 5432
Database: n8n
User: n8n
Password: <local database password>
```

The backend uses the same PostgreSQL database.

This is intentional in the current architecture.

---

# 22. Backend Environment Variables

Create a local backend `.env` file.

Example:

```env
PORT=4000

DB_HOST=n8n-postgres
DB_PORT=5432
DB_NAME=n8n
DB_USER=n8n
DB_PASSWORD=CHANGE_ME
```

The actual password depends on the deployment.

Never commit:

```text
.env
.env.local
.env.production
```

to a public repository.

---

# 23. Frontend Environment

The frontend communicates with the backend through the configured API/proxy routes.

If the backend location changes, check the Next.js API route implementations under:

```text
src/app/api/
```

Especially check routes for:

```text
auth
admin
patient
team
```

The current development configuration expects the backend to be available on:

```text
http://localhost:4000
```

when the Next.js application runs outside the Docker network.

If the frontend is moved into Docker, the backend hostname may need to change from:

```text
localhost
```

to the backend Docker service name.

---

# 24. Local Docker Architecture

A typical local setup is:

```text
                    Docker Host
                         |
              +----------+----------+
              |                     |
              v                     v
        Next.js / Host         n8n-network
                                    |
                     +--------------+--------------+
                     |              |              |
                     v              v              v
                n8n backend     PostgreSQL     PTalk Backend
```

The exact deployment can differ.

The important requirement is that:

```text
PTalk Backend -> PostgreSQL
n8n -> PostgreSQL
n8n -> Gemma API
n8n -> STT API
n8n -> /data/obsidian
```

must all be reachable.

---

# 25. Health Check

The backend provides:

```text
GET /health
```

The response checks both:

```text
PTalk backend
PostgreSQL connection
```

A healthy response contains:

```json
{
  "status": "ok",
  "service": "ptalk-backend",
  "database": "connected"
}
```

If the database is unavailable, the health response reports the database as disconnected.

---

# 26. Backend Authorization

The backend contains authentication helpers under:

```text
backend/src/auth/
```

Important files include:

```text
backend/src/auth/index.ts
backend/src/auth/session.ts
backend/src/auth/requireAuth.ts
```

The authorization model is:

```text
patient
    -> patient endpoints

medical_team
    -> medical-team endpoints

admin
    -> admin endpoints
```

Medical-team users additionally require:

```text
status = approved
```

Do not remove backend authorization checks just because the frontend already hides a page.

---

# 27. Changing the Database

If the PTalk database schema changes:

1. Update the PostgreSQL database.
2. Update:

```text
database/ptalk-schema.sql
```

3. Check affected backend queries.
4. Check affected n8n SQL nodes.
5. Check the frontend API types.
6. Test patient and medical-team access again.

Do not replace the schema file with a full production database dump.

Production patient data must remain private.

---

# 28. Changing the n8n Workflows

When changing an n8n workflow:

1. Make the change in the n8n instance.
2. Export the workflow as JSON.
3. Remove or replace secrets before committing.
4. Check for real patient data.
5. Save the sanitized JSON under:

```text
n8n/workflows/
```

6. Commit the updated workflow.

Never commit an n8n credential export containing private credentials.

---

# 29. Important Things to Change for a New Deployment

A new deployment should review at least the following:

### Database

Change:

```text
DB_PASSWORD
```

to the actual secure PostgreSQL password.

### Gemma

Configure:

```text
Gemma API URL
Gemma authentication
```

in n8n.

### Speech-to-Text

Configure:

```text
STT URL
STT authentication
```

in n8n.

### Obsidian

Verify:

```text
/data/obsidian/Patients/
```

exists and is writable.

#
## Environment and Storage Configuration

A working PTalk installation depends on several environment-specific settings. These values must be adapted when the project is moved to another server, Docker host, domain, or infrastructure.

### 1. n8n Obsidian storage

The n8n workflows use the following container path:

```text
/data/obsidian
```

Both **Patient Administration** and **Patient RAG** depend on this path.

Patient Administration writes:

```text
/data/obsidian/Patients/{patient_id}/Patient.md
/data/obsidian/Patients/{patient_id}/Consultations/
```

Patient RAG reads the same patient and consultation files.

Therefore, the n8n container must have a persistent, writable bind mount or Docker volume at:

```text
<HOST_OBSIDIAN_PATH>:/data/obsidian
```

Example Docker Compose configuration:

```yaml
services:
  n8n:
    volumes:
      - <HOST_OBSIDIAN_PATH>:/data/obsidian
```

`<HOST_OBSIDIAN_PATH>` is intentionally a placeholder. It must be replaced with the actual storage directory on the deployment machine.

The host directory must:

- exist before n8n starts
- be writable by the user/process running n8n
- persist independently from the n8n container
- contain the `Patients/` directory or allow n8n to create it
- remain available after container recreation or updates

The **Patient Administration** workflow also uses an `Execute Command` node to create patient directories. The n8n deployment therefore needs to allow this workflow operation, and the n8n process must have permission to create directories below `/data/obsidian`.

Do not store the Obsidian patient data inside the Git repository.

### 2. Backend environment

The backend reads its PostgreSQL configuration from its environment:

```text
PORT=4000
DB_HOST=<POSTGRES_HOST>
DB_PORT=5432
DB_NAME=<POSTGRES_DATABASE>
DB_USER=<POSTGRES_USER>
DB_PASSWORD=<POSTGRES_PASSWORD>
```

The actual values are deployment-specific and must not be committed to GitHub.

The backend must be able to reach PostgreSQL over the Docker network. In the current local Docker setup, the PostgreSQL service is reachable through the Docker network used by n8n and the backend.

### 3. Frontend and backend URLs

The frontend contains API proxy routes that communicate with the backend. When PTalk is moved from the current local setup to another server or domain, these URLs must be reviewed.

Typical deployment values include:

```text
Frontend URL
Backend URL
n8n webhook URL
```

Do not assume that `localhost` is correct in production. Inside Docker, `localhost` refers to the current container, not another service.

The following connections therefore need to be checked after deployment:

```text
Browser
   |
   v
Frontend / Next.js
   |
   v
Backend / Fastify
   |
   +----> PostgreSQL
   |
   +----> n8n webhooks
              |
              +----> Gemma API
              |
              +----> STT API
              |
              +----> /data/obsidian
```

### 4. n8n environment and credentials

The n8n installation requires access to:

- PostgreSQL
- the Obsidian storage directory
- Gemma
- the STT service
- the imported PTalk workflows

The PostgreSQL connection used by the workflows is represented by an n8n credential. After importing the workflows into another n8n instance, the PostgreSQL credential may need to be recreated or reassigned.

Workflow exports may contain credential references, but they must not contain actual passwords, API tokens, or other secrets.

Gemma and STT endpoints/tokens must be configured for the target environment. The public repository intentionally uses placeholders instead of real credentials.

### 5. Docker networking

The backend and n8n need network access to the services they communicate with.

The intended local architecture is:

```text
ptalk-backend
      |
      +-------------------+
      |                   |
      v                   v
 n8n-network          PostgreSQL
      |
      v
     n8n
      |
      +----> Gemma
      |
      +----> STT
      |
      +----> /data/obsidian
```

When deploying to a new machine, verify:

1. Backend and PostgreSQL can communicate.
2. Backend can reach the n8n webhook.
3. n8n can reach PostgreSQL.
4. n8n can reach Gemma.
5. n8n can reach the STT service.
6. n8n can read and write `/data/obsidian`.
7. The frontend can reach the backend through the configured API routes.

### 6. Production security

Before public deployment:

- replace all local development URLs
- configure HTTPS
- restrict CORS to the actual frontend origin
- use strong PostgreSQL credentials
- use strong admin credentials
- configure real secrets through environment variables or a secret manager
- never commit `.env` files
- never commit API tokens
- never commit PostgreSQL passwords
- never commit real patient records
- keep `/data/obsidian` outside the public Git repository
- review imported n8n credentials and permissions
- rotate any credentials that were previously exposed during development


## n8n PostgreSQL credential

Reconnect the credential after importing workflows if necessary.

### n8n workflow references

Check subworkflow references because IDs can differ between installations.

### Admin account

Create/use a secure administrator account.

Do not use a development password in production.

### Public deployment

For public deployment configure:

```text
HTTPS
reverse proxy
secure cookies
CORS
environment variables
database security
```

---

# 30. Public Deployment

For public deployment the architecture can be:

```text
Internet
   |
   v
HTTPS / Reverse Proxy
   |
   v
Next.js
   |
   v
Fastify Backend
   |
   v
PostgreSQL
```

n8n remains part of the internal backend infrastructure.

The following should not be publicly exposed without appropriate protection:

```text
PostgreSQL
n8n editor
Obsidian storage
internal backend services
```

Use HTTPS for authentication and medical data transmission.

---

# 31. Security Checklist

Before making the project public or deploying it:

```text
[ ] No .env files in GitHub
[ ] No API tokens in workflow JSON
[ ] No database passwords in source code
[ ] No real patient data in GitHub
[ ] No consultation transcripts containing real patient information
[ ] No exported n8n credentials
[ ] No production admin passwords
[ ] No exposed PostgreSQL port unless required
[ ] HTTPS enabled for public deployment
[ ] Backend authorization enabled
[ ] Patient ownership checks enabled
[ ] Medical-team approval required
[ ] Admin endpoints protected
[ ] Obsidian storage protected
```

---

# 32. Important Privacy Rule

PTalk handles medical information.

The following must never be committed to the public repository:

```text
Patient names
Dates of birth
Patient IDs linked to real people
Consultation transcripts
Clinical summaries
Medical history
API tokens
Passwords
Password hashes
Database credentials
n8n credentials
```

The repository should contain the system needed to reproduce the application, not the real medical database.

---

# 33. Development Workflow

When developing a feature:

```text
1. Change frontend/backend code
        |
        v
2. Test locally
        |
        v
3. Test backend authorization
        |
        v
4. Test affected n8n workflow
        |
        v
5. Check database changes
        |
        v
6. Remove secrets from exports
        |
        v
7. Commit to GitHub
```

For database changes also update:

```text
database/ptalk-schema.sql
```

For n8n changes also update:

```text
n8n/workflows/
```

---

# 34. Current PTalk Features

The current project includes:

- Public landing page
- PTIT branding
- Patient registration
- Medical-team registration
- Administrator approval workflow
- Role-based authentication
- Session authentication
- Patient profile
- Patient consultation history
- Medical-team patient dashboard
- Date filtering
- Emergency status display
- Consultation detail views
- AI patient chat
- Patient-specific RAG
- Gemma integration
- n8n integration
- PostgreSQL persistence
- Obsidian patient knowledge storage
- Audio recording
- Audio upload/playback
- Markdown-style AI response rendering
- Weglot multilingual interface
- Dockerized backend

---

# 35. Deferred / Future Features

The following were evaluated or planned but are not part of the current stable workflow:

- Image uploads for consultations
- Virtual microphone integration
- Further production deployment hardening
- Additional GitHub/public-release cleanup if required

These should be implemented separately and tested against the existing authorization and privacy model.

---

# 36. Reproducing the Project

To reproduce PTalk on another machine:

```text
1. Clone the repository
2. Install/start the required Docker infrastructure
3. Start PostgreSQL
4. Apply database/ptalk-schema.sql
5. Configure backend environment variables
6. Build/start the Fastify backend
7. Start n8n
8. Configure the PostgreSQL credential in n8n
9. Import the three workflow JSON files
10. Reconnect credentials
11. Configure Gemma
12. Configure STT if required
13. Configure /data/obsidian
14. Start the Next.js frontend
15. Test /health
16. Test registration/login
17. Test medical-team approval
18. Test a consultation
19. Test Patient RAG
```

The exact Docker commands depend on the deployment environment and are intentionally not hard-coded here.

---

# 37. Troubleshooting

## Backend cannot connect to PostgreSQL

Check:

```text
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

If PostgreSQL is another Docker container, do not use:

```text
localhost
```

Use the Docker service/container hostname.

---

## n8n cannot connect to PostgreSQL

Check the n8n PostgreSQL credential.

The hostname must be reachable from the n8n container.

---

## Patient RAG does not respond

Check:

```text
Patient RAG workflow is active
Webhook path = ptalk/patient/ask
Gemma endpoint
Gemma authentication
Obsidian path
Patient folder
```

Also verify that the Fastify backend is forwarding the authenticated patient's ID.

---

## Medical team cannot log in

Check:

```text
ptalk_users.role = medical_team
ptalk_users.status = approved
```

A `pending` account must be approved by an administrator first.

---

## Obsidian files are not created

Check:

```text
/data/obsidian/Patients/
```

and make sure the n8n environment can write to it.

Also check the Patient Administration workflow.

---

## Imported n8n workflow shows missing credentials

This is expected when importing a workflow into another n8n instance.

Open the affected nodes and reconnect the local credentials.

Also check subworkflow references.

---

# 38. Repository Safety

The public repository is intended to contain:

```text
Application source code
Docker configuration
Database schema
Sanitized n8n workflows
Documentation
```

It is not intended to contain:

```text
Production database dumps
Patient data
Production credentials
API tokens
Private keys
Passwords
n8n credential secrets
```

If a secret is accidentally committed:

1. Remove it from the repository.
2. Revoke/rotate the secret.
3. Replace it with a placeholder.
4. Check the repository history if necessary.

Simply deleting a secret from the latest file does not necessarily remove it from Git history.

---

# 39. Project Architecture Summary

```text
                        PTALK
                          |
          +---------------+---------------+
          |               |               |
          v               v               v
       Patient       Medical Team       Admin
          |               |               |
          +---------------+---------------+
                          |
                          v
                    Next.js Frontend
                          |
                          v
                    Fastify Backend
                          |
              +-----------+-----------+
              |                       |
              v                       v
         PostgreSQL                  n8n
                                      |
                    +-----------------+----------------+
                    |                 |                |
                    v                 v                v
             Medical AI          Patient RAG       Obsidian
             Pipeline                                |
                    |                                 |
                    +--------------+------------------+
                                   |
                                   v
                                 Gemma
```

The central principle is:

```text
Frontend
   -> Backend authentication/authorization
      -> PostgreSQL / n8n
         -> patient-specific processing
```

Patient-specific AI data must always remain scoped to the authenticated patient.

---

# 40. Final Deployment Checklist

Before considering a deployment ready:

```text
[ ] Frontend starts
[ ] Backend starts
[ ] /health returns database connected
[ ] PostgreSQL schema is installed
[ ] n8n starts
[ ] PostgreSQL credential works in n8n
[ ] Main workflow works
[ ] Patient Administration works
[ ] Patient RAG works
[ ] Gemma connection works
[ ] STT connection works if enabled
[ ] Obsidian storage works
[ ] Patient registration works
[ ] Patient login works
[ ] Medical-team registration works
[ ] Admin approval works
[ ] Medical-team login works after approval
[ ] Admin login works
[ ] Patient ownership restrictions work
[ ] No secrets are committed
[ ] No real patient data is committed
[ ] HTTPS is configured for public deployment
```

---

## License / Project Status

This repository represents the current PTalk project implementation.

The architecture and configuration may require environment-specific changes before deployment to another machine or server.
