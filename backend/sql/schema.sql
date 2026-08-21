-- Home Services Marketplace
-- PostgreSQL database schema
-- Source of truth: finalized marketplace schema

BEGIN;

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'professional', 'admin');
CREATE TYPE verification_status AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payment_status AS ENUM ('pending', 'paid_cash', 'paid_online', 'partially_paid', 'refunded', 'failed');
CREATE TYPE request_status AS ENUM ('open', 'offer_received', 'accepted', 'in_progress', 'completed', 'cancelled');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'withdrawn');
CREATE TYPE job_status AS ENUM ('scheduled', 'on_the_way', 'arrived', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE call_status AS ENUM ('initiated', 'ringing', 'answered', 'missed', 'rejected', 'ended', 'failed');
CREATE TYPE job_event_type AS ENUM ('scheduled', 'worker_assigned', 'worker_on_the_way', 'worker_arrived', 'customer_confirmed_arrival', 'customer_reported_no_show', 'job_started', 'job_completed', 'job_cancelled', 'worker_reassigned', 'additional_work_requested', 'additional_work_approved', 'additional_work_rejected');
CREATE TYPE location_type AS ENUM ('shop', 'branch');
CREATE TYPE reviewee_type AS ENUM ('customer', 'professional');
CREATE TYPE service_question_type AS ENUM ('text', 'single_choice', 'multiple_choice', 'number', 'boolean');
CREATE TYPE pricing_model AS ENUM ('professional_offer', 'fixed_range', 'inspection_required');
CREATE TYPE additional_work_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE cancellation_actor AS ENUM ('customer', 'professional', 'admin');
CREATE TYPE support_status AS ENUM ('open', 'in_progress', 'waiting_for_user', 'resolved', 'closed');
CREATE TYPE support_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE support_type AS ENUM ('general', 'job', 'pricing', 'cancellation', 'professional_behavior', 'safety', 'payment', 'account', 'reward', 'other');
CREATE TYPE reward_type AS ENUM ('points', 'voucher');
CREATE TYPE reward_transaction_type AS ENUM ('earned', 'redeemed', 'expired', 'adjusted', 'refunded');
CREATE TYPE voucher_status AS ENUM ('active', 'used', 'expired', 'cancelled');
CREATE TYPE notification_type AS ENUM ('offer_received', 'offer_accepted', 'worker_assigned', 'worker_on_the_way', 'worker_arrived', 'job_started', 'job_completed', 'job_cancelled', 'price_change_requested', 'support_update', 'verification_update', 'reward_received', 'general', 'incoming_call', 'missed_call');
CREATE TYPE admin_action_type AS ENUM ('create', 'update', 'delete', 'verify', 'reject', 'suspend', 'restore', 'assign', 'other');

-- ============================================================
-- CORE USERS / PROFILES / LOCATIONS
-- ============================================================

CREATE TABLE users (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE areas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_profiles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    default_area_id INTEGER REFERENCES areas(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE professional_profiles (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
    business_name VARCHAR(100),
    description TEXT,
    experience_years INTEGER,
    default_area_id INTEGER REFERENCES areas(id),
    verification_status verification_status NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT professional_experience_nonnegative CHECK (experience_years IS NULL OR experience_years >= 0)
);

CREATE TABLE addresses (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id),
    area_id INTEGER NOT NULL REFERENCES areas(id),
    label VARCHAR(50) NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE professional_locations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES professional_profiles(id),
    area_id INTEGER NOT NULL REFERENCES areas(id),
    name VARCHAR(100) NOT NULL,
    location_type location_type NOT NULL,
    address_line VARCHAR(255) NOT NULL,
    landmark VARCHAR(255),
    phone VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SERVICE CATALOGUE
-- ============================================================

CREATE TABLE service_categories (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES service_categories(id),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE problem_types (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_id INTEGER NOT NULL REFERENCES services(id),
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_questions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    problem_type_id INTEGER NOT NULL REFERENCES problem_types(id),
    question VARCHAR(255) NOT NULL,
    question_type service_question_type NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_question_options (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES service_questions(id),
    option_text VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE professional_services (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES professional_profiles(id),
    service_id INTEGER NOT NULL REFERENCES services(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT professional_services_unique UNIQUE (professional_id, service_id)
);

CREATE TABLE professional_service_areas (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES professional_profiles(id),
    area_id INTEGER NOT NULL REFERENCES areas(id),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT professional_service_areas_unique UNIQUE (professional_id, area_id)
);

-- ============================================================
-- PROFESSIONAL TEAMS
-- ============================================================

CREATE TABLE team_members (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES professional_profiles(id),
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    cnic_number VARCHAR(30) NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    cnic_document_url VARCHAR(500),
    verification_status verification_status NOT NULL DEFAULT 'pending',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE team_member_locations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_member_id INTEGER NOT NULL REFERENCES team_members(id),
    professional_location_id INTEGER NOT NULL REFERENCES professional_locations(id),
    CONSTRAINT team_member_locations_unique UNIQUE (team_member_id, professional_location_id)
);

-- ============================================================
-- SERVICE REQUESTS
-- ============================================================

CREATE TABLE service_requests (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id),
    problem_type_id INTEGER NOT NULL REFERENCES problem_types(id),
    address_id INTEGER NOT NULL REFERENCES addresses(id),
    description TEXT,
    preferred_date TIMESTAMP,
    preferred_time_start TIMESTAMP,
    preferred_time_end TIMESTAMP,
    status request_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_request_answers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES service_questions(id),
    answer_text TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT service_request_answers_unique UNIQUE (service_request_id, question_id)
);

CREATE TABLE service_request_answer_options (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    answer_id INTEGER NOT NULL REFERENCES service_request_answers(id) ON DELETE CASCADE,
    option_id INTEGER NOT NULL REFERENCES service_question_options(id),
    CONSTRAINT service_request_answer_options_unique UNIQUE (answer_id, option_id)
);

CREATE TABLE service_request_media (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_request_id INTEGER NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- PRICING / OFFERS
-- ============================================================

CREATE TABLE pricing_rules (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    problem_type_id INTEGER NOT NULL REFERENCES problem_types(id),
    pricing_model pricing_model NOT NULL,
    minimum_price DECIMAL(10,2),
    maximum_price DECIMAL(10,2),
    suggested_price DECIMAL(10,2),
    effective_from TIMESTAMP NOT NULL,
    effective_to TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pricing_rule_amounts_nonnegative CHECK (
        (minimum_price IS NULL OR minimum_price >= 0) AND
        (maximum_price IS NULL OR maximum_price >= 0) AND
        (suggested_price IS NULL OR suggested_price >= 0)
    ),
    CONSTRAINT pricing_rule_range_valid CHECK (
        minimum_price IS NULL OR maximum_price IS NULL OR minimum_price <= maximum_price
    )
);

CREATE TABLE offers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_request_id INTEGER NOT NULL REFERENCES service_requests(id),
    professional_id INTEGER NOT NULL REFERENCES professional_profiles(id),
    pricing_rule_id INTEGER REFERENCES pricing_rules(id),
    price DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    material_details TEXT,
    estimated_arrival TIMESTAMP,
    status offer_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT offer_price_nonnegative CHECK (price >= 0),
    CONSTRAINT offers_professional_request_unique UNIQUE (service_request_id, professional_id)
);

-- ============================================================
-- JOBS / PAYMENTS / OPERATIONS
-- ============================================================

CREATE TABLE jobs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    service_request_id INTEGER NOT NULL UNIQUE REFERENCES service_requests(id),
    offer_id INTEGER NOT NULL UNIQUE REFERENCES offers(id),
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id),
    professional_id INTEGER NOT NULL REFERENCES professional_profiles(id),
    status job_status NOT NULL DEFAULT 'scheduled',
    scheduled_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INTEGER NOT NULL UNIQUE REFERENCES jobs(id),
    base_amount DECIMAL(10,2) NOT NULL,
    additional_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_customer_amount DECIMAL(10,2) NOT NULL,
    professional_payout_amount DECIMAL(10,2) NOT NULL,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoice_amounts_nonnegative CHECK (
        base_amount >= 0 AND additional_amount >= 0 AND discount_amount >= 0 AND
        platform_fee >= 0 AND total_customer_amount >= 0 AND professional_payout_amount >= 0
    )
);

CREATE TABLE job_assignments (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    team_member_id INTEGER NOT NULL REFERENCES team_members(id),
    assigned_by_user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    unassigned_at TIMESTAMP,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_events (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    event_type job_event_type NOT NULL,
    actor_user_id INTEGER REFERENCES users(id),
    team_member_id INTEGER REFERENCES team_members(id),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE job_media (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    media_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    uploaded_by_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE additional_work_requests (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    professional_id INTEGER NOT NULL REFERENCES professional_profiles(id),
    requested_by_team_member_id INTEGER REFERENCES team_members(id),
    description TEXT NOT NULL,
    material_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    labor_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    additional_amount DECIMAL(10,2) NOT NULL,
    status additional_work_status NOT NULL DEFAULT 'pending',
    customer_response_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT additional_work_costs_nonnegative CHECK (
        material_cost >= 0 AND labor_cost >= 0 AND additional_amount >= 0
    )
);

CREATE TABLE job_cancellations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    cancelled_by_user_id INTEGER NOT NULL REFERENCES users(id),
    actor_type cancellation_actor NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COMMUNICATION
-- ============================================================

CREATE TABLE conversations (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INTEGER NOT NULL UNIQUE REFERENCES jobs(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calls (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id),
    caller_id INTEGER NOT NULL REFERENCES users(id),
    receiver_id INTEGER NOT NULL REFERENCES users(id),
    status call_status NOT NULL DEFAULT 'initiated',
    started_at TIMESTAMP,
    answered_at TIMESTAMP,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT call_duration_nonnegative CHECK (duration_seconds IS NULL OR duration_seconds >= 0)
);

-- ============================================================
-- REVIEWS / REPUTATION
-- ============================================================

CREATE TABLE reviews (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    reviewer_id INTEGER NOT NULL REFERENCES users(id),
    reviewee_id INTEGER NOT NULL REFERENCES users(id),
    team_member_id INTEGER REFERENCES team_members(id),
    overall_rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT review_rating_range CHECK (overall_rating BETWEEN 1 AND 5),
    CONSTRAINT review_reviewer_reviewee_different CHECK (reviewer_id <> reviewee_id),
    CONSTRAINT reviews_one_per_reviewer_per_job UNIQUE (job_id, reviewer_id, reviewee_id)
);

CREATE TABLE review_criteria (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    applies_to reviewee_type NOT NULL
);

CREATE TABLE review_scores (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    criterion_id INTEGER NOT NULL REFERENCES review_criteria(id),
    score INTEGER NOT NULL,
    CONSTRAINT review_score_range CHECK (score BETWEEN 1 AND 5),
    CONSTRAINT review_scores_unique UNIQUE (review_id, criterion_id)
);

-- ============================================================
-- VERIFICATION
-- ============================================================

CREATE TABLE professional_verifications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES professional_profiles(id),
    document_type VARCHAR(100) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    status verification_status NOT NULL DEFAULT 'pending',
    verified_by_user_id INTEGER REFERENCES users(id),
    verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- NOTIFICATIONS / SUPPORT
-- ============================================================

CREATE TABLE notifications (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_job_id INTEGER REFERENCES jobs(id),
    related_request_id INTEGER REFERENCES service_requests(id),
    related_offer_id INTEGER REFERENCES offers(id),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_tickets (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_by_user_id INTEGER NOT NULL REFERENCES users(id),
    customer_id INTEGER REFERENCES customer_profiles(id),
    professional_id INTEGER REFERENCES professional_profiles(id),
    job_id INTEGER REFERENCES jobs(id),
    request_id INTEGER REFERENCES service_requests(id),
    type support_type NOT NULL,
    priority support_priority NOT NULL DEFAULT 'normal',
    status support_status NOT NULL DEFAULT 'open',
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_admin_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE support_messages (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id INTEGER NOT NULL REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_teams (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE support_team_members (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES support_teams(id) ON DELETE CASCADE,
    admin_user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT support_team_members_unique UNIQUE (team_id, admin_user_id)
);

-- ============================================================
-- REWARDS / VOUCHERS
-- ============================================================

CREATE TABLE customer_rewards (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INTEGER NOT NULL UNIQUE REFERENCES customer_profiles(id),
    points_balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_rewards_points_nonnegative CHECK (points_balance >= 0)
);

CREATE TABLE reward_transactions (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id),
    type reward_transaction_type NOT NULL,
    points INTEGER NOT NULL,
    description VARCHAR(255) NOT NULL,
    related_job_id INTEGER REFERENCES jobs(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vouchers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    discount_amount DECIMAL(10,2),
    discount_percentage DECIMAL(5,2),
    minimum_job_amount DECIMAL(10,2),
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT voucher_discount_amount_nonnegative CHECK (discount_amount IS NULL OR discount_amount >= 0),
    CONSTRAINT voucher_discount_percentage_valid CHECK (discount_percentage IS NULL OR discount_percentage BETWEEN 0 AND 100),
    CONSTRAINT voucher_minimum_amount_nonnegative CHECK (minimum_job_amount IS NULL OR minimum_job_amount >= 0),
    CONSTRAINT voucher_dates_valid CHECK (valid_until > valid_from),
    CONSTRAINT voucher_has_discount CHECK (discount_amount IS NOT NULL OR discount_percentage IS NOT NULL)
);

CREATE TABLE customer_vouchers (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customer_profiles(id),
    voucher_id INTEGER NOT NULL REFERENCES vouchers(id),
    status voucher_status NOT NULL DEFAULT 'active',
    used_on_job_id INTEGER REFERENCES jobs(id),
    issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,
    expires_at TIMESTAMP
);

-- ============================================================
-- ADMIN AUDIT
-- ============================================================

CREATE TABLE admin_audit_logs (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_user_id INTEGER NOT NULL REFERENCES users(id),
    action_type admin_action_type NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_customer_profiles_default_area ON customer_profiles(default_area_id);
CREATE INDEX idx_professional_profiles_default_area ON professional_profiles(default_area_id);
CREATE INDEX idx_addresses_customer ON addresses(customer_id);
CREATE INDEX idx_addresses_area ON addresses(area_id);
CREATE INDEX idx_professional_locations_professional ON professional_locations(professional_id);
CREATE INDEX idx_professional_locations_area ON professional_locations(area_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_problem_types_service ON problem_types(service_id);
CREATE INDEX idx_service_questions_problem_type ON service_questions(problem_type_id);
CREATE INDEX idx_professional_services_service ON professional_services(service_id);
CREATE INDEX idx_professional_service_areas_area ON professional_service_areas(area_id);
CREATE INDEX idx_team_members_professional ON team_members(professional_id);
CREATE INDEX idx_service_requests_customer ON service_requests(customer_id);
CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_problem_type ON service_requests(problem_type_id);
CREATE INDEX idx_offers_request ON offers(service_request_id);
CREATE INDEX idx_offers_professional ON offers(professional_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_professional ON jobs(professional_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_job_assignments_job ON job_assignments(job_id);
CREATE INDEX idx_job_assignments_team_member ON job_assignments(team_member_id);
CREATE INDEX idx_job_events_job ON job_events(job_id);
CREATE INDEX idx_job_media_job ON job_media(job_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_calls_conversation ON calls(conversation_id);
CREATE INDEX idx_reviews_job ON reviews(job_id);
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX idx_professional_verifications_professional ON professional_verifications(professional_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_admin ON support_tickets(assigned_admin_id);
CREATE INDEX idx_reward_transactions_customer ON reward_transactions(customer_id);
CREATE INDEX idx_customer_vouchers_customer ON customer_vouchers(customer_id);
CREATE INDEX idx_admin_audit_logs_admin ON admin_audit_logs(admin_user_id);
CREATE INDEX idx_admin_audit_logs_entity ON admin_audit_logs(entity_type, entity_id);

COMMIT;

-- ============================================================
-- END OF SCHEMA
-- ============================================================