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

## 📂 Project Structure

```bash
GuideWire/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Route-level components
│   │   └── context/    # State management
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── routes/    # API endpoints
│   │   ├── models/    # Database schemas
│   │   └── services/  # Business logic & AI scoring
└── .gitignore         # Root git configuration
```

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- Python (v3.10+)
- MongoDB (Running locally or via Atlas)

### 1. Backend Setup
Navigate to the `backend` directory and follow the instructions in [backend/README.md](backend/README.md).
- Create a virtual environment.
- Install dependencies via `pip install -r requirements.txt`.
- Configure your `.env` file.
- Run the server using `uvicorn app.main:app --reload`.

### 2. Frontend Setup
Navigate to the `frontend` directory and follow the instructions in [frontend/README.md](frontend/README.md).
- Install dependencies via `npm install`.
- Run the development server via `npm run dev`.

---

© 2026 ShieldGig AI Platform. Empowering the gig economy through smart protection.
