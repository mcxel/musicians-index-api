# BerntoutGlobal XXL - API Environment Variables Template
# Copy this file to .env.local and fill in your values
# NEVER commit .env.local to version control

# =============================================================================
# DATABASE
# =============================================================================
# PostgreSQL connection string
DATABASE_URL=postgresql://user:password@localhost:5432/berntout

# =============================================================================
# AUTH & SECURITY
# =============================================================================
JWT_SECRET=your-jwt-secret-key-here
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# =============================================================================
# STRIPE PAYMENTS
# =============================================================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# =============================================================================
# RUNTIME STATUS
# =============================================================================
RUNTIME_STATUS_BASE_URL=http://localhost:8000

# =============================================================================
# EMAIL (optional)
# =============================================================================
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email-user
EMAIL_PASSWORD=your-email-password
EMAIL_FROM=noreply@berntoutglobal.com

# =============================================================================
# ADMIN ACCOUNTS
# =============================================================================
# Comma-separated list of admin email addresses
ADMIN_EMAILS=admin@berntoutglobal.com

# =============================================================================
# OFFICIAL LINKS RESTRICTION
# =============================================================================
# Only these users can submit official music platform links
# Format: user_id1,user_id2,user_id3
OFFICIAL_LINK_ADMINS=marcel,micah,jpaul
