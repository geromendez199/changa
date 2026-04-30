#!/bin/bash

# Changa Supabase Secrets Configuration Helper
# This script guides you through setting up STRIPE_SECRET_KEY and SENDGRID_API_KEY

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Changa Supabase Secrets Configuration Helper              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install supabase/tap/supabase
    else
        npm i -g supabase
    fi
fi

echo "🔑 Supabase Secrets Configuration"
echo ""

# Get the project ref
PROJECT_REF="${1:-}"
if [ -z "$PROJECT_REF" ]; then
    echo "Enter your Supabase Project Reference (from project settings):"
    read -p "> " PROJECT_REF
fi

echo ""
echo "📋 You need to configure these secrets:"
echo "   1. STRIPE_SECRET_KEY (from https://dashboard.stripe.com/apikeys)"
echo "   2. SENDGRID_API_KEY (from https://app.sendgrid.com/settings/api_keys)"
echo ""

# Get Stripe Secret Key
echo "Enter STRIPE_SECRET_KEY (starts with 'sk_'):"
read -s -p "> " STRIPE_SECRET_KEY
echo ""

# Get SendGrid API Key
echo "Enter SENDGRID_API_KEY (starts with 'SG.'):"
read -s -p "> " SENDGRID_API_KEY
echo ""

# Confirm values (masked)
echo "Configuration summary:"
echo "  Project: $PROJECT_REF"
echo "  Stripe Secret: ${STRIPE_SECRET_KEY:0:10}...${STRIPE_SECRET_KEY: -4}"
echo "  SendGrid Key: ${SENDGRID_API_KEY:0:10}...${SENDGRID_API_KEY: -4}"
echo ""

read -p "Proceed with setting these secrets? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Setting secrets in Supabase project $PROJECT_REF..."
    
    # Use Supabase CLI to set secrets
    supabase secrets set \
        --project-ref "$PROJECT_REF" \
        STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" \
        SENDGRID_API_KEY="$SENDGRID_API_KEY"
    
    echo "✅ Secrets configured successfully!"
    echo ""
    echo "Your Edge Functions can now access:"
    echo "  - STRIPE_SECRET_KEY for payment processing"
    echo "  - SENDGRID_API_KEY for sending emails"
    echo ""
    echo "🎉 All set! Your backend is ready."
else
    echo "❌ Cancelled."
fi
