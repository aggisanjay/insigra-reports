# Shopify Webhook Automation — Architecture & Flow (Bonus)

This document provides a concise, production-ready blueprint for automatically granting customer/company access following a successful Shopify payment.

---

### Five-Step Production Workflow:

1. **Webhook Ingestion**: Configure a Shopify `orders/paid` webhook targeting a secure Next.js API route (`/api/webhooks/shopify`).
2. **HMAC Signature Verification**: Compute the SHA-256 HMAC of the raw request payload using your `SHOPIFY_WEBHOOK_SECRET` and compare it with the `X-Shopify-Hmac-Sha256` header using `crypto.timingSafeEqual()` to reject spoofed requests.
3. **Idempotency Enforcement**: Store the Shopify Order ID and Webhook ID in an `idempotency_keys` table with a unique constraint, returning HTTP 200 immediately if the event has already been processed to safely handle Shopify's automated retries.
4. **Trusted Server-Side Provisioning**: Extract the customer's email and purchased plan SKU, provision their Supabase Auth account (or retrieve their existing UUID), and insert or activate their tenant entry in `public.profiles` using a secure backend service role.
5. **Lifecycle Management & Audit Logging**: Listen to `refunds/create` or `subscriptions/cancelled` webhooks to revoke or downgrade tenant access, record immutable state transitions in an `audit_logs` table, and emit alerting metrics if provisioning fails.
