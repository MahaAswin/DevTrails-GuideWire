# ShieldGig AI - Parametric Insurance for Gig Workers

ShieldGig AI is an innovative, AI-powered parametric insurance platform designed specifically for the gig economy. It provides automated, data-driven insurance coverage for food delivery workers and gig professionals against environmental risks like extreme weather.

## 🚀 Overview

The platform uses real-time data feeds (like weather APIs) and AI risk scoring to offer "parametric" insurance. Unlike traditional insurance that requires manual claims and evidence, ShieldGig triggers payouts automatically when certain conditions (e.g., specific rainfall intensity) are met.

### Key Features
- **AI-Powered Risk Scoring**: Real-time evaluation of risk levels for gig workers based on their location and platform.
- **Parametric Claims**: Instant payouts triggered by verifiable data points without the need for manual paperwork.
- **Worker Dashboard**: Personalized portal for workers to manage policies, track claims, and monitor their wallet.
- **Admin Analytics**: Comprehensive dashboard for platform admins to monitor risk distribution, payments, and worker safety.
- **Integrated Wallet**: Seamless top-up and payout system for insurance premiums and claims.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js with Vite
- **Styling**: Tailwind CSS for a modern, responsive fintech UI
- **Icons**: Lucide React
- **Maps**: Leaflet for real-time location tracking

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB for flexible data storage
- **AI/ML**: Integration for anomaly detection and risk assessment
- **Validation**: Pydantic for robust data schemas
### Advanced Features
- **User Referrals & Rewards**: Unique referral codes for every user. 100 reward points credited to both referrer and referee upon successful signup.
- **Dynamic Policy Reminders**: Users can toggle automated policy expiry notifications (sent 3 days before due) from their dashboard.
- **Enhanced Payment Verification**: Mandatory proof-of-payment screenshots for all wallet deposits with a dedicated "Capital Approval Desk" for admins.
- **Incident Verification Center**: Unified portal for admins to review emergency reports, audit fraud flags, and authorize parametric payouts.
- **Export & Reporting**: Admins can export payment ledgers to **CSV** or **PDF** with custom date range filtering.
- **Secure Exit**: One-way session termination that replaces browser history to prevent unauthorized dashboard access.

## 📡 API Reference

The backend exposes a robust set of RESTful endpoints. Use `.env` for configuration (Google Gemini, MongoDB URI). **Do not commit sensitive keys.**

### Authentication & User
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/register` | User signup with phone number and optional referral code. |
| `POST` | `/auth/login` | Secure login returning JWT and user profile metadata. |
| `PUT` | `/user/reminder-toggle` | Enable or disable automated policy expiry notifications. |
| `GET` | `/user/rewards` | Retrieve current reward points and eligibility for claim. |
| `POST` | `/user/claim-reward` | Deduct points (1000 minimum) to claim available rewards. |

### Wallet & Payments
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/wallet/add-money` | Submit deposit request with **mandatory** proof screenshot. |
| `GET` | `/admin/pending-payments` | List all deposits awaiting admin verification. |
| `POST` | `/admin/approve-payment` | release funds to worker wallet after manual verification. |

### Policies & Claims
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/workers/activate-policy` | Enroll in a policy and set activation/expiry timestamps. |
| `GET` | `/admin/pending-claims` | Aggregate view of incident reports for auditing. |
| `POST` | `/admin/verify-claim` | Approve/Reject claims and release parametric payouts. |

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)
- MongoDB (Running locally or via Atlas)

### 1. Backend Setup
Navigate to the `backend` directory and follow the instructions in [backend/README.md](backend/README.md).
- Create a virtual environment: `python -m venv venv`.
- Install dependencies: `pip install -r requirements.txt`.
- Configure `.env` (See `.env.example` if available).
- Run server: `uvicorn app.main:app --reload`.

### 2. Frontend Setup
Navigate to the `frontend` directory and follow the instructions in [frontend/README.md](frontend/README.md).
- Install dependencies: `npm install`.
- Run development server: `npm run dev`.

---

© 2026 ShieldGig AI Platform. Empowering the gig economy through smart protection.
