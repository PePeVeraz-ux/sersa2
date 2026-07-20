-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('patient', 'nurse', 'admin');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending_verification', 'active', 'suspended', 'rejected');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('professional_license', 'degree_title');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "AddressLabel" AS ENUM ('home', 'work', 'other');

-- CreateEnum
CREATE TYPE "PricingModifierType" AS ENUM ('night_hours', 'weekend', 'holiday', 'zone_surge');

-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('immediate', 'scheduled');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('draft', 'published', 'accepted', 'en_camino', 'arrived', 'in_progress', 'completed', 'cancelled', 'disputed');

-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('prescription', 'lab_result', 'clinical_photo', 'other');

-- CreateEnum
CREATE TYPE "StopStatus" AS ENUM ('pending', 'en_camino', 'arrived', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "ClinicalStatus" AS ENUM ('estable', 'seguimiento', 'critico');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('service_income', 'platform_commission', 'withdrawal', 'refund', 'adjustment');

-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'image', 'system');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('push', 'email', 'sms', 'in_app');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'under_review', 'resolved_patient', 'resolved_nurse', 'closed');

-- CreateTable
CREATE TABLE "platform_settings" (
    "id" VARCHAR(36) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "coverage_radius_km" DECIMAL(6,2) NOT NULL DEFAULT 15.00,
    "platform_commission_pct" DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'MXN',
    "pilot_city" VARCHAR(120) NOT NULL DEFAULT 'Ciudad de México',
    "pilot_state" VARCHAR(80),
    "pilot_country" CHAR(2) NOT NULL DEFAULT 'MX',
    "pilot_area" geometry(Polygon,4326),
    "min_app_version" VARCHAR(20),
    "support_email" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_zones" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "city" VARCHAR(120) NOT NULL,
    "state" VARCHAR(80),
    "country_code" CHAR(2) NOT NULL DEFAULT 'MX',
    "boundary" geometry(Polygon,4326) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'pending_verification',
    "phone" VARCHAR(20),
    "phone_verified_at" TIMESTAMP(3),
    "email_verified_at" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "profile_photo_url" TEXT,
    "preferred_locale" VARCHAR(10) NOT NULL DEFAULT 'es-MX',
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_profiles" (
    "user_id" VARCHAR(36) NOT NULL,
    "first_name" VARCHAR(80) NOT NULL,
    "last_name" VARCHAR(80) NOT NULL,
    "second_last_name" VARCHAR(80),
    "date_of_birth" DATE,
    "gender" VARCHAR(30),
    "emergency_contact_name" VARCHAR(160),
    "emergency_contact_phone" VARCHAR(20),
    "medical_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "nurse_wallets" (
    "id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "pending_balance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'MXN',
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurse_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_profiles" (
    "user_id" VARCHAR(36) NOT NULL,
    "first_name" VARCHAR(80) NOT NULL,
    "last_name" VARCHAR(80) NOT NULL,
    "second_last_name" VARCHAR(80),
    "professional_license" VARCHAR(40) NOT NULL,
    "license_state" VARCHAR(80),
    "bio" TEXT,
    "years_experience" SMALLINT,
    "is_available" BOOLEAN NOT NULL DEFAULT false,
    "average_rating" DECIMAL(3,2) DEFAULT 0,
    "total_services" INTEGER NOT NULL DEFAULT 0,
    "wallet_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurse_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "user_id" VARCHAR(36) NOT NULL,
    "first_name" VARCHAR(80) NOT NULL,
    "last_name" VARCHAR(80) NOT NULL,
    "department" VARCHAR(80),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "nurse_credentials" (
    "id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "document_type" "DocumentType" NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_hash" VARCHAR(64),
    "issued_at" DATE,
    "expires_at" DATE,
    "review_status" "ReviewStatus" NOT NULL DEFAULT 'pending',
    "reviewed_by" VARCHAR(36),
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nurse_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_credential_reviews" (
    "id" VARCHAR(36) NOT NULL,
    "credential_id" VARCHAR(36) NOT NULL,
    "reviewer_id" VARCHAR(36) NOT NULL,
    "previous_status" "ReviewStatus" NOT NULL,
    "new_status" "ReviewStatus" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nurse_credential_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "label" "AddressLabel" NOT NULL DEFAULT 'home',
    "custom_label" VARCHAR(60),
    "street_line1" VARCHAR(200) NOT NULL,
    "street_line2" VARCHAR(120),
    "neighborhood" VARCHAR(120),
    "city" VARCHAR(120) NOT NULL,
    "state" VARCHAR(80),
    "postal_code" VARCHAR(12) NOT NULL,
    "country_code" CHAR(2) NOT NULL DEFAULT 'MX',
    "references_text" TEXT,
    "location" geometry(Point,4326) NOT NULL,
    "operational_zone_id" VARCHAR(36),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "description" TEXT,
    "sort_order" SMALLINT NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" VARCHAR(36) NOT NULL,
    "category_id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(160) NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "description" TEXT NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "estimated_duration_min" SMALLINT NOT NULL DEFAULT 30,
    "icon_key" VARCHAR(40),
    "requires_prescription" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_pricing_rules" (
    "id" VARCHAR(36) NOT NULL,
    "service_id" VARCHAR(36),
    "modifier_type" "PricingModifierType" NOT NULL,
    "multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    "fixed_surcharge" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "starts_at_time" TIME,
    "ends_at_time" TIME,
    "applies_on_date" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" VARCHAR(36) NOT NULL,
    "patient_user_id" VARCHAR(36) NOT NULL,
    "assigned_nurse_id" VARCHAR(36),
    "address_id" VARCHAR(36) NOT NULL,
    "operational_zone_id" VARCHAR(36),
    "request_type" "RequestType" NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'draft',
    "scheduled_start_at" TIMESTAMP(3),
    "scheduled_end_at" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "patient_notes" TEXT,
    "subtotal_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "surcharge_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'MXN',
    "service_location" geometry(Point,4326),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_request_items" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "service_id" VARCHAR(36) NOT NULL,
    "quantity" SMALLINT NOT NULL DEFAULT 1,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "line_total" DECIMAL(12,2) NOT NULL,
    "pricing_rule_id" VARCHAR(36),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_request_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_request_attachments" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "uploaded_by" VARCHAR(36) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" VARCHAR(100),
    "file_size_bytes" BIGINT,
    "attachment_type" "AttachmentType" NOT NULL DEFAULT 'prescription',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_request_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_request_status_history" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "from_status" VARCHAR(50),
    "to_status" VARCHAR(50) NOT NULL,
    "changed_by" VARCHAR(36),
    "change_source" VARCHAR(40) DEFAULT 'system',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_request_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_request_visibility" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "distance_meters" DECIMAL(10,2),
    "notified_at" TIMESTAMP(3),
    "viewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_request_visibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_routes" (
    "id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "route_date" DATE NOT NULL,
    "total_distance_km" DECIMAL(8,2),
    "total_earnings" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_stops" (
    "id" VARCHAR(36) NOT NULL,
    "daily_route_id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "stop_order" SMALLINT NOT NULL,
    "status" "StopStatus" NOT NULL DEFAULT 'pending',
    "planned_arrival_at" TIMESTAMP(3),
    "actual_arrival_at" TIMESTAMP(3),
    "distance_km" DECIMAL(8,2),
    "eta_minutes" SMALLINT,
    "price_amount" DECIMAL(12,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "route_stops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_location_pings" (
    "id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36),
    "location" geometry(Point,4326) NOT NULL,
    "accuracy_meters" DECIMAL(8,2),
    "speed_kmh" DECIMAL(6,2),
    "heading_degrees" SMALLINT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nurse_location_pings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_patient_relationships" (
    "id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "patient_user_id" VARCHAR(36) NOT NULL,
    "clinical_status" "ClinicalStatus" NOT NULL DEFAULT 'estable',
    "total_services" INTEGER NOT NULL DEFAULT 0,
    "last_service_at" TIMESTAMP(3),
    "last_service_name" VARCHAR(160),
    "private_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nurse_patient_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_availability_slots" (
    "id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "day_of_week" SMALLINT,
    "starts_at" TIME NOT NULL,
    "ends_at" TIME NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nurse_availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_reports" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "observations" TEXT NOT NULL,
    "wound_status" VARCHAR(80),
    "procedures_done" TEXT,
    "recommendations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clinical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vital_signs_records" (
    "id" VARCHAR(36) NOT NULL,
    "clinical_report_id" VARCHAR(36) NOT NULL,
    "blood_pressure_sys" SMALLINT,
    "blood_pressure_dia" SMALLINT,
    "heart_rate_bpm" SMALLINT,
    "temperature_c" DECIMAL(4,1),
    "glucose_mg_dl" DECIMAL(6,1),
    "oxygen_saturation" DECIMAL(5,2),
    "respiratory_rate" SMALLINT,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vital_signs_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "digital_signatures" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "signed_by_user_id" VARCHAR(36) NOT NULL,
    "signature_image_url" TEXT NOT NULL,
    "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,

    CONSTRAINT "digital_signatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "patient_user_id" VARCHAR(36) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "platform_fee" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "nurse_net_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency_code" CHAR(3) NOT NULL DEFAULT 'MXN',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "provider" VARCHAR(40) NOT NULL DEFAULT 'stripe',
    "provider_payment_id" VARCHAR(120),
    "provider_payload" JSONB,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" VARCHAR(36) NOT NULL,
    "wallet_id" VARCHAR(36) NOT NULL,
    "payment_id" VARCHAR(36),
    "service_request_id" VARCHAR(36),
    "transaction_type" "TransactionType" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "balance_after" DECIMAL(12,2) NOT NULL,
    "description" VARCHAR(255),
    "status" "PaymentStatus" NOT NULL DEFAULT 'completed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nurse_payout_methods" (
    "id" VARCHAR(36) NOT NULL,
    "nurse_user_id" VARCHAR(36) NOT NULL,
    "method_type" VARCHAR(20) NOT NULL,
    "bank_name" VARCHAR(80),
    "account_last_four" CHAR(4),
    "clabe_masked" VARCHAR(20),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "provider_method_id" VARCHAR(120),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "nurse_payout_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "withdrawal_requests" (
    "id" VARCHAR(36) NOT NULL,
    "wallet_id" VARCHAR(36) NOT NULL,
    "payout_method_id" VARCHAR(36) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'pending',
    "provider_payout_id" VARCHAR(120),
    "processed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "withdrawal_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" VARCHAR(36) NOT NULL,
    "conversation_id" VARCHAR(36) NOT NULL,
    "sender_id" VARCHAR(36) NOT NULL,
    "message_type" "MessageType" NOT NULL DEFAULT 'text',
    "body" TEXT,
    "attachment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'in_app',
    "title" VARCHAR(200) NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" VARCHAR(36) NOT NULL,
    "service_request_id" VARCHAR(36) NOT NULL,
    "opened_by" VARCHAR(36) NOT NULL,
    "assigned_admin_id" VARCHAR(36),
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "reason" TEXT NOT NULL,
    "resolution_notes" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" VARCHAR(36) NOT NULL,
    "actor_user_id" VARCHAR(36),
    "action" VARCHAR(80) NOT NULL,
    "entity_type" VARCHAR(60) NOT NULL,
    "entity_id" VARCHAR(36),
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "operational_zones_name_city_state_key" ON "operational_zones"("name", "city", "state");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_status_deleted_at_idx" ON "users"("role", "status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_wallets_nurse_user_id_key" ON "nurse_wallets"("nurse_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_profiles_wallet_id_key" ON "nurse_profiles"("wallet_id");

-- CreateIndex
CREATE INDEX "nurse_credentials_review_status_idx" ON "nurse_credentials"("review_status");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_credentials_nurse_user_id_document_type_key" ON "nurse_credentials"("nurse_user_id", "document_type");

-- CreateIndex
CREATE INDEX "addresses_user_id_deleted_at_idx" ON "addresses"("user_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_name_key" ON "service_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_slug_key" ON "service_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "service_requests_patient_user_id_created_at_idx" ON "service_requests"("patient_user_id", "created_at");

-- CreateIndex
CREATE INDEX "service_requests_status_idx" ON "service_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "service_request_items_service_request_id_service_id_key" ON "service_request_items"("service_request_id", "service_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_request_visibility_service_request_id_nurse_user_id_key" ON "service_request_visibility"("service_request_id", "nurse_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "daily_routes_nurse_user_id_route_date_key" ON "daily_routes"("nurse_user_id", "route_date");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_daily_route_id_stop_order_key" ON "route_stops"("daily_route_id", "stop_order");

-- CreateIndex
CREATE UNIQUE INDEX "route_stops_daily_route_id_service_request_id_key" ON "route_stops"("daily_route_id", "service_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "nurse_patient_relationships_nurse_user_id_patient_user_id_key" ON "nurse_patient_relationships"("nurse_user_id", "patient_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_reports_service_request_id_key" ON "clinical_reports"("service_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "digital_signatures_service_request_id_key" ON "digital_signatures"("service_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_service_request_id_key" ON "conversations"("service_request_id");

-- AddForeignKey
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_wallets" ADD CONSTRAINT "nurse_wallets_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_profiles" ADD CONSTRAINT "nurse_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_profiles" ADD CONSTRAINT "nurse_profiles_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "nurse_wallets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_credentials" ADD CONSTRAINT "nurse_credentials_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_credential_reviews" ADD CONSTRAINT "nurse_credential_reviews_credential_id_fkey" FOREIGN KEY ("credential_id") REFERENCES "nurse_credentials"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_credential_reviews" ADD CONSTRAINT "nurse_credential_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_operational_zone_id_fkey" FOREIGN KEY ("operational_zone_id") REFERENCES "operational_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_pricing_rules" ADD CONSTRAINT "service_pricing_rules_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_patient_user_id_fkey" FOREIGN KEY ("patient_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_assigned_nurse_id_fkey" FOREIGN KEY ("assigned_nurse_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_operational_zone_id_fkey" FOREIGN KEY ("operational_zone_id") REFERENCES "operational_zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_items" ADD CONSTRAINT "service_request_items_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_items" ADD CONSTRAINT "service_request_items_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_items" ADD CONSTRAINT "service_request_items_pricing_rule_id_fkey" FOREIGN KEY ("pricing_rule_id") REFERENCES "service_pricing_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_attachments" ADD CONSTRAINT "service_request_attachments_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_attachments" ADD CONSTRAINT "service_request_attachments_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_status_history" ADD CONSTRAINT "service_request_status_history_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_status_history" ADD CONSTRAINT "service_request_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_visibility" ADD CONSTRAINT "service_request_visibility_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_request_visibility" ADD CONSTRAINT "service_request_visibility_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_routes" ADD CONSTRAINT "daily_routes_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_daily_route_id_fkey" FOREIGN KEY ("daily_route_id") REFERENCES "daily_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_stops" ADD CONSTRAINT "route_stops_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_location_pings" ADD CONSTRAINT "nurse_location_pings_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_location_pings" ADD CONSTRAINT "nurse_location_pings_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_patient_relationships" ADD CONSTRAINT "nurse_patient_relationships_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_patient_relationships" ADD CONSTRAINT "nurse_patient_relationships_patient_user_id_fkey" FOREIGN KEY ("patient_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_availability_slots" ADD CONSTRAINT "nurse_availability_slots_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_reports" ADD CONSTRAINT "clinical_reports_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_reports" ADD CONSTRAINT "clinical_reports_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs_records" ADD CONSTRAINT "vital_signs_records_clinical_report_id_fkey" FOREIGN KEY ("clinical_report_id") REFERENCES "clinical_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "digital_signatures" ADD CONSTRAINT "digital_signatures_signed_by_user_id_fkey" FOREIGN KEY ("signed_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_patient_user_id_fkey" FOREIGN KEY ("patient_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "nurse_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nurse_payout_methods" ADD CONSTRAINT "nurse_payout_methods_nurse_user_id_fkey" FOREIGN KEY ("nurse_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "nurse_wallets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "withdrawal_requests" ADD CONSTRAINT "withdrawal_requests_payout_method_id_fkey" FOREIGN KEY ("payout_method_id") REFERENCES "nurse_payout_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_service_request_id_fkey" FOREIGN KEY ("service_request_id") REFERENCES "service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_assigned_admin_id_fkey" FOREIGN KEY ("assigned_admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
