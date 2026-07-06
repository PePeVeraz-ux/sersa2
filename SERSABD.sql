-- =============================================================================
-- SERSA — Sistema de Enfermería y Salud a Domicilio
-- Esquema relacional MySQL 8.0+
-- =============================================================================

CREATE DATABASE IF NOT EXISTS sersa_db
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE sersa_db;

-- -----------------------------------------------------------------------------
-- CONFIGURACIÓN DE PLATAFORMA
-- -----------------------------------------------------------------------------
CREATE TABLE platform_settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  coverage_radius_km DECIMAL(6,2) NOT NULL DEFAULT 15.00 CHECK (coverage_radius_km > 0 AND coverage_radius_km <= 100),
  platform_commission_pct DECIMAL(5,2) NOT NULL DEFAULT 15.00 CHECK (platform_commission_pct >= 0 AND platform_commission_pct <= 50),
  currency_code CHAR(3) NOT NULL DEFAULT 'MXN',
  pilot_city VARCHAR(120) NOT NULL DEFAULT 'Ciudad de México',
  pilot_state VARCHAR(80),
  pilot_country CHAR(2) NOT NULL DEFAULT 'MX',
  pilot_area POLYGON SRID 4326,
  min_app_version VARCHAR(20),
  support_email VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- ZONAS OPERATIVAS
-- -----------------------------------------------------------------------------
CREATE TABLE operational_zones (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(120) NOT NULL,
  city VARCHAR(120) NOT NULL,
  state VARCHAR(80),
  country_code CHAR(2) NOT NULL DEFAULT 'MX',
  boundary POLYGON SRID 4326 NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (name, city, state),
  SPATIAL INDEX idx_operational_zones_boundary (boundary)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- USUARIOS Y AUTENTICACIÓN
-- -----------------------------------------------------------------------------
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT,
  role ENUM('patient', 'nurse', 'admin') NOT NULL,
  status ENUM('pending_verification', 'active', 'suspended', 'rejected') NOT NULL DEFAULT 'pending_verification',
  phone VARCHAR(20),
  phone_verified_at DATETIME,
  email_verified_at DATETIME,
  last_login_at DATETIME,
  profile_photo_url TEXT,
  preferred_locale VARCHAR(10) NOT NULL DEFAULT 'es-MX',
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME
) ENGINE=InnoDB;

CREATE INDEX idx_users_role_status ON users (role, status, deleted_at);

CREATE TABLE patient_profiles (
  user_id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  second_last_name VARCHAR(80),
  date_of_birth DATE,
  gender VARCHAR(30),
  emergency_contact_name VARCHAR(160),
  emergency_contact_phone VARCHAR(20),
  medical_notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE nurse_wallets (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nurse_user_id VARCHAR(36) NOT NULL UNIQUE,
  balance DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (balance >= 0),
  pending_balance DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (pending_balance >= 0),
  currency_code CHAR(3) NOT NULL DEFAULT 'MXN',
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE nurse_profiles (
  user_id VARCHAR(36) PRIMARY KEY,
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
  wallet_id VARCHAR(36),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (wallet_id) REFERENCES nurse_wallets(id)
) ENGINE=InnoDB;

CREATE TABLE admin_profiles (
  user_id VARCHAR(36) PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  department VARCHAR(80),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE nurse_credentials (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nurse_user_id VARCHAR(36) NOT NULL,
  document_type ENUM('professional_license', 'degree_title') NOT NULL,
  file_url TEXT NOT NULL,
  file_hash VARCHAR(64),
  issued_at DATE,
  expires_at DATE,
  review_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  reviewed_by VARCHAR(36),
  reviewed_at DATETIME,
  rejection_reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (nurse_user_id, document_type),
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE INDEX idx_nurse_credentials_status ON nurse_credentials (review_status);

CREATE TABLE nurse_credential_reviews (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  credential_id VARCHAR(36) NOT NULL,
  reviewer_id VARCHAR(36) NOT NULL,
  previous_status ENUM('pending', 'approved', 'rejected') NOT NULL,
  new_status ENUM('pending', 'approved', 'rejected') NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (credential_id) REFERENCES nurse_credentials(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- DIRECCIONES FRECUENTES
-- -----------------------------------------------------------------------------
CREATE TABLE addresses (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  label ENUM('home', 'work', 'other') NOT NULL DEFAULT 'home',
  custom_label VARCHAR(60),
  street_line1 VARCHAR(200) NOT NULL,
  street_line2 VARCHAR(120),
  neighborhood VARCHAR(120),
  city VARCHAR(120) NOT NULL,
  state VARCHAR(80),
  postal_code VARCHAR(12) NOT NULL,
  country_code CHAR(2) NOT NULL DEFAULT 'MX',
  references_text TEXT,
  location POINT SRID 4326 NOT NULL,
  operational_zone_id VARCHAR(36),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (operational_zone_id) REFERENCES operational_zones(id),
  SPATIAL INDEX idx_addresses_location (location)
) ENGINE=InnoDB;

CREATE INDEX idx_addresses_user ON addresses (user_id, deleted_at);

-- -----------------------------------------------------------------------------
-- CATÁLOGO DE SERVICIOS
-- -----------------------------------------------------------------------------
CREATE TABLE service_categories (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(80) NOT NULL UNIQUE,
  slug VARCHAR(80) NOT NULL UNIQUE,
  description TEXT,
  sort_order SMALLINT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE services (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  category_id VARCHAR(36) NOT NULL,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(160) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  base_price DECIMAL(12,2) NOT NULL CHECK (base_price >= 0),
  estimated_duration_min SMALLINT NOT NULL DEFAULT 30,
  icon_key VARCHAR(40),
  requires_prescription BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES service_categories(id)
) ENGINE=InnoDB;

CREATE TABLE service_pricing_rules (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_id VARCHAR(36),
  modifier_type ENUM('night_hours', 'weekend', 'holiday', 'zone_surge') NOT NULL,
  multiplier DECIMAL(5,2) NOT NULL DEFAULT 1.00 CHECK (multiplier > 0),
  fixed_surcharge DECIMAL(12,2) NOT NULL DEFAULT 0,
  starts_at_time TIME,
  ends_at_time TIME,
  applies_on_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- SOLICITUDES / CITAS
-- -----------------------------------------------------------------------------
CREATE TABLE service_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  patient_user_id VARCHAR(36) NOT NULL,
  assigned_nurse_id VARCHAR(36),
  address_id VARCHAR(36) NOT NULL,
  operational_zone_id VARCHAR(36),
  request_type ENUM('immediate', 'scheduled') NOT NULL,
  status ENUM('draft', 'published', 'accepted', 'en_camino', 'arrived', 'in_progress', 'completed', 'cancelled', 'disputed') NOT NULL DEFAULT 'draft',
  scheduled_start_at DATETIME,
  scheduled_end_at DATETIME,
  published_at DATETIME,
  accepted_at DATETIME,
  started_at DATETIME,
  completed_at DATETIME,
  cancelled_at DATETIME,
  cancellation_reason TEXT,
  patient_notes TEXT,
  subtotal_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  surcharge_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency_code CHAR(3) NOT NULL DEFAULT 'MXN',
  service_location POINT SRID 4326,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_nurse_id) REFERENCES users(id),
  FOREIGN KEY (address_id) REFERENCES addresses(id),
  FOREIGN KEY (operational_zone_id) REFERENCES operational_zones(id)
  -- Nota: En MySQL, los CHECK con lógica condicional no siempre son 100% estrictos si combinan columnas de fechas nulas, pero se puede definir:
  -- CHECK (request_type = 'immediate' OR scheduled_start_at IS NOT NULL)
) ENGINE=InnoDB;

CREATE INDEX idx_service_requests_patient ON service_requests (patient_user_id, created_at);
CREATE INDEX idx_service_requests_status ON service_requests (status);

CREATE TABLE service_request_items (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL,
  service_id VARCHAR(36) NOT NULL,
  quantity SMALLINT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  line_total DECIMAL(12,2) NOT NULL,
  pricing_rule_id VARCHAR(36),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (service_request_id, service_id),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id),
  FOREIGN KEY (pricing_rule_id) REFERENCES service_pricing_rules(id)
) ENGINE=InnoDB;

CREATE TABLE service_request_attachments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL,
  uploaded_by VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  mime_type VARCHAR(100),
  file_size_bytes BIGINT,
  attachment_type ENUM('prescription', 'lab_result', 'clinical_photo', 'other') NOT NULL DEFAULT 'prescription',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE service_request_status_history (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL,
  from_status VARCHAR(50),
  to_status VARCHAR(50) NOT NULL,
  changed_by VARCHAR(36),
  change_source VARCHAR(40) DEFAULT 'system',
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- MATCHING, RUTAS Y GPS
-- -----------------------------------------------------------------------------
CREATE TABLE service_request_visibility (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL,
  nurse_user_id VARCHAR(36) NOT NULL,
  distance_meters DECIMAL(10,2),
  notified_at DATETIME,
  viewed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (service_request_id, nurse_user_id),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE daily_routes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nurse_user_id VARCHAR(36) NOT NULL,
  route_date DATE NOT NULL,
  total_distance_km DECIMAL(8,2),
  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0,
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (nurse_user_id, route_date),
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE route_stops (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  daily_route_id VARCHAR(36) NOT NULL,
  service_request_id VARCHAR(36) NOT NULL,
  stop_order SMALLINT NOT NULL CHECK (stop_order > 0),
  status ENUM('pending', 'en_camino', 'arrived', 'completed', 'skipped') NOT NULL DEFAULT 'pending',
  planned_arrival_at DATETIME,
  actual_arrival_at DATETIME,
  distance_km DECIMAL(8,2),
  eta_minutes SMALLINT,
  price_amount DECIMAL(12,2),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (daily_route_id, stop_order),
  UNIQUE (daily_route_id, service_request_id),
  FOREIGN KEY (daily_route_id) REFERENCES daily_routes(id) ON DELETE CASCADE,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
) ENGINE=InnoDB;

CREATE TABLE nurse_location_pings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nurse_user_id VARCHAR(36) NOT NULL,
  service_request_id VARCHAR(36),
  location POINT SRID 4326 NOT NULL,
  accuracy_meters DECIMAL(8,2),
  speed_kmh DECIMAL(6,2),
  heading_degrees SMALLINT,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id) ON DELETE SET NULL,
  SPATIAL INDEX idx_nurse_location_pings_location (location)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- RELACIÓN ENFERMERO–PACIENTE, AGENDA, Y BITÁCORA CLÍNICA
-- -----------------------------------------------------------------------------
CREATE TABLE nurse_patient_relationships (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nurse_user_id VARCHAR(36) NOT NULL,
  patient_user_id VARCHAR(36) NOT NULL,
  clinical_status ENUM('estable', 'seguimiento', 'critico') NOT NULL DEFAULT 'estable',
  total_services INTEGER NOT NULL DEFAULT 0,
  last_service_at DATETIME,
  last_service_name VARCHAR(160),
  private_notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE (nurse_user_id, patient_user_id),
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (patient_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE nurse_availability_slots (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nurse_user_id VARCHAR(36) NOT NULL,
  day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6),
  starts_at TIME NOT NULL,
  ends_at TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE clinical_reports (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL UNIQUE,
  nurse_user_id VARCHAR(36) NOT NULL,
  observations TEXT NOT NULL,
  wound_status VARCHAR(80),
  procedures_done TEXT,
  recommendations TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
  FOREIGN KEY (nurse_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE vital_signs_records (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  clinical_report_id VARCHAR(36) NOT NULL,
  blood_pressure_sys SMALLINT,
  blood_pressure_dia SMALLINT,
  heart_rate_bpm SMALLINT,
  temperature_c DECIMAL(4,1),
  glucose_mg_dl DECIMAL(6,1),
  oxygen_saturation DECIMAL(5,2),
  respiratory_rate SMALLINT,
  recorded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clinical_report_id) REFERENCES clinical_reports(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE digital_signatures (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL UNIQUE,
  signed_by_user_id VARCHAR(36) NOT NULL,
  signature_image_url TEXT NOT NULL,
  signed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
  FOREIGN KEY (signed_by_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- FINANZAS Y PAGOS
-- -----------------------------------------------------------------------------
CREATE TABLE payments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL,
  patient_user_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  platform_fee DECIMAL(12,2) NOT NULL DEFAULT 0,
  nurse_net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency_code CHAR(3) NOT NULL DEFAULT 'MXN',
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'pending',
  provider VARCHAR(40) NOT NULL DEFAULT 'stripe',
  provider_payment_id VARCHAR(120),
  provider_payload JSON,
  paid_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
  FOREIGN KEY (patient_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE wallet_transactions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  wallet_id VARCHAR(36) NOT NULL,
  payment_id VARCHAR(36),
  service_request_id VARCHAR(36),
  transaction_type ENUM('service_income', 'platform_commission', 'withdrawal', 'refund', 'adjustment') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  balance_after DECIMAL(12,2) NOT NULL,
  description VARCHAR(255),
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded') NOT NULL DEFAULT 'completed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES nurse_wallets(id),
  FOREIGN KEY (payment_id) REFERENCES payments(id),
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
) ENGINE=InnoDB;

CREATE TABLE nurse_payout_methods (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  nurse_user_id VARCHAR(36) NOT NULL,
  method_type VARCHAR(20) NOT NULL CHECK (method_type IN ('bank_account', 'debit_card')),
  bank_name VARCHAR(80),
  account_last_four CHAR(4),
  clabe_masked VARCHAR(20),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  provider_method_id VARCHAR(120),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (nurse_user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE withdrawal_requests (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  wallet_id VARCHAR(36) NOT NULL,
  payout_method_id VARCHAR(36) NOT NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'pending',
  provider_payout_id VARCHAR(120),
  processed_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES nurse_wallets(id),
  FOREIGN KEY (payout_method_id) REFERENCES nurse_payout_methods(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- COMUNICACIÓN, NOTIFICACIONES Y DISPUTAS
-- -----------------------------------------------------------------------------
CREATE TABLE conversations (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id)
) ENGINE=InnoDB;

CREATE TABLE messages (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  conversation_id VARCHAR(36) NOT NULL,
  sender_id VARCHAR(36) NOT NULL,
  message_type ENUM('text', 'image', 'system') NOT NULL DEFAULT 'text',
  body TEXT,
  attachment_url TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  channel ENUM('push', 'email', 'sms', 'in_app') NOT NULL DEFAULT 'in_app',
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  payload JSON,
  read_at DATETIME,
  sent_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE disputes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  service_request_id VARCHAR(36) NOT NULL,
  opened_by VARCHAR(36) NOT NULL,
  assigned_admin_id VARCHAR(36),
  status ENUM('open', 'under_review', 'resolved_patient', 'resolved_nurse', 'closed') NOT NULL DEFAULT 'open',
  reason TEXT NOT NULL,
  resolution_notes TEXT,
  resolved_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (service_request_id) REFERENCES service_requests(id),
  FOREIGN KEY (opened_by) REFERENCES users(id),
  FOREIGN KEY (assigned_admin_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  actor_user_id VARCHAR(36),
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id VARCHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_user_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- VISTAS 
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_nurse_monthly_earnings AS
SELECT
  nw.nurse_user_id,
  DATE_FORMAT(wt.created_at, '%Y-%m-01') AS month,
  SUM(CASE WHEN wt.transaction_type = 'service_income' AND wt.amount > 0 THEN wt.amount ELSE 0 END) AS ingresos,
  COUNT(DISTINCT CASE WHEN wt.transaction_type = 'service_income' THEN wt.service_request_id ELSE NULL END) AS servicios
FROM nurse_wallets nw
JOIN wallet_transactions wt ON wt.wallet_id = nw.id
GROUP BY nw.nurse_user_id, DATE_FORMAT(wt.created_at, '%Y-%m-01');

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
-- TRIGGERS CLAVE
-- -----------------------------------------------------------------------------
DELIMITER //

-- Trigger: Crear wallet automáticamente al crear un perfil de enfermero
CREATE TRIGGER trg_nurse_profile_wallet
BEFORE INSERT ON nurse_profiles
FOR EACH ROW
BEGIN
  IF NEW.wallet_id IS NULL THEN
    SET @new_wallet_id = (SELECT UUID());
    INSERT INTO nurse_wallets (id, nurse_user_id) VALUES (@new_wallet_id, NEW.user_id);
    SET NEW.wallet_id = @new_wallet_id;
  END IF;
END; //

-- Trigger: Historial de estado de las solicitudes
CREATE TRIGGER trg_service_request_status_history
AFTER UPDATE ON service_requests
FOR EACH ROW
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO service_request_status_history (
      service_request_id, from_status, to_status, change_source
    ) VALUES (NEW.id, OLD.status, NEW.status, 'system');
  END IF;
END; //

-- Trigger: Activar perfil de enfermero tras aprobar KYC (Cédula y Título)
CREATE TRIGGER trg_nurse_kyc_activation
AFTER UPDATE ON nurse_credentials
FOR EACH ROW
BEGIN
  DECLARE approved_count INT;
  IF NEW.review_status = 'approved' AND OLD.review_status != 'approved' THEN
    SELECT COUNT(*) INTO approved_count
    FROM nurse_credentials
    WHERE nurse_user_id = NEW.nurse_user_id AND review_status = 'approved';
    
    IF approved_count >= 2 THEN
      UPDATE users SET status = 'active' WHERE id = NEW.nurse_user_id AND role = 'nurse';
    END IF;
  END IF;
END; //

-- -----------------------------------------------------------------------------
-- PROCEDIMIENTO ALMACENADO PARA FILTRO DE CERCANÍA (RF3)
-- Sustituye a la función find_nurses_within_radius de PostGIS
-- -----------------------------------------------------------------------------
CREATE PROCEDURE sp_find_nurses_within_radius(
  IN p_req_lng DECIMAL(11,8),
  IN p_req_lat DECIMAL(10,8),
  IN p_radius_km DECIMAL(6,2)
)
BEGIN
  DECLARE v_radius_km DECIMAL(6,2);
  DECLARE req_point POINT;

  IF p_radius_km IS NULL THEN
    SELECT coverage_radius_km INTO v_radius_km
    FROM platform_settings WHERE is_active = TRUE LIMIT 1;
  ELSE
    SET v_radius_km = p_radius_km;
  END IF;

  SET req_point = ST_SRID(Point(p_req_lng, p_req_lat), 4326);

  SELECT
    np.user_id,
    ST_Distance_Sphere(req_point, nlp.location) AS distance_meters
  FROM nurse_profiles np
  JOIN users u ON u.id = np.user_id
  JOIN (
    SELECT nurse_user_id, location
    FROM nurse_location_pings
    WHERE (nurse_user_id, recorded_at) IN (
        SELECT nurse_user_id, MAX(recorded_at)
        FROM nurse_location_pings
        GROUP BY nurse_user_id
    )
  ) nlp ON nlp.nurse_user_id = np.user_id
  WHERE u.role = 'nurse'
    AND u.status = 'active'
    AND np.is_available = TRUE
    AND u.deleted_at IS NULL
    AND ST_Distance_Sphere(req_point, nlp.location) <= (v_radius_km * 1000);
END //
DELIMITER ;