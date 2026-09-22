-- PTalk PostgreSQL schema
-- Extracted from the current PTalk database dump.
-- Contains PTalk application tables only, not n8n internal tables.
-- No patient/user data is included.

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

SET search_path = public;

CREATE TABLE IF NOT EXISTS public.patient_identity (
    patient_id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    date_of_birth date,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT patient_identity_pkey PRIMARY KEY (patient_id),
    CONSTRAINT unique_patient_identity UNIQUE (first_name, last_name, date_of_birth)
);

CREATE TABLE IF NOT EXISTS public.patient_consultations (
    consultation_id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid NOT NULL,
    consultation_date timestamp with time zone DEFAULT now() NOT NULL,
    language text,
    transcript text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    chief_complaint text,
    duration text,
    severity text,
    relevant_history text,
    clinical_summary text,
    emergency boolean,
    urgency text,
    red_flags jsonb,
    emergency_reason text,
    CONSTRAINT patient_consultations_pkey PRIMARY KEY (consultation_id)
);

CREATE TABLE IF NOT EXISTS public.symptoms (
    id integer NOT NULL,
    name text NOT NULL,
    CONSTRAINT symptoms_pkey PRIMARY KEY (id),
    CONSTRAINT symptoms_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.diseases (
    id integer NOT NULL,
    name text NOT NULL,
    CONSTRAINT diseases_pkey PRIMARY KEY (id),
    CONSTRAINT diseases_name_key UNIQUE (name)
);

CREATE TABLE IF NOT EXISTS public.disease_symptoms (
    disease_id integer NOT NULL,
    symptom_id integer NOT NULL,
    CONSTRAINT disease_symptoms_pkey PRIMARY KEY (disease_id, symptom_id)
);

CREATE TABLE IF NOT EXISTS public.consultation_symptoms (
    consultation_id uuid NOT NULL,
    symptom_id integer NOT NULL,
    evidence text,
    certainty text,
    CONSTRAINT consultation_symptoms_pkey PRIMARY KEY (consultation_id, symptom_id)
);

CREATE TABLE IF NOT EXISTS public.consultation_disease_matches (
    consultation_id uuid NOT NULL,
    disease_id integer NOT NULL,
    matching_symptoms integer NOT NULL,
    matched_symptoms jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT consultation_disease_matches_pkey
        PRIMARY KEY (consultation_id, disease_id)
);

CREATE TABLE IF NOT EXISTS public.ptalk_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    patient_id uuid,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'approved'::text NOT NULL,
    CONSTRAINT ptalk_users_pkey PRIMARY KEY (id),
    CONSTRAINT ptalk_users_email_key UNIQUE (email),
    CONSTRAINT ptalk_users_role_check
        CHECK (role = ANY (
            ARRAY[
                'patient'::text,
                'medical_team'::text,
                'admin'::text
            ]
        )),
    CONSTRAINT ptalk_users_status_check
        CHECK (status = ANY (
            ARRAY[
                'pending'::text,
                'approved'::text,
                'rejected'::text
            ]
        ))
);

CREATE TABLE IF NOT EXISTS public.ptalk_sessions (
    token text NOT NULL,
    user_id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ptalk_sessions_pkey PRIMARY KEY (token)
);

ALTER TABLE public.patient_consultations
    DROP CONSTRAINT IF EXISTS patient_consultations_patient_id_fkey;

ALTER TABLE public.consultation_symptoms
    DROP CONSTRAINT IF EXISTS consultation_symptoms_consultation_id_fkey;

ALTER TABLE public.consultation_symptoms
    DROP CONSTRAINT IF EXISTS consultation_symptoms_symptom_id_fkey;

ALTER TABLE public.consultation_disease_matches
    DROP CONSTRAINT IF EXISTS consultation_disease_matches_consultation_id_fkey;

ALTER TABLE public.consultation_disease_matches
    DROP CONSTRAINT IF EXISTS consultation_disease_matches_disease_id_fkey;

ALTER TABLE public.disease_symptoms
    DROP CONSTRAINT IF EXISTS disease_symptoms_disease_id_fkey;

ALTER TABLE public.disease_symptoms
    DROP CONSTRAINT IF EXISTS disease_symptoms_symptom_id_fkey;

ALTER TABLE public.ptalk_users
    DROP CONSTRAINT IF EXISTS ptalk_users_patient_id_fkey;

ALTER TABLE public.ptalk_sessions
    DROP CONSTRAINT IF EXISTS ptalk_sessions_user_id_fkey;

ALTER TABLE public.patient_consultations
    ADD CONSTRAINT patient_consultations_patient_id_fkey
    FOREIGN KEY (patient_id)
    REFERENCES public.patient_identity(patient_id);

ALTER TABLE public.consultation_symptoms
    ADD CONSTRAINT consultation_symptoms_consultation_id_fkey
    FOREIGN KEY (consultation_id)
    REFERENCES public.patient_consultations(consultation_id);

ALTER TABLE public.consultation_symptoms
    ADD CONSTRAINT consultation_symptoms_symptom_id_fkey
    FOREIGN KEY (symptom_id)
    REFERENCES public.symptoms(id);

ALTER TABLE public.consultation_disease_matches
    ADD CONSTRAINT consultation_disease_matches_consultation_id_fkey
    FOREIGN KEY (consultation_id)
    REFERENCES public.patient_consultations(consultation_id);

ALTER TABLE public.consultation_disease_matches
    ADD CONSTRAINT consultation_disease_matches_disease_id_fkey
    FOREIGN KEY (disease_id)
    REFERENCES public.diseases(id);

ALTER TABLE public.disease_symptoms
    ADD CONSTRAINT disease_symptoms_disease_id_fkey
    FOREIGN KEY (disease_id)
    REFERENCES public.diseases(id)
    ON DELETE CASCADE;

ALTER TABLE public.disease_symptoms
    ADD CONSTRAINT disease_symptoms_symptom_id_fkey
    FOREIGN KEY (symptom_id)
    REFERENCES public.symptoms(id)
    ON DELETE CASCADE;

ALTER TABLE public.ptalk_users
    ADD CONSTRAINT ptalk_users_patient_id_fkey
    FOREIGN KEY (patient_id)
    REFERENCES public.patient_identity(patient_id)
    ON DELETE CASCADE;

ALTER TABLE public.ptalk_sessions
    ADD CONSTRAINT ptalk_sessions_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES public.ptalk_users(id)
    ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_disease_symptoms_disease
    ON public.disease_symptoms USING btree (disease_id);

CREATE INDEX IF NOT EXISTS idx_disease_symptoms_symptom
    ON public.disease_symptoms USING btree (symptom_id);

CREATE INDEX IF NOT EXISTS idx_ptalk_sessions_user_id
    ON public.ptalk_sessions USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_ptalk_sessions_expires_at
    ON public.ptalk_sessions USING btree (expires_at);
