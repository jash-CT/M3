# Fintech Backend

Production-ready fintech backend with **KYC/AML**, **payment orchestration**, **card issuing**, **fraud detection**, **reconciliation**, and **partner API gateways** for banks and processors.

## Stack

- **Runtime:** Node.js 18+
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL (TypeORM)
- **Cache/Queue:** Redis (ioredis)
- **API:** REST, OpenAPI (Swagger)
- **Auth:** JWT, API keys for partners

## Features

| Module | Description |
|--------|-------------|
| **KYC/AML** | Customer tiers, identity/address verification, AML checks (sanctions, PEP, adverse media), workflow state |
| **Payments** | Idempotent payment creation, routing by type/currency, multi-processor adapter pattern, KYC/AML + fraud gates |
| **Cards** | Virtual/physical card issuing, programs, status lifecycle (pending → active → frozen/blocked) |
| **Fraud** | Rule engine (amount, currency, velocity), risk scoring, event log, configurable threshold |
| **Reconciliation** | Runs by type/date/partner, matching internal vs external (e.g. processor) records, summary and match details |
| **Partner Gateway** | API-key auth, scoped endpoints per partner, webhook signing, proxy to payments/KYC |

## Quick Start

### Local (dev)

```bash
cp .env.example .env
# Edit .env with your DB/Redis (or use defaults for local Postgres/Redis)

npm install
npm run start:dev
```

- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

### Docker

```bash
docker compose up -d
# App: http://localhost:3000
```

### Database

With `NODE_ENV=development`, TypeORM can create schema from entities. For production use migrations:

```bash
npm run migration:generate -- src/common/database/migrations/Initial
npm run migration:run
```

## API Overview

- **`/api/v1/kyc-aml`** – Customers, verifications, AML checks
- **`/api/v1/payments`** – Create/list payments (use `Idempotency-Key` header for create)
- **`/api/v1/cards`** – Programs, issue card, list by customer, update status
- **`/api/v1/fraud`** – List fraud events by customer
- **`/api/v1/reconciliation`** – Start run, list runs, list matches
- **`/api/v1/partner`** – Partner API (requires `X-API-Key`); payments, KYC lookup

## Payment flow

1. **Create payment** (idempotent): Validates KYC/AML, runs fraud evaluation, selects route by type/currency, calls processor adapter.
2. **Routing:** `payment_routes` table (type, currency, processorId, priority). Add rows for your banks/processors.
3. **Processors:** Implement `IPaymentProcessor` and register in `PaymentsModule` (e.g. `PAYMENT_PROCESSORS` token).

## Partner gateway

- Create partners (e.g. via DB or admin API) with hashed API key and `allowedEndpoints`.
- Partners call `/api/v1/partner/*` with header `X-API-Key`. Use `WebhookService` to sign outbound webhooks.

## Security notes

- Set strong `JWT_SECRET` and partner API keys in production.
- Use TLS and restrict DB/Redis access.
- Prefer migrations over `synchronize: true` in production.
- Keep dependency versions updated and run security audits (`npm audit`).

## License

MIT
