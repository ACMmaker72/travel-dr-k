# Project Plan: Travel Korea for Medical (MedTour-Korea)

## 1. Project Overview & Background

- **Service Name:** Travel Korea for Medical (Temporary)
- **Service Nature:** An AI/Doctor-driven Medical Tourism Coordination Platform matching foreign patients with appropriate Korean medical institutions, designing schedules, and planning pre/post-care.
- **Regulatory Background:** Based on the South Korean medical law amendment (passed May 2026, effective May 2027), which officially allows designated medical institutions to utilize ICT for pre-and-post care, consultations, and remote treatment for foreign patients.
- **Core Strategy:** Under the strict guidance of an affiliated Korean medical doctor (Medical Curator), the platform filters patient cases, ensures compliance, and mitigates legal/operational risks while providing a seamless user experience.

---

## 2. Target Users & Core Value Proposition

### Foreign Patients (End Users)

- **Core Needs:** Clear information on where they can get treated, estimated costs, required stay duration, preparation documents, and post-operative care after returning home.
- **Value Proposition:** Medical case review by an actual doctor before visiting Korea, resulting in accurate matching and a structured, trustworthy medical/travel itinerary.

### Affiliated Medical Doctor (Internal Curator)

- **Role:** Reviews incoming medical requests, checks clinical appropriateness, categorizes severity, lists required pre-visit tests, and recommends optimal partner hospitals.
- **Value Proposition:** Efficient case management system that replaces manual, unorganized consulting with medical-standard pre-screening.

### Administrator / Coordinator (Operator)

- **Role:** Manages hospital communication, arranges legal procedures, schedules itineraries, and coordinates logistics (accommodation, interpretation, transportation).

---

## 3. Core MVP Product Architecture

The system is split into a **Public-Facing Exploration & Request Funnel** and an **Internal Case Management CRM (Backoffice)**.

### A. Public Pages (Patient Facing)

1. **Landing & Exploration:**
   - Showcases medical categories (e.g., Health Screening, Dental, Dermatology/Plastic Surgery, Orthopedics, Fertility, Advanced Therapeutics).
   - Display key metadata prominently per service card: *Estimated Price Range (From $X)*, *Recommended Stay (X Days)*, *Required Documents*, *Pre/Post-care Availability*.
2. **Medical Consultation Request Form (Lead Capture):**
   - Step-by-step funnel gathering: Medical goals/symptoms, preferred timeline, budget constraints, maximum stay duration, language, and **medical report/image uploads**.
3. **Patient Dashboard (My Page):**
   - Real-time status tracker: `Submitted` -> `Medical Review` -> `Matching Proposal` -> `Confirmed Itinerary` -> `Post-Care`.
   - Access to proposed itineraries, preparation checklists, and required document upload slots.

### B. Backoffice (Doctor & Admin Portal)

1. **Doctor's Case Review Panel:**
   - View patient-submitted medical histories and uploaded files.
   - Clinical sorting: Categorize complexity (Routine, Specialized, Critical, Ineligible) and append recommended partner hospital profiles.
2. **Admin Coordination Workspace:**
   - Takes doctor's clinical matching data and attaches final pricing, accommodation plans, and dates.
   - Standardized proposal generation dispatched directly to the Patient Dashboard.

---

## 4. Technical Stack Constraints (As per CLAUDE.md & DESIGN.md)

- **Framework:** Next.js 16 (App Router, `app/`) + React 19 + TypeScript.
- **Database & Auth:** Supabase + Drizzle ORM.
- **Styling & UI:** Tailwind CSS v4 + shadcn/ui + Pretendard Font.
- **Architecture Philosophy:** Simple, strict data isolation, non-custodial handling where applicable. Keep DB logic slim, follow the exact rules defined in `CLAUDE.md`.

---

## 5. Database Schema Blueprint (Drizzle ORM Guide)

### `users` (Managed via Supabase Auth)

- `id` (uuid, PK)
- `role` (enum: `patient`, `doctor`, `admin`)
- `full_name` (text)
- `country` (text)
- `preferred_language` (text)

### `medical_cases` (Core Consultation Tickets)

- `id` (uuid, PK)
- `patient_id` (uuid, FK -> users.id)
- `category` (text - e.g., `dental`, `screening`)
- `symptoms_description` (text)
- `preferred_visit_date` (text)
- `budget_range` (text)
- `max_stay_days` (integer)
- `status` (enum: `submitted`, `under_review`, `proposed`, `confirmed`, `completed`)
- `doctor_severity` (enum: `routine`, `specialized`, `critical`, `ineligible`, null)
- `doctor_notes` (text)
- `created_at` (timestamp)

### `case_attachments` (Medical Records / Images)

- `id` (uuid, PK)
- `case_id` (uuid, FK -> medical_cases.id)
- `file_url` (text - Supabase Storage reference)
- `file_type` (text)
- `uploaded_at` (timestamp)

### `proposals` (Itinerary & Price Offers)

- `id` (uuid, PK)
- `case_id` (uuid, FK -> medical_cases.id)
- `hospital_name` (text)
- `estimated_cost` (numeric)
- `itinerary_details` (jsonb - dates, accommodation, local transfers)
- `admin_notes` (text)
- `is_accepted` (boolean)

---

## 6. Implementation Phases (MVP Definition)

1. **Phase 1: Brand & Discovery (Front):** Build the discovery landing pages showcasing the medical product cards with estimated costs, durations, and requirements.
2. **Phase 2: The Request Funnel:** Implement the step-by-step multi-stage multi-part form for patient case collection, incorporating Supabase Storage for medical file uploads.
3. **Phase 4: Medical CRM Backoffice:** Build the Internal Portal allowing the doctor to review cases, update clinical status, and allowing the admin to draft a pricing/itinerary proposal.
4. **Phase 5: Status Loop Closure:** Enable the patient dashboard to view the proposal, track state changes, and complete the funnel.

---

## 7. Suggested AI Coding Prompt

Use this prompt in VS Code with an AI coding assistant such as Codex, Claude, or Cursor:

```text
현재 우리 프로젝트의 기획과 데이터베이스 구조, 기술 스택 제약 조건이 docs/PROJECT_PLAN.md에 정리되어 있어. 이 내용을 완전히 숙지하고, app/ 폴더 내에 해당 MVP 구현을 위한 Drizzle ORM 스키마 정의 코드(schema.ts)부터 순서대로 작성해줘.
```

This document separates business requirements (patient-facing discovery and lead capture) from backend operating logic (doctor/admin CRM), helping AI coding tools distinguish UI components from business logic.
