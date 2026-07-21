--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 16.4 (Debian 16.4-1.pgdg110+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: sersa_user
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO sersa_user;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: sersa_user
--

COMMENT ON SCHEMA public IS '';


--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: sersa_user
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO sersa_user;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: sersa_user
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO sersa_user;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: sersa_user
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO sersa_user;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: sersa_user
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: AddressLabel; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."AddressLabel" AS ENUM (
    'home',
    'work',
    'other'
);


ALTER TYPE public."AddressLabel" OWNER TO sersa_user;

--
-- Name: AttachmentType; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."AttachmentType" AS ENUM (
    'prescription',
    'lab_result',
    'clinical_photo',
    'other'
);


ALTER TYPE public."AttachmentType" OWNER TO sersa_user;

--
-- Name: ClinicalStatus; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."ClinicalStatus" AS ENUM (
    'estable',
    'seguimiento',
    'critico'
);


ALTER TYPE public."ClinicalStatus" OWNER TO sersa_user;

--
-- Name: DisputeStatus; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."DisputeStatus" AS ENUM (
    'open',
    'under_review',
    'resolved_patient',
    'resolved_nurse',
    'closed'
);


ALTER TYPE public."DisputeStatus" OWNER TO sersa_user;

--
-- Name: DocumentType; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."DocumentType" AS ENUM (
    'professional_license',
    'degree_title'
);


ALTER TYPE public."DocumentType" OWNER TO sersa_user;

--
-- Name: MessageType; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."MessageType" AS ENUM (
    'text',
    'image',
    'system'
);


ALTER TYPE public."MessageType" OWNER TO sersa_user;

--
-- Name: NotificationChannel; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."NotificationChannel" AS ENUM (
    'push',
    'email',
    'sms',
    'in_app'
);


ALTER TYPE public."NotificationChannel" OWNER TO sersa_user;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'refunded',
    'partially_refunded'
);


ALTER TYPE public."PaymentStatus" OWNER TO sersa_user;

--
-- Name: PricingModifierType; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."PricingModifierType" AS ENUM (
    'night_hours',
    'weekend',
    'holiday',
    'zone_surge'
);


ALTER TYPE public."PricingModifierType" OWNER TO sersa_user;

--
-- Name: RequestStatus; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."RequestStatus" AS ENUM (
    'draft',
    'published',
    'accepted',
    'en_camino',
    'arrived',
    'in_progress',
    'completed',
    'cancelled',
    'disputed'
);


ALTER TYPE public."RequestStatus" OWNER TO sersa_user;

--
-- Name: RequestType; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."RequestType" AS ENUM (
    'immediate',
    'scheduled'
);


ALTER TYPE public."RequestType" OWNER TO sersa_user;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'pending',
    'approved',
    'rejected'
);


ALTER TYPE public."ReviewStatus" OWNER TO sersa_user;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."Role" AS ENUM (
    'patient',
    'nurse',
    'admin'
);


ALTER TYPE public."Role" OWNER TO sersa_user;

--
-- Name: StopStatus; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."StopStatus" AS ENUM (
    'pending',
    'en_camino',
    'arrived',
    'completed',
    'skipped'
);


ALTER TYPE public."StopStatus" OWNER TO sersa_user;

--
-- Name: TransactionType; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."TransactionType" AS ENUM (
    'service_income',
    'platform_commission',
    'withdrawal',
    'refund',
    'adjustment'
);


ALTER TYPE public."TransactionType" OWNER TO sersa_user;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."UserStatus" AS ENUM (
    'pending_verification',
    'active',
    'suspended',
    'rejected'
);


ALTER TYPE public."UserStatus" OWNER TO sersa_user;

--
-- Name: WithdrawalStatus; Type: TYPE; Schema: public; Owner: sersa_user
--

CREATE TYPE public."WithdrawalStatus" AS ENUM (
    'pending',
    'processing',
    'completed',
    'failed',
    'cancelled'
);


ALTER TYPE public."WithdrawalStatus" OWNER TO sersa_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO sersa_user;

--
-- Name: addresses; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.addresses (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    label public."AddressLabel" DEFAULT 'home'::public."AddressLabel" NOT NULL,
    custom_label character varying(60),
    street_line1 character varying(200) NOT NULL,
    street_line2 character varying(120),
    neighborhood character varying(120),
    city character varying(120) NOT NULL,
    state character varying(80),
    postal_code character varying(12) NOT NULL,
    country_code character(2) DEFAULT 'MX'::bpchar NOT NULL,
    references_text text,
    location public.geometry(Point,4326) NOT NULL,
    operational_zone_id character varying(36),
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.addresses OWNER TO sersa_user;

--
-- Name: admin_profiles; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.admin_profiles (
    user_id character varying(36) NOT NULL,
    first_name character varying(80) NOT NULL,
    last_name character varying(80) NOT NULL,
    department character varying(80),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.admin_profiles OWNER TO sersa_user;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.audit_logs (
    id character varying(36) NOT NULL,
    actor_user_id character varying(36),
    action character varying(80) NOT NULL,
    entity_type character varying(60) NOT NULL,
    entity_id character varying(36),
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO sersa_user;

--
-- Name: clinical_reports; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.clinical_reports (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    observations text NOT NULL,
    wound_status character varying(80),
    procedures_done text,
    recommendations text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.clinical_reports OWNER TO sersa_user;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.conversations (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    closed_at timestamp(3) without time zone
);


ALTER TABLE public.conversations OWNER TO sersa_user;

--
-- Name: daily_routes; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.daily_routes (
    id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    route_date date NOT NULL,
    total_distance_km numeric(8,2),
    total_earnings numeric(12,2) DEFAULT 0 NOT NULL,
    started_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.daily_routes OWNER TO sersa_user;

--
-- Name: digital_signatures; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.digital_signatures (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    signed_by_user_id character varying(36) NOT NULL,
    signature_image_url text NOT NULL,
    signed_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address character varying(45),
    user_agent text
);


ALTER TABLE public.digital_signatures OWNER TO sersa_user;

--
-- Name: disputes; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.disputes (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    opened_by character varying(36) NOT NULL,
    assigned_admin_id character varying(36),
    status public."DisputeStatus" DEFAULT 'open'::public."DisputeStatus" NOT NULL,
    reason text NOT NULL,
    resolution_notes text,
    resolved_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.disputes OWNER TO sersa_user;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.messages (
    id character varying(36) NOT NULL,
    conversation_id character varying(36) NOT NULL,
    sender_id character varying(36) NOT NULL,
    message_type public."MessageType" DEFAULT 'text'::public."MessageType" NOT NULL,
    body text,
    attachment_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.messages OWNER TO sersa_user;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.notifications (
    id character varying(36) NOT NULL,
    user_id character varying(36) NOT NULL,
    channel public."NotificationChannel" DEFAULT 'in_app'::public."NotificationChannel" NOT NULL,
    title character varying(200) NOT NULL,
    body text NOT NULL,
    payload jsonb,
    read_at timestamp(3) without time zone,
    sent_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.notifications OWNER TO sersa_user;

--
-- Name: nurse_availability_slots; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.nurse_availability_slots (
    id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    day_of_week smallint,
    starts_at time without time zone NOT NULL,
    ends_at time without time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nurse_availability_slots OWNER TO sersa_user;

--
-- Name: nurse_credential_reviews; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.nurse_credential_reviews (
    id character varying(36) NOT NULL,
    credential_id character varying(36) NOT NULL,
    reviewer_id character varying(36) NOT NULL,
    previous_status public."ReviewStatus" NOT NULL,
    new_status public."ReviewStatus" NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nurse_credential_reviews OWNER TO sersa_user;

--
-- Name: nurse_credentials; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.nurse_credentials (
    id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    document_type public."DocumentType" NOT NULL,
    file_url text NOT NULL,
    file_hash character varying(64),
    issued_at date,
    expires_at date,
    review_status public."ReviewStatus" DEFAULT 'pending'::public."ReviewStatus" NOT NULL,
    reviewed_by character varying(36),
    reviewed_at timestamp(3) without time zone,
    rejection_reason text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nurse_credentials OWNER TO sersa_user;

--
-- Name: nurse_location_pings; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.nurse_location_pings (
    id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    service_request_id character varying(36),
    location public.geometry(Point,4326) NOT NULL,
    accuracy_meters numeric(8,2),
    speed_kmh numeric(6,2),
    heading_degrees smallint,
    recorded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.nurse_location_pings OWNER TO sersa_user;

--
-- Name: nurse_patient_relationships; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.nurse_patient_relationships (
    id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    patient_user_id character varying(36) NOT NULL,
    clinical_status public."ClinicalStatus" DEFAULT 'estable'::public."ClinicalStatus" NOT NULL,
    total_services integer DEFAULT 0 NOT NULL,
    last_service_at timestamp(3) without time zone,
    last_service_name character varying(160),
    private_notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.nurse_patient_relationships OWNER TO sersa_user;

--
-- Name: nurse_payout_methods; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.nurse_payout_methods (
    id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    method_type character varying(20) NOT NULL,
    bank_name character varying(80),
    account_last_four character(4),
    clabe_masked character varying(20),
    is_primary boolean DEFAULT false NOT NULL,
    provider_method_id character varying(120),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.nurse_payout_methods OWNER TO sersa_user;

--
-- Name: nurse_profiles; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.nurse_profiles (
    user_id character varying(36) NOT NULL,
    first_name character varying(80) NOT NULL,
    last_name character varying(80) NOT NULL,
    second_last_name character varying(80),
    professional_license character varying(40) NOT NULL,
    license_state character varying(80),
    bio text,
    years_experience smallint,
    is_available boolean DEFAULT false NOT NULL,
    average_rating numeric(3,2) DEFAULT 0,
    total_services integer DEFAULT 0 NOT NULL,
    wallet_id character varying(36),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.nurse_profiles OWNER TO sersa_user;

--
-- Name: nurse_wallets; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.nurse_wallets (
    id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    balance numeric(12,2) DEFAULT 0 NOT NULL,
    pending_balance numeric(12,2) DEFAULT 0 NOT NULL,
    currency_code character(3) DEFAULT 'MXN'::bpchar NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.nurse_wallets OWNER TO sersa_user;

--
-- Name: operational_zones; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.operational_zones (
    id character varying(36) NOT NULL,
    name character varying(120) NOT NULL,
    city character varying(120) NOT NULL,
    state character varying(80),
    country_code character(2) DEFAULT 'MX'::bpchar NOT NULL,
    boundary public.geometry(Polygon,4326) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.operational_zones OWNER TO sersa_user;

--
-- Name: patient_profiles; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.patient_profiles (
    user_id character varying(36) NOT NULL,
    first_name character varying(80) NOT NULL,
    last_name character varying(80) NOT NULL,
    second_last_name character varying(80),
    date_of_birth date,
    gender character varying(30),
    emergency_contact_name character varying(160),
    emergency_contact_phone character varying(20),
    medical_notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.patient_profiles OWNER TO sersa_user;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.payments (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    patient_user_id character varying(36) NOT NULL,
    amount numeric(12,2) NOT NULL,
    platform_fee numeric(12,2) DEFAULT 0 NOT NULL,
    nurse_net_amount numeric(12,2) DEFAULT 0 NOT NULL,
    currency_code character(3) DEFAULT 'MXN'::bpchar NOT NULL,
    status public."PaymentStatus" DEFAULT 'pending'::public."PaymentStatus" NOT NULL,
    provider character varying(40) DEFAULT 'stripe'::character varying NOT NULL,
    provider_payment_id character varying(120),
    provider_payload jsonb,
    paid_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.payments OWNER TO sersa_user;

--
-- Name: platform_settings; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.platform_settings (
    id character varying(36) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    coverage_radius_km numeric(6,2) DEFAULT 15.00 NOT NULL,
    platform_commission_pct numeric(5,2) DEFAULT 15.00 NOT NULL,
    currency_code character(3) DEFAULT 'MXN'::bpchar NOT NULL,
    pilot_city character varying(120) DEFAULT 'Ciudad de México'::character varying NOT NULL,
    pilot_state character varying(80),
    pilot_country character(2) DEFAULT 'MX'::bpchar NOT NULL,
    pilot_area public.geometry(Polygon,4326),
    min_app_version character varying(20),
    support_email character varying(255),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.platform_settings OWNER TO sersa_user;

--
-- Name: route_stops; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.route_stops (
    id character varying(36) NOT NULL,
    daily_route_id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    stop_order smallint NOT NULL,
    status public."StopStatus" DEFAULT 'pending'::public."StopStatus" NOT NULL,
    planned_arrival_at timestamp(3) without time zone,
    actual_arrival_at timestamp(3) without time zone,
    distance_km numeric(8,2),
    eta_minutes smallint,
    price_amount numeric(12,2),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.route_stops OWNER TO sersa_user;

--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.service_categories (
    id character varying(36) NOT NULL,
    name character varying(80) NOT NULL,
    slug character varying(80) NOT NULL,
    description text,
    sort_order smallint DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_categories OWNER TO sersa_user;

--
-- Name: service_pricing_rules; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.service_pricing_rules (
    id character varying(36) NOT NULL,
    service_id character varying(36),
    modifier_type public."PricingModifierType" NOT NULL,
    multiplier numeric(5,2) DEFAULT 1.00 NOT NULL,
    fixed_surcharge numeric(12,2) DEFAULT 0 NOT NULL,
    starts_at_time time without time zone,
    ends_at_time time without time zone,
    applies_on_date date,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_pricing_rules OWNER TO sersa_user;

--
-- Name: service_request_attachments; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.service_request_attachments (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    uploaded_by character varying(36) NOT NULL,
    file_name character varying(255) NOT NULL,
    file_url text NOT NULL,
    mime_type character varying(100),
    file_size_bytes bigint,
    attachment_type public."AttachmentType" DEFAULT 'prescription'::public."AttachmentType" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_request_attachments OWNER TO sersa_user;

--
-- Name: service_request_items; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.service_request_items (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    service_id character varying(36) NOT NULL,
    quantity smallint DEFAULT 1 NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    line_total numeric(12,2) NOT NULL,
    pricing_rule_id character varying(36),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_request_items OWNER TO sersa_user;

--
-- Name: service_request_status_history; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.service_request_status_history (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    from_status character varying(50),
    to_status character varying(50) NOT NULL,
    changed_by character varying(36),
    change_source character varying(40) DEFAULT 'system'::character varying,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_request_status_history OWNER TO sersa_user;

--
-- Name: service_request_visibility; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.service_request_visibility (
    id character varying(36) NOT NULL,
    service_request_id character varying(36) NOT NULL,
    nurse_user_id character varying(36) NOT NULL,
    distance_meters numeric(10,2),
    notified_at timestamp(3) without time zone,
    viewed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.service_request_visibility OWNER TO sersa_user;

--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.service_requests (
    id character varying(36) NOT NULL,
    patient_user_id character varying(36) NOT NULL,
    assigned_nurse_id character varying(36),
    address_id character varying(36) NOT NULL,
    operational_zone_id character varying(36),
    request_type public."RequestType" NOT NULL,
    status public."RequestStatus" DEFAULT 'draft'::public."RequestStatus" NOT NULL,
    scheduled_start_at timestamp(3) without time zone,
    scheduled_end_at timestamp(3) without time zone,
    published_at timestamp(3) without time zone,
    accepted_at timestamp(3) without time zone,
    started_at timestamp(3) without time zone,
    completed_at timestamp(3) without time zone,
    cancelled_at timestamp(3) without time zone,
    cancellation_reason text,
    patient_notes text,
    subtotal_amount numeric(12,2) DEFAULT 0 NOT NULL,
    surcharge_amount numeric(12,2) DEFAULT 0 NOT NULL,
    total_amount numeric(12,2) DEFAULT 0 NOT NULL,
    currency_code character(3) DEFAULT 'MXN'::bpchar NOT NULL,
    service_location public.geometry(Point,4326),
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.service_requests OWNER TO sersa_user;

--
-- Name: services; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.services (
    id character varying(36) NOT NULL,
    category_id character varying(36) NOT NULL,
    name character varying(160) NOT NULL,
    slug character varying(160) NOT NULL,
    description text NOT NULL,
    base_price numeric(12,2) NOT NULL,
    estimated_duration_min smallint DEFAULT 30 NOT NULL,
    icon_key character varying(40),
    requires_prescription boolean DEFAULT false NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.services OWNER TO sersa_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.users (
    id character varying(36) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text,
    role public."Role" NOT NULL,
    status public."UserStatus" DEFAULT 'pending_verification'::public."UserStatus" NOT NULL,
    phone character varying(20),
    phone_verified_at timestamp(3) without time zone,
    email_verified_at timestamp(3) without time zone,
    last_login_at timestamp(3) without time zone,
    profile_photo_url text,
    preferred_locale character varying(10) DEFAULT 'es-MX'::character varying NOT NULL,
    timezone character varying(50) DEFAULT 'America/Mexico_City'::character varying NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    deleted_at timestamp(3) without time zone
);


ALTER TABLE public.users OWNER TO sersa_user;

--
-- Name: vital_signs_records; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.vital_signs_records (
    id character varying(36) NOT NULL,
    clinical_report_id character varying(36) NOT NULL,
    blood_pressure_sys smallint,
    blood_pressure_dia smallint,
    heart_rate_bpm smallint,
    temperature_c numeric(4,1),
    glucose_mg_dl numeric(6,1),
    oxygen_saturation numeric(5,2),
    respiratory_rate smallint,
    recorded_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.vital_signs_records OWNER TO sersa_user;

--
-- Name: wallet_transactions; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.wallet_transactions (
    id character varying(36) NOT NULL,
    wallet_id character varying(36) NOT NULL,
    payment_id character varying(36),
    service_request_id character varying(36),
    transaction_type public."TransactionType" NOT NULL,
    amount numeric(12,2) NOT NULL,
    balance_after numeric(12,2) NOT NULL,
    description character varying(255),
    status public."PaymentStatus" DEFAULT 'completed'::public."PaymentStatus" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.wallet_transactions OWNER TO sersa_user;

--
-- Name: withdrawal_requests; Type: TABLE; Schema: public; Owner: sersa_user
--

CREATE TABLE public.withdrawal_requests (
    id character varying(36) NOT NULL,
    wallet_id character varying(36) NOT NULL,
    payout_method_id character varying(36) NOT NULL,
    amount numeric(12,2) NOT NULL,
    status public."WithdrawalStatus" DEFAULT 'pending'::public."WithdrawalStatus" NOT NULL,
    provider_payout_id character varying(120),
    processed_at timestamp(3) without time zone,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.withdrawal_requests OWNER TO sersa_user;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a2ba3c2d-e40e-4e68-858f-db5db22b7995	9ed36fb90ee570ee83920b4f9853d69ae70c844609dd17709bddce2a8879fb7b	2026-07-20 18:37:49.439106+00	20260720181318_init	\N	\N	2026-07-20 18:37:48.902798+00	1
\.


--
-- Data for Name: addresses; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.addresses (id, user_id, label, custom_label, street_line1, street_line2, neighborhood, city, state, postal_code, country_code, references_text, location, operational_zone_id, is_default, created_at, updated_at, deleted_at) FROM stdin;
51539983-3e7a-4c1f-8ae5-9ff60b694fbb	e2646c4c-c0c7-433b-991f-b855b84f54df	home	\N	Av de las Limas 29-30	30	El Refugio	Tijuana	Baja California	22200	MX	porton negro detras del parque	0101000020E61000000A1CBFA6BD345DC0CD4A49C5B53A4040	\N	f	2026-07-20 19:41:43.783	2026-07-20 19:58:47.099	\N
8752fc0f-3588-4c22-9550-642c576365ab	e2646c4c-c0c7-433b-991f-b855b84f54df	home	\N	priv ficus	2240	el florido	tijuana	Baja california	22200	MX	porton negro detras del parque	0101000020E610000006B75ACCF43A5DC00F1F227F7A3A4040	\N	t	2026-07-20 19:03:37.035	2026-07-20 19:58:47.252	\N
\.


--
-- Data for Name: admin_profiles; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.admin_profiles (user_id, first_name, last_name, department, created_at) FROM stdin;
1aaeb590-a038-4a16-90a9-e13e45dd15aa	Admin	SERSA	Operaciones	2026-07-20 18:37:55.519
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.audit_logs (id, actor_user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: clinical_reports; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.clinical_reports (id, service_request_id, nurse_user_id, observations, wound_status, procedures_done, recommendations, created_at, updated_at) FROM stdin;
b6d5fd0e-7029-481d-b2da-0ffcfe05e86f	18c77154-fe56-468c-a9f0-8e86c5b098c1	079bbd20-fd1c-4fa4-b650-0706fb5258e5	esta estable pero algo tenso	Sin heridas	Toma de signos vitales	Reposo y mayor toma de agua	2026-07-20 19:15:07.833	2026-07-20 19:15:07.833
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.conversations (id, service_request_id, created_at, closed_at) FROM stdin;
3dc387ea-9294-4c02-b5fb-b7a9cba54242	18c77154-fe56-468c-a9f0-8e86c5b098c1	2026-07-20 19:11:39.055	\N
eaeabc01-29ae-4ef2-bffd-6d0309373b0a	5fc69f0f-ef12-48d2-9b3d-f6788cc67ca7	2026-07-20 19:33:07.535	\N
15e4ddf1-d9be-44eb-9b5d-746ad6f241e6	4614a84c-4983-47ab-9f7d-59f22ee1071a	2026-07-20 19:35:48.392	\N
a846e35c-588a-452c-ac6b-29b2a57c9166	f0db74cd-7f3d-4fa3-b559-1be6608c2db8	2026-07-20 19:42:32.836	\N
9cc57ef9-494b-42ba-9a77-ea968744701a	f08b829a-3641-42f2-a277-b49066b2171b	2026-07-20 19:53:07.47	\N
95aa54fe-7200-4eb4-9893-2f52eb6df9f0	7d788c22-b57b-4866-9afc-054c3b444111	2026-07-20 19:57:49.605	\N
ca77a6c7-d206-4e02-a058-b33d68e83f1e	4c6a9098-b267-44dd-9d9d-e5435b457451	2026-07-20 20:02:52.873	\N
\.


--
-- Data for Name: daily_routes; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.daily_routes (id, nurse_user_id, route_date, total_distance_km, total_earnings, started_at, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: digital_signatures; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.digital_signatures (id, service_request_id, signed_by_user_id, signature_image_url, signed_at, ip_address, user_agent) FROM stdin;
4a3df4b6-9daa-412e-b896-962ab3de9a28	18c77154-fe56-468c-a9f0-8e86c5b098c1	e2646c4c-c0c7-433b-991f-b855b84f54df	data:image/png;base64,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	2026-07-20 19:15:07.833	\N	\N
\.


--
-- Data for Name: disputes; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.disputes (id, service_request_id, opened_by, assigned_admin_id, status, reason, resolution_notes, resolved_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.messages (id, conversation_id, sender_id, message_type, body, attachment_url, created_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.notifications (id, user_id, channel, title, body, payload, read_at, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: nurse_availability_slots; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.nurse_availability_slots (id, nurse_user_id, day_of_week, starts_at, ends_at, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: nurse_credential_reviews; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.nurse_credential_reviews (id, credential_id, reviewer_id, previous_status, new_status, notes, created_at) FROM stdin;
\.


--
-- Data for Name: nurse_credentials; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.nurse_credentials (id, nurse_user_id, document_type, file_url, file_hash, issued_at, expires_at, review_status, reviewed_by, reviewed_at, rejection_reason, created_at) FROM stdin;
\.


--
-- Data for Name: nurse_location_pings; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.nurse_location_pings (id, nurse_user_id, service_request_id, location, accuracy_meters, speed_kmh, heading_degrees, recorded_at) FROM stdin;
\.


--
-- Data for Name: nurse_patient_relationships; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.nurse_patient_relationships (id, nurse_user_id, patient_user_id, clinical_status, total_services, last_service_at, last_service_name, private_notes, created_at, updated_at) FROM stdin;
6a4c7e04-e44a-4bb2-b26f-0303cd78ea50	079bbd20-fd1c-4fa4-b650-0706fb5258e5	e2646c4c-c0c7-433b-991f-b855b84f54df	estable	7	2026-07-20 20:02:52.887	Toma de Signos Vitales	\N	2026-07-20 19:11:39.055	2026-07-20 20:02:52.873
\.


--
-- Data for Name: nurse_payout_methods; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.nurse_payout_methods (id, nurse_user_id, method_type, bank_name, account_last_four, clabe_masked, is_primary, provider_method_id, created_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: nurse_profiles; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.nurse_profiles (user_id, first_name, last_name, second_last_name, professional_license, license_state, bio, years_experience, is_available, average_rating, total_services, wallet_id, created_at, updated_at) FROM stdin;
f8b71978-1565-4b59-9fc1-f0e5270089d5	María	López	\N	TJ-12345678	Baja California	\N	\N	t	0.00	0	1da5db08-9f85-46a6-ae4f-35a28d7bf9c9	2026-07-20 18:37:55.534	2026-07-20 18:37:55.534
079bbd20-fd1c-4fa4-b650-0706fb5258e5	santi	martinez	\N	1234567890	\N	\N	\N	f	0.00	0	1285b1d5-751d-4985-9dbb-8330a0bfe26c	2026-07-20 18:51:16.173	2026-07-20 18:51:16.173
\.


--
-- Data for Name: nurse_wallets; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.nurse_wallets (id, nurse_user_id, balance, pending_balance, currency_code, updated_at) FROM stdin;
1da5db08-9f85-46a6-ae4f-35a28d7bf9c9	f8b71978-1565-4b59-9fc1-f0e5270089d5	0.00	0.00	MXN	2026-07-20 18:37:55.531
1285b1d5-751d-4985-9dbb-8330a0bfe26c	079bbd20-fd1c-4fa4-b650-0706fb5258e5	170.00	0.00	MXN	2026-07-20 19:15:07.833
\.


--
-- Data for Name: operational_zones; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.operational_zones (id, name, city, state, country_code, boundary, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: patient_profiles; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.patient_profiles (user_id, first_name, last_name, second_last_name, date_of_birth, gender, emergency_contact_name, emergency_contact_phone, medical_notes, created_at, updated_at) FROM stdin;
4444d4d4-2b90-4c76-ab6d-e6b047b5870c	Juan	Pérez	García	\N	\N	\N	\N	\N	2026-07-20 18:37:55.524	2026-07-20 18:37:55.524
e2646c4c-c0c7-433b-991f-b855b84f54df	satana	lopez	\N	\N	\N	\N	\N	\N	2026-07-20 18:52:12.207	2026-07-20 18:52:12.207
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.payments (id, service_request_id, patient_user_id, amount, platform_fee, nurse_net_amount, currency_code, status, provider, provider_payment_id, provider_payload, paid_at, created_at, updated_at) FROM stdin;
0d09c7e2-ce37-4132-9368-596ff1fc4d79	18c77154-fe56-468c-a9f0-8e86c5b098c1	e2646c4c-c0c7-433b-991f-b855b84f54df	200.00	30.00	170.00	MXN	completed	stripe	\N	\N	2026-07-20 19:15:07.848	2026-07-20 19:15:07.833	2026-07-20 19:15:07.833
\.


--
-- Data for Name: platform_settings; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.platform_settings (id, is_active, coverage_radius_km, platform_commission_pct, currency_code, pilot_city, pilot_state, pilot_country, pilot_area, min_app_version, support_email, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: route_stops; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.route_stops (id, daily_route_id, service_request_id, stop_order, status, planned_arrival_at, actual_arrival_at, distance_km, eta_minutes, price_amount, created_at) FROM stdin;
\.


--
-- Data for Name: service_categories; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.service_categories (id, name, slug, description, sort_order, is_active, created_at) FROM stdin;
56dfeadc-c3b8-499c-bd82-55f53537482b	Enfermería General	enfermeria-general	Servicios básicos de enfermería a domicilio.	1	t	2026-07-20 18:37:55.452
b7fe69cd-b635-4c2b-9bd7-a4a469ef13cc	Cuidados Especiales	cuidados-especiales	Cuidado prolongado y atención especializada.	2	t	2026-07-20 18:37:55.455
\.


--
-- Data for Name: service_pricing_rules; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.service_pricing_rules (id, service_id, modifier_type, multiplier, fixed_surcharge, starts_at_time, ends_at_time, applies_on_date, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: service_request_attachments; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.service_request_attachments (id, service_request_id, uploaded_by, file_name, file_url, mime_type, file_size_bytes, attachment_type, created_at) FROM stdin;
\.


--
-- Data for Name: service_request_items; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.service_request_items (id, service_request_id, service_id, quantity, unit_price, line_total, pricing_rule_id, created_at) FROM stdin;
7c684803-26e6-4cdd-9cd7-17c948f6edae	18c77154-fe56-468c-a9f0-8e86c5b098c1	277f1076-8c93-4efe-9e30-7455fdd90e51	1	200.00	200.00	\N	2026-07-20 19:04:13.419
4aa7c304-8d33-44c9-8d9c-ab32a23202d7	5fc69f0f-ef12-48d2-9b3d-f6788cc67ca7	277f1076-8c93-4efe-9e30-7455fdd90e51	1	200.00	200.00	\N	2026-07-20 19:32:50.59
e0397489-9d80-4b47-87b9-8ee77dd14ce7	4614a84c-4983-47ab-9f7d-59f22ee1071a	277f1076-8c93-4efe-9e30-7455fdd90e51	1	200.00	200.00	\N	2026-07-20 19:34:54.135
eb855ef1-dbae-4c3d-8959-1ebc3e7f2051	f0db74cd-7f3d-4fa3-b559-1be6608c2db8	54374c21-e214-4f6e-8b12-aafc1cadbd13	1	150.00	150.00	\N	2026-07-20 19:42:01.147
fc230b2f-f715-4d26-a88f-c4437ffd824d	f08b829a-3641-42f2-a277-b49066b2171b	277f1076-8c93-4efe-9e30-7455fdd90e51	1	200.00	200.00	\N	2026-07-20 19:52:47.943
459ed1fa-6595-4905-b189-44968f24a09f	7d788c22-b57b-4866-9afc-054c3b444111	277f1076-8c93-4efe-9e30-7455fdd90e51	1	200.00	200.00	\N	2026-07-20 19:57:31.049
5cc7f1cb-fa7e-4ef1-b283-5550568c6beb	4c6a9098-b267-44dd-9d9d-e5435b457451	277f1076-8c93-4efe-9e30-7455fdd90e51	1	200.00	200.00	\N	2026-07-20 20:01:53.53
\.


--
-- Data for Name: service_request_status_history; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.service_request_status_history (id, service_request_id, from_status, to_status, changed_by, change_source, notes, created_at) FROM stdin;
299d0911-c465-448c-902a-1de102689db8	18c77154-fe56-468c-a9f0-8e86c5b098c1	draft	published	e2646c4c-c0c7-433b-991f-b855b84f54df	patient	\N	2026-07-20 19:04:13.419
4a656c5c-15a8-46c3-9db6-c025dee6e6e9	18c77154-fe56-468c-a9f0-8e86c5b098c1	published	accepted	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:11:39.055
8bed730f-a207-4247-9556-6a085801472f	18c77154-fe56-468c-a9f0-8e86c5b098c1	accepted	en_camino	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:13:38.188
4d0a3903-9d63-466a-85c0-7dc71bd4486d	18c77154-fe56-468c-a9f0-8e86c5b098c1	en_camino	arrived	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:13:38.353
487e5c5e-88e5-41e1-b6f0-60c6e08107a8	18c77154-fe56-468c-a9f0-8e86c5b098c1	arrived	in_progress	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:13:41.586
c99cec82-780c-4a3b-bb42-61a461560f31	5fc69f0f-ef12-48d2-9b3d-f6788cc67ca7	draft	published	e2646c4c-c0c7-433b-991f-b855b84f54df	patient	\N	2026-07-20 19:32:50.59
344efbf2-7557-4b88-a07a-c99b34ea57a8	5fc69f0f-ef12-48d2-9b3d-f6788cc67ca7	published	accepted	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:33:07.535
934280cb-df82-43d8-833d-4ac91f4b7c99	5fc69f0f-ef12-48d2-9b3d-f6788cc67ca7	accepted	en_camino	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:33:19.95
eaf7b419-a549-4f7e-8f8a-3e4b13f330e9	5fc69f0f-ef12-48d2-9b3d-f6788cc67ca7	en_camino	arrived	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:33:29.609
d7b4071e-c354-4b3d-94a0-77ffa118933a	5fc69f0f-ef12-48d2-9b3d-f6788cc67ca7	arrived	in_progress	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:33:31.354
bee6c5b5-0059-484f-8c40-325384aeaaf7	4614a84c-4983-47ab-9f7d-59f22ee1071a	draft	published	e2646c4c-c0c7-433b-991f-b855b84f54df	patient	\N	2026-07-20 19:34:54.135
fbe2ec93-05cf-4434-b95e-674115cd7248	4614a84c-4983-47ab-9f7d-59f22ee1071a	published	accepted	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:35:48.392
63a935e1-dce9-4023-bd37-2da0dfa363d3	4614a84c-4983-47ab-9f7d-59f22ee1071a	accepted	en_camino	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:35:51.373
a6b78552-d44c-4d60-8414-a67b3aea48bc	f0db74cd-7f3d-4fa3-b559-1be6608c2db8	draft	published	e2646c4c-c0c7-433b-991f-b855b84f54df	patient	\N	2026-07-20 19:42:01.147
78defdeb-a13f-4992-b24d-b9d671861ebe	f0db74cd-7f3d-4fa3-b559-1be6608c2db8	published	accepted	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:42:32.836
092b6643-d789-455f-9082-e88df591b944	f0db74cd-7f3d-4fa3-b559-1be6608c2db8	accepted	en_camino	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:42:42.074
4a18816d-2e88-4cc9-b02b-0cfd5272f24c	f0db74cd-7f3d-4fa3-b559-1be6608c2db8	en_camino	arrived	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:52:13.882
7fa09be5-848b-4fc1-bdbc-910adae6c7ff	4614a84c-4983-47ab-9f7d-59f22ee1071a	en_camino	arrived	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:52:14.554
3f4bc9c3-24a3-4e16-bc84-8fa8306b8ac0	f0db74cd-7f3d-4fa3-b559-1be6608c2db8	arrived	in_progress	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:52:18.579
4c9f1294-57a3-4d6f-b1f6-8f3071a23818	4614a84c-4983-47ab-9f7d-59f22ee1071a	arrived	in_progress	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:52:19.26
b69a35c8-72b2-4077-a8ef-30eea8433115	f08b829a-3641-42f2-a277-b49066b2171b	draft	published	e2646c4c-c0c7-433b-991f-b855b84f54df	patient	\N	2026-07-20 19:52:47.943
a44ef94f-7736-4177-820a-3d7ff1091a40	f08b829a-3641-42f2-a277-b49066b2171b	published	accepted	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:53:07.47
1d6d64dc-4512-4f14-af16-551647325cdc	f08b829a-3641-42f2-a277-b49066b2171b	accepted	en_camino	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:53:16.023
55c601fe-5ebf-4936-8a09-6e7fd113e32f	f08b829a-3641-42f2-a277-b49066b2171b	en_camino	arrived	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:56:59.862
f06c3c40-2af5-4f9e-87ee-3261b7cbfed4	f08b829a-3641-42f2-a277-b49066b2171b	arrived	in_progress	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:57:04.353
90ecc7aa-8da1-4435-b8db-1a79fbf3e5c6	7d788c22-b57b-4866-9afc-054c3b444111	draft	published	e2646c4c-c0c7-433b-991f-b855b84f54df	patient	\N	2026-07-20 19:57:31.049
7cafce6d-eebe-489c-ba63-fdad54723c46	7d788c22-b57b-4866-9afc-054c3b444111	published	accepted	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:57:49.605
138522f0-8b59-4e45-914b-a9b6ba00ca0b	7d788c22-b57b-4866-9afc-054c3b444111	accepted	en_camino	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 19:57:58.158
e001bdd6-8ea1-43bd-9305-775431eafc9c	4c6a9098-b267-44dd-9d9d-e5435b457451	draft	published	e2646c4c-c0c7-433b-991f-b855b84f54df	patient	\N	2026-07-20 20:01:53.53
66d7893e-20dd-43ea-82e6-0615c6f17223	4c6a9098-b267-44dd-9d9d-e5435b457451	published	accepted	079bbd20-fd1c-4fa4-b650-0706fb5258e5	nurse	\N	2026-07-20 20:02:52.873
\.


--
-- Data for Name: service_request_visibility; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.service_request_visibility (id, service_request_id, nurse_user_id, distance_meters, notified_at, viewed_at, created_at) FROM stdin;
\.


--
-- Data for Name: service_requests; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.service_requests (id, patient_user_id, assigned_nurse_id, address_id, operational_zone_id, request_type, status, scheduled_start_at, scheduled_end_at, published_at, accepted_at, started_at, completed_at, cancelled_at, cancellation_reason, patient_notes, subtotal_amount, surcharge_amount, total_amount, currency_code, service_location, created_at, updated_at) FROM stdin;
18c77154-fe56-468c-a9f0-8e86c5b098c1	e2646c4c-c0c7-433b-991f-b855b84f54df	079bbd20-fd1c-4fa4-b650-0706fb5258e5	8752fc0f-3588-4c22-9550-642c576365ab	\N	scheduled	completed	2026-07-30 20:06:00	\N	2026-07-20 19:04:13.426	2026-07-20 19:11:39.055	2026-07-20 19:13:41.584	2026-07-20 19:15:07.841	\N	\N	Tengo diabetes	200.00	0.00	200.00	MXN	\N	2026-07-20 19:04:13.419	2026-07-20 19:15:07.833
7d788c22-b57b-4866-9afc-054c3b444111	e2646c4c-c0c7-433b-991f-b855b84f54df	079bbd20-fd1c-4fa4-b650-0706fb5258e5	51539983-3e7a-4c1f-8ae5-9ff60b694fbb	\N	scheduled	completed	2026-07-20 23:00:00	\N	2026-07-20 19:57:31.055	2026-07-20 19:57:49.604	\N	\N	\N	\N		200.00	0.00	200.00	MXN	\N	2026-07-20 19:57:31.049	2026-07-20 20:01:23.458
5fc69f0f-ef12-48d2-9b3d-f6788cc67ca7	e2646c4c-c0c7-433b-991f-b855b84f54df	079bbd20-fd1c-4fa4-b650-0706fb5258e5	8752fc0f-3588-4c22-9550-642c576365ab	\N	scheduled	completed	2026-07-20 20:32:00	\N	2026-07-20 19:32:50.597	2026-07-20 19:33:07.535	2026-07-20 19:33:31.353	\N	\N	\N	sss	200.00	0.00	200.00	MXN	\N	2026-07-20 19:32:50.59	2026-07-20 20:01:23.458
4614a84c-4983-47ab-9f7d-59f22ee1071a	e2646c4c-c0c7-433b-991f-b855b84f54df	079bbd20-fd1c-4fa4-b650-0706fb5258e5	8752fc0f-3588-4c22-9550-642c576365ab	\N	scheduled	completed	2026-07-20 23:38:00	\N	2026-07-20 19:34:54.139	2026-07-20 19:35:48.392	2026-07-20 19:52:19.259	\N	\N	\N		200.00	0.00	200.00	MXN	\N	2026-07-20 19:34:54.135	2026-07-20 20:01:23.458
f08b829a-3641-42f2-a277-b49066b2171b	e2646c4c-c0c7-433b-991f-b855b84f54df	079bbd20-fd1c-4fa4-b650-0706fb5258e5	51539983-3e7a-4c1f-8ae5-9ff60b694fbb	\N	scheduled	completed	2026-07-20 20:52:00	\N	2026-07-20 19:52:47.95	2026-07-20 19:53:07.47	2026-07-20 19:57:04.352	\N	\N	\N		200.00	0.00	200.00	MXN	\N	2026-07-20 19:52:47.943	2026-07-20 20:01:23.458
f0db74cd-7f3d-4fa3-b559-1be6608c2db8	e2646c4c-c0c7-433b-991f-b855b84f54df	079bbd20-fd1c-4fa4-b650-0706fb5258e5	51539983-3e7a-4c1f-8ae5-9ff60b694fbb	\N	scheduled	completed	2026-07-20 21:41:00	\N	2026-07-20 19:42:01.151	2026-07-20 19:42:32.835	2026-07-20 19:52:18.578	\N	\N	\N	s	150.00	0.00	150.00	MXN	\N	2026-07-20 19:42:01.147	2026-07-20 20:01:23.458
4c6a9098-b267-44dd-9d9d-e5435b457451	e2646c4c-c0c7-433b-991f-b855b84f54df	079bbd20-fd1c-4fa4-b650-0706fb5258e5	51539983-3e7a-4c1f-8ae5-9ff60b694fbb	\N	scheduled	accepted	2026-07-20 22:01:00	\N	2026-07-20 20:01:53.537	2026-07-20 20:02:52.873	\N	\N	\N	\N		200.00	0.00	200.00	MXN	\N	2026-07-20 20:01:53.53	2026-07-20 20:02:52.873
\.


--
-- Data for Name: services; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.services (id, category_id, name, slug, description, base_price, estimated_duration_min, icon_key, requires_prescription, is_active, created_at, updated_at) FROM stdin;
54374c21-e214-4f6e-8b12-aafc1cadbd13	56dfeadc-c3b8-499c-bd82-55f53537482b	Inyección Intramuscular	inyeccion-intramuscular	Aplicación de medicamento vía intramuscular.	150.00	20	Syringe	t	t	2026-07-20 18:37:55.456	2026-07-20 18:37:55.456
277f1076-8c93-4efe-9e30-7455fdd90e51	56dfeadc-c3b8-499c-bd82-55f53537482b	Toma de Signos Vitales	toma-signos-vitales	Medición de presión arterial, glucosa, temperatura y oxigenación.	200.00	30	Activity	f	t	2026-07-20 18:37:55.456	2026-07-20 18:37:55.456
84f6ac3a-9a3e-48a2-af65-fcc72769d431	56dfeadc-c3b8-499c-bd82-55f53537482b	Curación de Heridas	curacion-heridas	Limpieza y vendaje de heridas postoperatorias o úlceras.	350.00	45	Bandage	f	t	2026-07-20 18:37:55.456	2026-07-20 18:37:55.456
21bb6f45-08f8-4814-b992-22e74eae749c	b7fe69cd-b635-4c2b-9bd7-a4a469ef13cc	Turno Nocturno (8 hrs)	turno-nocturno	Cuidados y vigilancia del paciente durante la noche.	1200.00	480	Moon	f	t	2026-07-20 18:37:55.456	2026-07-20 18:37:55.456
923952e0-8087-4515-94dd-0e6826a70b36	b7fe69cd-b635-4c2b-9bd7-a4a469ef13cc	Turno Diurno (8 hrs)	turno-diurno	Atención continua, movilización y alimentación del paciente.	1000.00	480	Sun	f	t	2026-07-20 18:37:55.456	2026-07-20 18:37:55.456
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.users (id, email, password_hash, role, status, phone, phone_verified_at, email_verified_at, last_login_at, profile_photo_url, preferred_locale, timezone, created_at, updated_at, deleted_at) FROM stdin;
1aaeb590-a038-4a16-90a9-e13e45dd15aa	admin@sersa.mx	$2b$10$oG2VZhqORnppOUK6SoZ71OXZQk6Bs3RGV9OWpUbEtS3iLEEREOZ.G	admin	active	\N	\N	\N	\N	\N	es-MX	America/Mexico_City	2026-07-20 18:37:55.516	2026-07-20 18:37:55.516	\N
4444d4d4-2b90-4c76-ab6d-e6b047b5870c	paciente@sersa.mx	$2b$10$oG2VZhqORnppOUK6SoZ71OXZQk6Bs3RGV9OWpUbEtS3iLEEREOZ.G	patient	active	+526641234567	\N	\N	\N	\N	es-MX	America/Mexico_City	2026-07-20 18:37:55.522	2026-07-20 18:37:55.522	\N
f8b71978-1565-4b59-9fc1-f0e5270089d5	enfermero@sersa.mx	$2b$10$oG2VZhqORnppOUK6SoZ71OXZQk6Bs3RGV9OWpUbEtS3iLEEREOZ.G	nurse	active	+526641987654	\N	\N	\N	\N	es-MX	America/Mexico_City	2026-07-20 18:37:55.529	2026-07-20 18:37:55.529	\N
e2646c4c-c0c7-433b-991f-b855b84f54df	santana@sersa.mx	$2b$10$IxUpp.rmCPepSMtuv9FOtOCfmYQyKoo1uvfNlCbEQfoLboAkz2bhC	patient	active	\N	\N	\N	\N	\N	es-MX	America/Mexico_City	2026-07-20 18:52:12.207	2026-07-20 18:52:12.207	\N
079bbd20-fd1c-4fa4-b650-0706fb5258e5	enfermera@sersa.mx	$2b$10$2ylDUQw3zLjd20gyMdbEk.UilPxhy5RAhg7gvx14uoyucakABDTb2	nurse	active	\N	\N	\N	\N	\N	es-MX	America/Mexico_City	2026-07-20 18:51:16.173	2026-07-20 19:09:59.51	\N
\.


--
-- Data for Name: vital_signs_records; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.vital_signs_records (id, clinical_report_id, blood_pressure_sys, blood_pressure_dia, heart_rate_bpm, temperature_c, glucose_mg_dl, oxygen_saturation, respiratory_rate, recorded_at) FROM stdin;
a6f819a0-8c2b-40eb-be11-8348f892f412	b6d5fd0e-7029-481d-b2da-0ffcfe05e86f	111	80	80	31.0	100.0	99.00	\N	2026-07-20 19:15:07.833
\.


--
-- Data for Name: wallet_transactions; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.wallet_transactions (id, wallet_id, payment_id, service_request_id, transaction_type, amount, balance_after, description, status, created_at) FROM stdin;
c2b04f48-6fc3-4d9f-ad37-475cf0958350	1285b1d5-751d-4985-9dbb-8330a0bfe26c	0d09c7e2-ce37-4132-9368-596ff1fc4d79	18c77154-fe56-468c-a9f0-8e86c5b098c1	service_income	200.00	200.00	Ingreso por servicio b098c1	completed	2026-07-20 19:15:07.833
96230ccb-7181-489c-95a3-5d7cf101e74a	1285b1d5-751d-4985-9dbb-8330a0bfe26c	0d09c7e2-ce37-4132-9368-596ff1fc4d79	18c77154-fe56-468c-a9f0-8e86c5b098c1	platform_commission	-30.00	170.00	Comisión de plataforma (15%)	completed	2026-07-20 19:15:07.833
\.


--
-- Data for Name: withdrawal_requests; Type: TABLE DATA; Schema: public; Owner: sersa_user
--

COPY public.withdrawal_requests (id, wallet_id, payout_method_id, amount, status, provider_payout_id, processed_at, created_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: addresses addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);


--
-- Name: admin_profiles admin_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: clinical_reports clinical_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.clinical_reports
    ADD CONSTRAINT clinical_reports_pkey PRIMARY KEY (id);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: daily_routes daily_routes_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.daily_routes
    ADD CONSTRAINT daily_routes_pkey PRIMARY KEY (id);


--
-- Name: digital_signatures digital_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.digital_signatures
    ADD CONSTRAINT digital_signatures_pkey PRIMARY KEY (id);


--
-- Name: disputes disputes_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: nurse_availability_slots nurse_availability_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_availability_slots
    ADD CONSTRAINT nurse_availability_slots_pkey PRIMARY KEY (id);


--
-- Name: nurse_credential_reviews nurse_credential_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_credential_reviews
    ADD CONSTRAINT nurse_credential_reviews_pkey PRIMARY KEY (id);


--
-- Name: nurse_credentials nurse_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_credentials
    ADD CONSTRAINT nurse_credentials_pkey PRIMARY KEY (id);


--
-- Name: nurse_location_pings nurse_location_pings_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_location_pings
    ADD CONSTRAINT nurse_location_pings_pkey PRIMARY KEY (id);


--
-- Name: nurse_patient_relationships nurse_patient_relationships_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_patient_relationships
    ADD CONSTRAINT nurse_patient_relationships_pkey PRIMARY KEY (id);


--
-- Name: nurse_payout_methods nurse_payout_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_payout_methods
    ADD CONSTRAINT nurse_payout_methods_pkey PRIMARY KEY (id);


--
-- Name: nurse_profiles nurse_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_profiles
    ADD CONSTRAINT nurse_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: nurse_wallets nurse_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_wallets
    ADD CONSTRAINT nurse_wallets_pkey PRIMARY KEY (id);


--
-- Name: operational_zones operational_zones_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.operational_zones
    ADD CONSTRAINT operational_zones_pkey PRIMARY KEY (id);


--
-- Name: patient_profiles patient_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_pkey PRIMARY KEY (user_id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: platform_settings platform_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.platform_settings
    ADD CONSTRAINT platform_settings_pkey PRIMARY KEY (id);


--
-- Name: route_stops route_stops_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_pkey PRIMARY KEY (id);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_pricing_rules service_pricing_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_pricing_rules
    ADD CONSTRAINT service_pricing_rules_pkey PRIMARY KEY (id);


--
-- Name: service_request_attachments service_request_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_attachments
    ADD CONSTRAINT service_request_attachments_pkey PRIMARY KEY (id);


--
-- Name: service_request_items service_request_items_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_items
    ADD CONSTRAINT service_request_items_pkey PRIMARY KEY (id);


--
-- Name: service_request_status_history service_request_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_status_history
    ADD CONSTRAINT service_request_status_history_pkey PRIMARY KEY (id);


--
-- Name: service_request_visibility service_request_visibility_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_visibility
    ADD CONSTRAINT service_request_visibility_pkey PRIMARY KEY (id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: services services_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: vital_signs_records vital_signs_records_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.vital_signs_records
    ADD CONSTRAINT vital_signs_records_pkey PRIMARY KEY (id);


--
-- Name: wallet_transactions wallet_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_pkey PRIMARY KEY (id);


--
-- Name: withdrawal_requests withdrawal_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_pkey PRIMARY KEY (id);


--
-- Name: addresses_user_id_deleted_at_idx; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE INDEX addresses_user_id_deleted_at_idx ON public.addresses USING btree (user_id, deleted_at);


--
-- Name: clinical_reports_service_request_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX clinical_reports_service_request_id_key ON public.clinical_reports USING btree (service_request_id);


--
-- Name: conversations_service_request_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX conversations_service_request_id_key ON public.conversations USING btree (service_request_id);


--
-- Name: daily_routes_nurse_user_id_route_date_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX daily_routes_nurse_user_id_route_date_key ON public.daily_routes USING btree (nurse_user_id, route_date);


--
-- Name: digital_signatures_service_request_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX digital_signatures_service_request_id_key ON public.digital_signatures USING btree (service_request_id);


--
-- Name: nurse_credentials_nurse_user_id_document_type_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX nurse_credentials_nurse_user_id_document_type_key ON public.nurse_credentials USING btree (nurse_user_id, document_type);


--
-- Name: nurse_credentials_review_status_idx; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE INDEX nurse_credentials_review_status_idx ON public.nurse_credentials USING btree (review_status);


--
-- Name: nurse_patient_relationships_nurse_user_id_patient_user_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX nurse_patient_relationships_nurse_user_id_patient_user_id_key ON public.nurse_patient_relationships USING btree (nurse_user_id, patient_user_id);


--
-- Name: nurse_profiles_wallet_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX nurse_profiles_wallet_id_key ON public.nurse_profiles USING btree (wallet_id);


--
-- Name: nurse_wallets_nurse_user_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX nurse_wallets_nurse_user_id_key ON public.nurse_wallets USING btree (nurse_user_id);


--
-- Name: operational_zones_name_city_state_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX operational_zones_name_city_state_key ON public.operational_zones USING btree (name, city, state);


--
-- Name: route_stops_daily_route_id_service_request_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX route_stops_daily_route_id_service_request_id_key ON public.route_stops USING btree (daily_route_id, service_request_id);


--
-- Name: route_stops_daily_route_id_stop_order_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX route_stops_daily_route_id_stop_order_key ON public.route_stops USING btree (daily_route_id, stop_order);


--
-- Name: service_categories_name_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX service_categories_name_key ON public.service_categories USING btree (name);


--
-- Name: service_categories_slug_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX service_categories_slug_key ON public.service_categories USING btree (slug);


--
-- Name: service_request_items_service_request_id_service_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX service_request_items_service_request_id_service_id_key ON public.service_request_items USING btree (service_request_id, service_id);


--
-- Name: service_request_visibility_service_request_id_nurse_user_id_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX service_request_visibility_service_request_id_nurse_user_id_key ON public.service_request_visibility USING btree (service_request_id, nurse_user_id);


--
-- Name: service_requests_patient_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE INDEX service_requests_patient_user_id_created_at_idx ON public.service_requests USING btree (patient_user_id, created_at);


--
-- Name: service_requests_status_idx; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE INDEX service_requests_status_idx ON public.service_requests USING btree (status);


--
-- Name: services_slug_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX services_slug_key ON public.services USING btree (slug);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_role_status_deleted_at_idx; Type: INDEX; Schema: public; Owner: sersa_user
--

CREATE INDEX users_role_status_deleted_at_idx ON public.users USING btree (role, status, deleted_at);


--
-- Name: addresses addresses_operational_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_operational_zone_id_fkey FOREIGN KEY (operational_zone_id) REFERENCES public.operational_zones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: addresses addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: admin_profiles admin_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.admin_profiles
    ADD CONSTRAINT admin_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: clinical_reports clinical_reports_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.clinical_reports
    ADD CONSTRAINT clinical_reports_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: clinical_reports clinical_reports_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.clinical_reports
    ADD CONSTRAINT clinical_reports_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: conversations conversations_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: daily_routes daily_routes_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.daily_routes
    ADD CONSTRAINT daily_routes_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: digital_signatures digital_signatures_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.digital_signatures
    ADD CONSTRAINT digital_signatures_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: digital_signatures digital_signatures_signed_by_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.digital_signatures
    ADD CONSTRAINT digital_signatures_signed_by_user_id_fkey FOREIGN KEY (signed_by_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disputes disputes_assigned_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_assigned_admin_id_fkey FOREIGN KEY (assigned_admin_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: disputes disputes_opened_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_opened_by_fkey FOREIGN KEY (opened_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: disputes disputes_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.disputes
    ADD CONSTRAINT disputes_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: messages messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_availability_slots nurse_availability_slots_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_availability_slots
    ADD CONSTRAINT nurse_availability_slots_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_credential_reviews nurse_credential_reviews_credential_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_credential_reviews
    ADD CONSTRAINT nurse_credential_reviews_credential_id_fkey FOREIGN KEY (credential_id) REFERENCES public.nurse_credentials(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_credential_reviews nurse_credential_reviews_reviewer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_credential_reviews
    ADD CONSTRAINT nurse_credential_reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: nurse_credentials nurse_credentials_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_credentials
    ADD CONSTRAINT nurse_credentials_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_location_pings nurse_location_pings_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_location_pings
    ADD CONSTRAINT nurse_location_pings_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_location_pings nurse_location_pings_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_location_pings
    ADD CONSTRAINT nurse_location_pings_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: nurse_patient_relationships nurse_patient_relationships_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_patient_relationships
    ADD CONSTRAINT nurse_patient_relationships_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_patient_relationships nurse_patient_relationships_patient_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_patient_relationships
    ADD CONSTRAINT nurse_patient_relationships_patient_user_id_fkey FOREIGN KEY (patient_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_payout_methods nurse_payout_methods_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_payout_methods
    ADD CONSTRAINT nurse_payout_methods_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_profiles nurse_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_profiles
    ADD CONSTRAINT nurse_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nurse_profiles nurse_profiles_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_profiles
    ADD CONSTRAINT nurse_profiles_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.nurse_wallets(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: nurse_wallets nurse_wallets_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.nurse_wallets
    ADD CONSTRAINT nurse_wallets_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: patient_profiles patient_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.patient_profiles
    ADD CONSTRAINT patient_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: payments payments_patient_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_patient_user_id_fkey FOREIGN KEY (patient_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: payments payments_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: route_stops route_stops_daily_route_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_daily_route_id_fkey FOREIGN KEY (daily_route_id) REFERENCES public.daily_routes(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: route_stops route_stops_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.route_stops
    ADD CONSTRAINT route_stops_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: service_pricing_rules service_pricing_rules_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_pricing_rules
    ADD CONSTRAINT service_pricing_rules_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_request_attachments service_request_attachments_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_attachments
    ADD CONSTRAINT service_request_attachments_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_request_attachments service_request_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_attachments
    ADD CONSTRAINT service_request_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: service_request_items service_request_items_pricing_rule_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_items
    ADD CONSTRAINT service_request_items_pricing_rule_id_fkey FOREIGN KEY (pricing_rule_id) REFERENCES public.service_pricing_rules(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_request_items service_request_items_service_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_items
    ADD CONSTRAINT service_request_items_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: service_request_items service_request_items_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_items
    ADD CONSTRAINT service_request_items_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_request_status_history service_request_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_status_history
    ADD CONSTRAINT service_request_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_request_status_history service_request_status_history_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_status_history
    ADD CONSTRAINT service_request_status_history_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_request_visibility service_request_visibility_nurse_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_visibility
    ADD CONSTRAINT service_request_visibility_nurse_user_id_fkey FOREIGN KEY (nurse_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_request_visibility service_request_visibility_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_request_visibility
    ADD CONSTRAINT service_request_visibility_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: service_requests service_requests_address_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_address_id_fkey FOREIGN KEY (address_id) REFERENCES public.addresses(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: service_requests service_requests_assigned_nurse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_assigned_nurse_id_fkey FOREIGN KEY (assigned_nurse_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_requests service_requests_operational_zone_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_operational_zone_id_fkey FOREIGN KEY (operational_zone_id) REFERENCES public.operational_zones(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: service_requests service_requests_patient_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_patient_user_id_fkey FOREIGN KEY (patient_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: services services_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT services_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: vital_signs_records vital_signs_records_clinical_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.vital_signs_records
    ADD CONSTRAINT vital_signs_records_clinical_report_id_fkey FOREIGN KEY (clinical_report_id) REFERENCES public.clinical_reports(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: wallet_transactions wallet_transactions_payment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_payment_id_fkey FOREIGN KEY (payment_id) REFERENCES public.payments(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wallet_transactions wallet_transactions_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: wallet_transactions wallet_transactions_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.wallet_transactions
    ADD CONSTRAINT wallet_transactions_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.nurse_wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: withdrawal_requests withdrawal_requests_payout_method_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_payout_method_id_fkey FOREIGN KEY (payout_method_id) REFERENCES public.nurse_payout_methods(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: withdrawal_requests withdrawal_requests_wallet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: sersa_user
--

ALTER TABLE ONLY public.withdrawal_requests
    ADD CONSTRAINT withdrawal_requests_wallet_id_fkey FOREIGN KEY (wallet_id) REFERENCES public.nurse_wallets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: sersa_user
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

