# PayNest Backend — Monorepo

Internal backend services for PayNest Technologies.  
This repository contains all backend microservices, shared infrastructure config, and local development tooling.

---

## Services

| Service | Port | Responsibility |
|---|---|---|
| `transfer-service` | 3001 | P2P naira transfers via NIBSS NIP |
| `notifications-service` | 3002 | SMS and push notifications via Termii/FCM |

---

## Prerequisites

Before you start, make sure you have the following installed on your machine.  
If anything is missing, click the link next to it.

| Tool | Minimum Version | Check |
|---|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | 24.x | `docker --version` |
| [Docker Compose](https://docs.docker.com/compose/) | 2.x (plugin) | `docker compose version` |
| [Node.js](https://nodejs.org/) | 18.x | `node --version` |
| [Git](https://git-scm.com/) | 2.x | `git --version` |

---

## Getting Started — Local Development

Follow these steps exactly. Do not skip ahead.

### Step 1 — Clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/paynest-backend.git
cd paynest-backend
```

### Step 2 — Set up environment files

Each service has a `.env.example` file. Copy it to `.env` inside each service folder:
```bash
cp services/transfer-service/.env.example services/transfer-service/.env
cp services/notifications-service/.env.example services/notifications-service/.env
```

You do not need to edit any values. The defaults point to WireMock which runs locally.  
**Never commit `.env` files to git.**

### Step 3 — Start the full stack

From the root of the repository:
```bash
docker compose -f docker-compose.dev.yml up --build
```

The first run takes 3-5 minutes because Docker is building the images.  
Subsequent runs are fast because the layers are cached.

A healthy startup looks like this:
```
paynest-wiremock               | Started WireMock on port 8080
paynest-notifications-service  | [notifications-service] Running on port 3002
paynest-transfer-service       | [transfer-service] Running on port 3001
```

### Step 4 — Verify everything is running

Open a new terminal and run:
```bash
curl http://localhost:3001/health
curl http://localhost:3002/health
```

Both should return `"status": "healthy"`.

---

## Running a Transfer Locally
```bash
curl -X POST http://localhost:3001/api/v1/transfers \
  -H "Content-Type: application/json" \
  -d '{
    "senderId": "usr_123",
    "recipientAccount": "0123456789",
    "amount": 5000,
    "narration": "Test transfer"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Transfer of ₦5000 to 0123456789 was successful.",
  "data": {
    "transactionRef": "PNT-XXXXXXXX",
    "amount": 5000,
    "status": "successful"
  }
}
```

Copy the `transactionRef` and look it up:
```bash
curl http://localhost:3001/api/v1/transfers/PNT-XXXXXXXX
```

Check the notification was triggered:
```bash
curl http://localhost:3002/api/v1/notify/log
```

---

## Running Tests

Run tests for a specific service:
```bash
cd services/transfer-service && npm test
cd services/notifications-service && npm test
```

Tests run automatically inside Docker during every build.  
A failed test stops the build — nothing broken ever gets pushed to ECR.

---

## Useful Commands
```bash
# Start the stack (foreground — see all logs)
docker compose -f docker-compose.dev.yml up

# Start the stack (background)
docker compose -f docker-compose.dev.yml up -d

# Stop everything
docker compose -f docker-compose.dev.yml down

# Rebuild a single service after a code change
docker compose -f docker-compose.dev.yml up --build transfer-service

# View logs for a specific service
docker compose -f docker-compose.dev.yml logs -f transfer-service

# Open a shell inside a running container (useful for debugging)
docker exec -it paynest-transfer-service sh
```

---

## External API Mocking (WireMock)

All external API calls (NIBSS, Paystack, Termii) are mocked locally by WireMock.  
You never hit real external APIs during local development.

| Real API | Local Mock URL |
|---|---|
| NIBSS NIP transfers | `http://localhost:8080/nip/transfer` |
| Paystack charge | `http://localhost:8080/transaction/initialize` |
| Termii SMS | `http://localhost:8080/api/sms/send` |

Mock response files live in `shared/wiremock/mappings/`.  
Changes to mapping files are picked up immediately — no restart needed.

To simulate a failed NIBSS response (for testing error handling):
```bash
curl -X POST http://localhost:8080/nip/transfer/simulate-failure \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## Project Structure
```
paynest-backend/
  services/
    transfer-service/        # P2P transfer handling
      src/
        config.js            # Environment variable management
        transfer.js          # Core business logic
        routes.js            # HTTP endpoints
        index.js             # Server entry point
        transfer.test.js     # Unit tests
      Dockerfile
      jest.config.js
      jest.setup.js
      .env.example
    notifications-service/   # SMS and push notifications
      src/
        config.js
        notification.js
        routes.js
        index.js
        notification.test.js
      Dockerfile
      jest.config.js
      jest.setup.js
      .env.example
  shared/
    wiremock/
      mappings/              # WireMock mock response definitions
  docker-compose.dev.yml     # Local development stack
  .gitignore
  README.md                  # You are here
```

---

## Environment Variables

Each service manages its own environment variables.  
See the `.env.example` file inside each service folder for the full list.

**Golden rule: never hardcode secrets. Never commit `.env` files.**  
In staging and production, secrets come from AWS Secrets Manager via the External Secrets Operator.

---

## Branching & Contributing

| Branch type | Pattern | Example |
|---|---|---|
| Feature | `feature/<jira-id>-<description>` | `feature/PAYN-089-local-dev-setup` |
| Bug fix | `fix/<jira-id>-<description>` | `fix/PAYN-102-wiremock-timeout` |
| Infrastructure | `infra/<jira-id>-<description>` | `infra/PAYN-201-terraform-vpc` |
| Hotfix | `hotfix/<jira-id>-<description>` | `hotfix/PAYN-310-nibss-retry` |

All changes go through a pull request. Direct commits to `main` are blocked.  
Minimum 2 approvals required. CI must pass before merge.

---

## Getting Help

- Engineering questions: `#engineering` on Slack  
- Infrastructure issues: `#infra-support` on Slack  
- On-call engineer: check PagerDuty schedule  
- Runbooks: Notion → Engineering → Runbooks