# Company Bill — Backend Server

Express + MongoDB Atlas + WhatsApp Cloud API backend for the Bill Management System.

## Architecture

```
server/
├── src/
│   ├── index.ts                    ← Express app entry point
│   ├── config/
│   │   ├── db.ts                   ← MongoDB Atlas connection
│   │   └── env.ts                  ← Typed env config
│   ├── models/
│   │   ├── User.ts                 ← Auth (bcrypt + JWT)
│   │   ├── Company.ts              ← Companies
│   │   ├── Bill.ts                 ← Bills (PENDING/OVERDUE/COMPLETED)
│   │   └── NotificationLog.ts     ← Audit trail for all notifications
│   ├── middleware/
│   │   └── auth.ts                 ← JWT verification + role guard
│   ├── routes/
│   │   ├── auth.ts                 ← Login / Register / Me
│   │   ├── companies.ts            ← CRUD
│   │   ├── bills.ts                ← CRUD + complete + stats
│   │   └── notifications.ts       ← Notification history + stats
│   ├── services/
│   │   ├── overdueCron.ts          ← Scheduled overdue detection
│   │   └── notifications/
│   │       ├── types.ts            ← Provider interface (strategy pattern)
│   │       ├── index.ts            ← Service with retry + batch support
│   │       └── providers/
│   │           ├── whatsapp-meta.ts ← Meta WhatsApp Cloud API (FREE)
│   │           └── console.ts      ← Dev/testing provider
│   └── scripts/
│       └── seed.ts                 ← Seed DB with demo data
```

## Best Practices Implemented

| Practice | Implementation |
|----------|---------------|
| Provider Pattern | Swap notification providers without changing business logic |
| Retry + Backoff | Exponential backoff with non-retryable error detection |
| Rate Limiting | Sequential batch sending with delays |
| Audit Trail | Every notification attempt logged to `NotificationLog` |
| Idempotent Cron | Safe to run multiple times (24h notification cooldown) |
| Input Validation | Zod schemas on all API inputs |
| Role-Based Access | JWT + ADMIN/VIEWER role guards |
| Error Isolation | One bill's failure doesn't block others |
| Timezone Aware | Cron runs in Asia/Kolkata timezone |

## Setup

### 1. Install dependencies

```bash
cd server
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in at minimum:
- `MONGODB_URI` — From MongoDB Atlas
- `JWT_SECRET` — Random string

For notifications (optional, defaults to console logging):
- `WHATSAPP_API_TOKEN` — From Meta developers console
- `WHATSAPP_PHONE_NUMBER_ID` — From WhatsApp API setup

### 3. MongoDB Atlas Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster (512MB, free forever)
3. Create a database user (Database Access)
4. Whitelist your IP (Network Access), or `0.0.0.0/0` for dev
5. Click Connect → Drivers → Copy the connection string

### 4. Seed the database

```bash
npm run seed
```

### 5. Run the server

```bash
npm run dev
```

Server: `http://localhost:5000`
Health: `http://localhost:5000/api/health`

## WhatsApp Setup (Meta Cloud API)

**Free tier: 1,000 service conversations/month**

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create App → Select "Business" → Add WhatsApp product
3. In WhatsApp → API Setup:
   - Copy the **Temporary access token**
   - Copy the **Phone Number ID**
4. In WhatsApp → Message Templates, create a template:
   - Name: `overdue_reminder`
   - Category: Utility
   - Language: English
   - Body: `Dear {{1}}, your bill #{{2}} of {{3}} is overdue. Outstanding: {{4}}. Overdue by {{5}} days. Please arrange payment.`
5. Update `.env`:
   ```
   NOTIFICATION_PROVIDER=whatsapp_meta
   WHATSAPP_API_TOKEN=<your-token>
   WHATSAPP_PHONE_NUMBER_ID=<your-id>
   ```

## API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/login | ❌ | Login |
| POST | /api/auth/register | ❌ | Register |
| GET | /api/auth/me | ✅ | Current user |

### Companies
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /api/companies | ✅ | Any | List all |
| GET | /api/companies/:id | ✅ | Any | Get one |
| POST | /api/companies | ✅ | Admin | Create |
| PUT | /api/companies/:id | ✅ | Admin | Update |
| DELETE | /api/companies/:id | ✅ | Admin | Delete |

### Bills
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | /api/bills?status=&companyId= | ✅ | Any | List + filter |
| GET | /api/bills/stats | ✅ | Any | Dashboard stats |
| GET | /api/bills/:id | ✅ | Any | Get one |
| POST | /api/bills | ✅ | Admin | Create |
| PUT | /api/bills/:id | ✅ | Admin | Update |
| PATCH | /api/bills/:id/complete | ✅ | Admin | Mark paid |
| DELETE | /api/bills/:id | ✅ | Admin | Delete |

### Notifications
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/notifications?page=&limit= | ✅ | History (paginated) |
| GET | /api/notifications/stats | ✅ | Summary counts |

## Credentials (after seeding)

- **Admin:** admin@example.com / admin123
- **Viewer:** viewer@example.com / viewer123
