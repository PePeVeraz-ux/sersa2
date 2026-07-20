-- =============================================================================
-- SERSA — Sistema de Enfermería y Salud a Domicilio
-- Esquema migrado de MySQL 8.0+ a PostgreSQL 15+ / PostGIS 3+
--
-- Ejecución: conectarse primero a la base sersa_db y ejecutar este archivo.
-- Requiere que PostGIS esté instalado en el servidor PostgreSQL.
-- =============================================================================


-- CREATE DATABASE SERSA
--   WITH
--   ENCODING = 'UTF8'
--   TEMPLATE = template0;

BEGIN;

CREATE EXTENSION IF NOT EXISTS postgis;
SET search_path TO public;

-- -----------------------------------------------------------------------------
-- TIPOS ENUMERADOS
-- -----------------------------------------------------------------------------
CREATE TYPE user_role_enum AS ENUM ('patient', 'nurse', 'admin');
CREATE TYPE user_status_enum AS ENUM ('pending_verification', 'active', 'suspended', 'rejected');
CREATE TYPE credential_document_type_enum AS ENUM ('professional_license', 'degree_title');
CREATE TYPE credential_review_status_enum AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE address_label_enum AS ENUM ('home', 'work', 'other');
CREATE TYPE pricing_modifier_type_enum AS ENUM ('night_hours', 'weekend', 'holiday', 'zone_surge');
CREATE TYPE service_request_type_enum AS ENUM ('immediate', 'scheduled');
CREATE TYPE service_request_status_enum AS ENUM (
  'draft', 'published', 'accepted', 'en_camino', 'arrived',
  'in_progress', 'completed', 'cancelled', 'disputed'
);
CREATE TYPE attachment_type_enum AS ENUM ('prescription', 'lab_result', 'clinical_photo', 'other');
CREATE TYPE route_stop_status_enum AS ENUM ('pending', 'en_camino', 'arrived', 'completed', 'skipped');
CREATE TYPE clinical_status_enum AS ENUM ('estable', 'seguimiento', 'critico');
CREATE TYPE payment_status_enum AS ENUM (
  'pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'
);
CREATE TYPE wallet_transaction_type_enum AS ENUM (
  'service_income', 'platform_commission', 'withdrawal', 'refund', 'adjustment'
);
CREATE TYPE withdrawal_status_enum AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE message_type_enum AS ENUM ('text', 'image', 'system');
CREATE TYPE notification_channel_enum AS ENUM ('push', 'email', 'sms', 'in_app');
CREATE TYPE dispute_status_enum AS ENUM (
  'open', 'under_review', 'resolved_patient', 'resolved_nurse', 'closed'
);

-- -----------------------------------------------------------------------------
-- CONFIGURACIÓN DE PLATAFORMA
-- -----------------------------------------------------------------------------
CREATE TABLE platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  coverage_radius_km DECIMAL(6,2) NOT NULL DEFAULT 15.00 CHECK (coverage_radius_km > 0 AND coverage_radius_km <= 100),
  platform_commission_pct DECIMAL(5,2) NOT NULL DEFAULT 15.00 CHECK (platform_commission_pct >= 0 AND platform_commission_pct <= 50),
  currency_code CHAR(3) NOT NULL DEFAULT 'MXN',
  pilot_city VARCHAR(120) NOT NULL DEFAULT 'Ciudad de México',
  pilot_state VARCHAR(80),
  pilot_country CHAR(2) NOT NULL DEFAULT 'MX',
  pilot_area geometry(Polygon, 4326),
  min_app_version VARCHAR(20),
  support_email VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------------------------------
-- ZONAS OPERATIVAS
-- -----------------------------------------------------------------------------
CREATE TABLE operational_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(80),
  country_code CHAR(2) NOT NULL DEFAULT 'MX',
  boundary geometry(Polygon, 4326) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (name, city, state)
);

-- -----------------------------------------------------------------------------
-- USUARIOS Y AUTENTICACIÓN
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT,
  role user_role_enum NOT NULL,
  status user_status_enum NOT NULL DEFAULT 'pending_verification',
  phone VARCHAR(20),
  phone_verified_at TIMESTAMP,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  profile_photo_url TEXT,
  preferred_locale VARCHAR(10) NOT NULL DEFAULT 'es-MX',
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_role_status ON users (role, status, deleted_at);

CREATE TABLE patient_profiles (
  user_id UUID PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  second_last_name VARCHAR(80),
  date_of_birth DATE,
  gender VARCHAR(30),
  emergency_contact_name VARCHAR(160),
  emergency_contact_phone VARCHAR(20),
  medical_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE nurse_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_user_id UUID NOT NULL UNIQUE,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  pending_balance DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  currency_code CHAR(3) NOT NULL DEFAULT 'MXN',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE nurse_profiles (
  user_id UUID PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  second_last_name VARCHAR(80),
  professional_license VARCHAR(40) NOT NULL,
  license_state VARCHAR(80),
  bio TEXT,
  years_experience SMALLINT CHECK (years_experience >= 0),
  is_available BOOLEAN NOT NULL DEFAULT FALSE,
  average_rating DECIMAL(3,2) DEFAULT 0 CHECK (average_rating BETWEEN 0 AND 5),
  total_services INTEGER NOT NULL DEFAULT 0,
  wallet_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_id) REFERENCES nurse_wallets(id)
);

CREATE TABLE admin_profiles (
  user_id UUID PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  department VARCHAR(80),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE nurse_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_user_id UUID NOT NULL,
  document_type credential_document_type_enum NOT NULL,
  file_url TEXT NOT NULL,
  file_hash VARCHAR(64),
  issued_at DATE,
  expires_at DATE,
  review_status credential_review_status_enum NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (nurse_user_id, document_type),
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
);

CREATE INDEX idx_nurse_credentials_status ON nurse_credentials (review_status);

CREATE TABLE nurse_credential_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credential_id UUID NOT NULL,
  reviewer_id UUID NOT NULL,
  previous_status credential_review_status_enum NOT NULL,
  new_status credential_review_status_enum NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (credential_id) REFERENCES nurse_credentials(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
);

-- -----------------------------------------------------------------------------
-- DIRECCIONES FRECUENTES
-- -----------------------------------------------------------------------------
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label address_label_enum NOT NULL DEFAULT 'home',
  custom_label VARCHAR(60),
  street_line1 VARCHAR(200) NOT NULL,
  street_line2 VARCHAR(120),
  neighborhood VARCHAR(120),
  city VARCHAR(120) NOT NULL,
  state VARCHAR(80),
  postal_code VARCHAR(12) NOT NULL,
  country_code CHAR(2) NOT NULL DEFAULT 'MX',
  references_text TEXT,
  location geometry(Point, 4326) NOT NULL,
  operational_zone_id UUID,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (operational_zone_id) REFERENCES operational_zones(id)
);

CREATE INDEX idx_addresses_user ON addresses (user_id, deleted_at);

-- -----------------------------------------------------------------------------
-- CATÁLOGO DE SERVICIOS
-- -----------------------------------------------------------------------------
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE,
  description TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_price DECIMAL(12,2) NOT NULL CHECK (base_price >= 0),
  estimated_duration_min SMALLINT NOT NULL DEFAULT 30,
  icon_key VARCHAR(40),
  requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id)
);

CREATE TABLE service_pricing_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID,
  modifier_type pricing_modifier_type_enum NOT NULL,
  multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00 CHECK (multiplier > 0),
  fixed_surcharge DECIMAL(12,2) NOT NULL DEFAULT 0,
  starts_at_time TIME,
  ends_at_time TIME,
  applies_on_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- -----------------------------------------------------------------------------
-- SOLICITUDES / CITAS
-- -----------------------------------------------------------------------------
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_user_id UUID NOT NULL,
  assigned_nurse_id UUID,
  address_id UUID NOT NULL,
  operational_zone_id UUID,
  request_type service_request_type_enum NOT NULL,
  status service_request_status_enum NOT NULL DEFAULT 'draft',
  scheduled_start_at TIMESTAMP,
  scheduled_end_at TIMESTAMP,
  published_at TIMESTAMP,
  accepted_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  cancellation_reason TEXT,
  patient_notes TEXT,
  subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  surcharge_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency_code CHAR(3) NOT NULL DEFAULT 'MXN',
  service_location geometry(Point, 4326),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_nurse_id) REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id),
  FOREIGN KEY (operational_zone_id) REFERENCES operational_zones(id),
  CHECK (request_type = 'immediate' OR scheduled_start_at IS NOT NULL)
);

CREATE INDEX idx_service_requests_patient ON service_requests (patient_user_id, created_at);
CREATE INDEX idx_service_requests_status ON service_requests (status);

CREATE TABLE service_request_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  service_id UUID NOT NULL,
  quantity SMALLINT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  pricing_rule_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (service_request_id, service_id),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (pricing_rule_id) REFERENCES service_pricing_rules(id)
);

CREATE TABLE service_request_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  uploaded_by UUID NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  attachment_type attachment_type_enum NOT NULL DEFAULT 'prescription',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

CREATE TABLE service_request_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by UUID,
  change_source VARCHAR(40) DEFAULT 'system',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
);

-- -----------------------------------------------------------------------------
-- MATCHING, RUTAS Y GPS
-- -----------------------------------------------------------------------------
CREATE TABLE service_request_visibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  nurse_user_id UUID NOT NULL,
  distance_meters DECIMAL(10,2),
  notified_at TIMESTAMP,
  viewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (service_request_id, nurse_user_id),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE daily_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_user_id UUID NOT NULL,
  route_date DATE NOT NULL,
  total_distance_km DECIMAL(8,2),
  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (nurse_user_id, route_date),
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE route_stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_route_id UUID NOT NULL,
  service_request_id UUID NOT NULL,
  stop_order SMALLINT NOT NULL CHECK (stop_order > 0),
  status route_stop_status_enum NOT NULL DEFAULT 'pending',
  planned_arrival_at TIMESTAMP,
  actual_arrival_at TIMESTAMP,
  distance_km DECIMAL(8,2),
  eta_minutes SMALLINT,
  price_amount DECIMAL(12,2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (daily_route_id, stop_order),
  UNIQUE (daily_route_id, service_request_id),
  FOREIGN KEY (daily_route_id) REFERENCES daily_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
);

CREATE TABLE nurse_location_pings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_user_id UUID NOT NULL,
  service_request_id UUID,
  location geometry(Point, 4326) NOT NULL,
  accuracy_meters DECIMAL(8,2),
  speed_kmh DECIMAL(6,2),
  heading_degrees SMALLINT,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL
);

-- -----------------------------------------------------------------------------
-- RELACIÓN ENFERMERO–PACIENTE, AGENDA, Y BITÁCORA CLÍNICA
-- -----------------------------------------------------------------------------
CREATE TABLE nurse_patient_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_user_id UUID NOT NULL,
  patient_user_id UUID NOT NULL,
  clinical_status clinical_status_enum NOT NULL DEFAULT 'estable',
  total_services INTEGER NOT NULL DEFAULT 0,
  last_service_at TIMESTAMP,
  last_service_name VARCHAR(160),
  private_notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (nurse_user_id, patient_user_id),
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE nurse_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_user_id UUID NOT NULL,
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  starts_at TIME NOT NULL,
  ends_at TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE clinical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL UNIQUE,
  nurse_user_id UUID NOT NULL,
  observations TEXT NOT NULL,
  wound_status VARCHAR(80),
  procedures_done TEXT,
  recommendations TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
  FOREIGN KEY (nurse_user_id) REFERENCES users(id)
);

CREATE TABLE vital_signs_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinical_report_id UUID NOT NULL,
  blood_pressure_sys SMALLINT,
  blood_pressure_dia SMALLINT,
  heart_rate_bpm SMALLINT,
  temperature_c DECIMAL(4,1),
  glucose_mg_dl DECIMAL(6,1),
  oxygen_saturation DECIMAL(5,2),
  respiratory_rate SMALLINT,
  recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clinical_report_id) REFERENCES clinical_reports(id) ON DELETE CASCADE
);

CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL UNIQUE,
  signed_by_user_id UUID NOT NULL,
  signature_image_url TEXT NOT NULL,
  signed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
  FOREIGN KEY (signed_by_user_id) REFERENCES users(id)
);

-- -----------------------------------------------------------------------------
-- FINANZAS Y PAGOS
-- -----------------------------------------------------------------------------
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  patient_user_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  platform_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  nurse_net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency_code CHAR(3) NOT NULL DEFAULT 'MXN',
  status payment_status_enum NOT NULL DEFAULT 'pending',
  provider VARCHAR(40) NOT NULL DEFAULT 'stripe',
  provider_payment_id VARCHAR(120),
  provider_payload JSONB,
  paid_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
  FOREIGN KEY (patient_user_id) REFERENCES users(id)
);

CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL,
  payment_id UUID,
  service_request_id UUID,
  transaction_type wallet_transaction_type_enum NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  description VARCHAR(255),
  status payment_status_enum NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES nurse_wallets(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
);

CREATE TABLE nurse_payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nurse_user_id UUID NOT NULL,
  method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('bank_account', 'debit_card')),
  bank_name VARCHAR(80),
  account_last_four CHAR(4),
  clabe_masked VARCHAR(20),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  provider_method_id VARCHAR(120),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID NOT NULL,
  payout_method_id UUID NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  status withdrawal_status_enum NOT NULL DEFAULT 'pending',
  provider_payout_id VARCHAR(120),
  processed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES nurse_wallets(id),
  FOREIGN KEY (payout_method_id) REFERENCES nurse_payout_methods(id)
);

-- -----------------------------------------------------------------------------
-- COMUNICACIÓN, NOTIFICACIONES Y DISPUTAS
-- -----------------------------------------------------------------------------
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  message_type message_type_enum NOT NULL DEFAULT 'text',
  body TEXT,
  attachment_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  channel notification_channel_enum NOT NULL DEFAULT 'in_app',
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  payload JSONB,
  read_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL,
  opened_by UUID NOT NULL,
  assigned_admin_id UUID,
  status dispute_status_enum NOT NULL DEFAULT 'open',
  reason TEXT NOT NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
  FOREIGN KEY (opened_by) REFERENCES users(id),
  FOREIGN KEY (assigned_admin_id) REFERENCES users(id)
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
);


-- -----------------------------------------------------------------------------
-- ÍNDICES ESPACIALES POSTGIS Y DE APOYO
-- -----------------------------------------------------------------------------
CREATE INDEX idx_operational_zones_boundary
  ON operational_zones USING GIST (boundary);

CREATE INDEX idx_addresses_location
  ON addresses USING GIST (location);

CREATE INDEX idx_nurse_location_pings_location
  ON nurse_location_pings USING GIST (location);

-- Índice funcional usado por ST_DWithin al medir distancias en metros.
CREATE INDEX idx_nurse_location_pings_location_geography
  ON nurse_location_pings USING GIST ((location::geography));

-- Apoya la consulta de la ubicación más reciente por enfermero.
CREATE INDEX idx_nurse_location_pings_latest
  ON nurse_location_pings (nurse_user_id, recorded_at DESC);

-- -----------------------------------------------------------------------------
-- VISTAS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_nurse_monthly_earnings AS
SELECT
  nw.nurse_user_id,
  date_trunc('month', wt.created_at)::date AS month,
  SUM(
    CASE
      WHEN wt.transaction_type = 'service_income' AND wt.amount > 0
        THEN wt.amount
      ELSE 0
    END
  ) AS ingresos,
  COUNT(DISTINCT
    CASE
      WHEN wt.transaction_type = 'service_income'
        THEN wt.service_request_id
      ELSE NULL
    END
  ) AS servicios
FROM nurse_wallets nw
JOIN wallet_transactions wt ON wt.wallet_id = nw.id
GROUP BY nw.nurse_user_id, date_trunc('month', wt.created_at)::date;

CREATE OR REPLACE VIEW v_published_requests_nearby AS
SELECT
  sr.id AS service_request_id,
  sr.patient_user_id,
  sr.service_location,
  sr.status,
  sr.total_amount,
  sr.scheduled_start_at,
  sr.published_at
FROM service_requests sr
WHERE sr.status = 'published'
  AND sr.service_location IS NOT NULL;

-- -----------------------------------------------------------------------------
-- FUNCIÓN GENÉRICA PARA updated_at
-- Equivale a ON UPDATE CURRENT_TIMESTAMP de MySQL.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_platform_settings_updated_at
BEFORE UPDATE ON platform_settings
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_operational_zones_updated_at
BEFORE UPDATE ON operational_zones
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_patient_profiles_updated_at
BEFORE UPDATE ON patient_profiles
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_nurse_wallets_updated_at
BEFORE UPDATE ON nurse_wallets
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_nurse_profiles_updated_at
BEFORE UPDATE ON nurse_profiles
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_addresses_updated_at
BEFORE UPDATE ON addresses
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_services_updated_at
BEFORE UPDATE ON services
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_service_requests_updated_at
BEFORE UPDATE ON service_requests
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_nurse_patient_relationships_updated_at
BEFORE UPDATE ON nurse_patient_relationships
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_clinical_reports_updated_at
BEFORE UPDATE ON clinical_reports
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

CREATE TRIGGER trg_disputes_updated_at
BEFORE UPDATE ON disputes
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();

-- -----------------------------------------------------------------------------
-- TRIGGER: Crear wallet automáticamente al crear un perfil de enfermero
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_nurse_profile_wallet()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.wallet_id IS NULL THEN
    NEW.wallet_id := gen_random_uuid();

    INSERT INTO nurse_wallets (id, nurse_user_id)
    VALUES (NEW.wallet_id, NEW.user_id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_nurse_profile_wallet
BEFORE INSERT ON nurse_profiles
FOR EACH ROW EXECUTE FUNCTION fn_nurse_profile_wallet();

-- -----------------------------------------------------------------------------
-- TRIGGER: Historial de estado de las solicitudes
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_service_request_status_history()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO service_request_status_history (
      service_request_id,
      from_status,
      to_status,
      change_source
    ) VALUES (
      NEW.id,
      OLD.status::text,
      NEW.status::text,
      'system'
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_service_request_status_history
AFTER UPDATE OF status ON service_requests
FOR EACH ROW EXECUTE FUNCTION fn_service_request_status_history();

-- -----------------------------------------------------------------------------
-- TRIGGER: Activar enfermero tras aprobar cédula y título
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_nurse_kyc_activation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_approved_count integer;
BEGIN
  IF NEW.review_status = 'approved'
     AND OLD.review_status IS DISTINCT FROM NEW.review_status THEN

    SELECT COUNT(*)
      INTO v_approved_count
    FROM nurse_credentials
    WHERE nurse_user_id = NEW.nurse_user_id
      AND review_status = 'approved';

    IF v_approved_count >= 2 THEN
      UPDATE users
      SET status = 'active'
      WHERE id = NEW.nurse_user_id
        AND role = 'nurse';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_nurse_kyc_activation
AFTER UPDATE OF review_status ON nurse_credentials
FOR EACH ROW EXECUTE FUNCTION fn_nurse_kyc_activation();

-- -----------------------------------------------------------------------------
-- FUNCIÓN PARA FILTRO DE CERCANÍA (RF3)
-- En PostgreSQL se implementa como función que retorna filas.
-- Uso:
-- SELECT * FROM sp_find_nurses_within_radius(-99.1332, 19.4326, 15.00);
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sp_find_nurses_within_radius(
  p_req_lng numeric(11,8),
  p_req_lat numeric(10,8),
  p_radius_km numeric(6,2) DEFAULT NULL
)
RETURNS TABLE (
  nurse_user_id uuid,
  distance_meters double precision
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_radius_km numeric(6,2);
  v_req_point geometry(Point, 4326);
BEGIN
  IF p_req_lng IS NULL OR p_req_lat IS NULL THEN
    RAISE EXCEPTION 'La longitud y la latitud son obligatorias';
  END IF;

  IF p_req_lng < -180 OR p_req_lng > 180 THEN
    RAISE EXCEPTION 'Longitud fuera de rango: %', p_req_lng;
  END IF;

  IF p_req_lat < -90 OR p_req_lat > 90 THEN
    RAISE EXCEPTION 'Latitud fuera de rango: %', p_req_lat;
  END IF;

  IF p_radius_km IS NULL THEN
    SELECT ps.coverage_radius_km
      INTO v_radius_km
    FROM platform_settings ps
    WHERE ps.is_active = TRUE
    ORDER BY ps.created_at
    LIMIT 1;
  ELSE
    v_radius_km := p_radius_km;
  END IF;

  IF v_radius_km IS NULL THEN
    RAISE EXCEPTION 'No existe un radio de cobertura activo en platform_settings';
  END IF;

  IF v_radius_km <= 0 OR v_radius_km > 100 THEN
    RAISE EXCEPTION 'Radio fuera de rango: % km', v_radius_km;
  END IF;

  v_req_point := ST_SetSRID(ST_MakePoint(p_req_lng, p_req_lat), 4326);

  RETURN QUERY
  WITH latest_location AS (
    SELECT DISTINCT ON (nlp.nurse_user_id)
      nlp.nurse_user_id,
      nlp.location
    FROM nurse_location_pings nlp
    ORDER BY nlp.nurse_user_id, nlp.recorded_at DESC
  )
  SELECT
    np.user_id,
    ST_Distance(
      v_req_point::geography,
      ll.location::geography
    ) AS distance_meters
  FROM nurse_profiles np
  JOIN users u
    ON u.id = np.user_id
  JOIN latest_location ll
    ON ll.nurse_user_id = np.user_id
  WHERE u.role = 'nurse'
    AND u.status = 'active'
    AND np.is_available = TRUE
    AND u.deleted_at IS NULL
    AND ST_DWithin(
      v_req_point::geography,
      ll.location::geography,
      v_radius_km * 1000
    )
  ORDER BY 2;
END;
$$;

COMMIT;
