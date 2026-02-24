# OpsTower V2 - Fleet Management Command Center [KIMI VERSION]

> ⚠️ **CLAUDE CODE - DO NOT TOUCH** - This is Kimi's implementation workspace  
> 🔄 **Head-to-Head Challenge:** Kimi vs Claude Code parallel development  
> 📁 **Original Project:** https://github.com/nathant30/OpsTower-V2-2026

**GitHub Repository (THIS REPO):** https://github.com/nathant30/OpsTower-V2-2026_Kimi  
**AI Agent:** Kimi Code CLI  
**Status:** Active Development by Kimi

**Status:** Active Development
**Started:** February 9, 2026
**Tech Stack:** React 18 + Vite + TypeScript + testapi.xpress.ph

---

## 🎯 Project Overview

OpsTower V2 is a sophisticated fleet management command center for XPRESS delivery operations in the Philippines. This version connects to the production backend API (testapi.xpress.ph) with 993 REST endpoints and real-time SignalR updates.

### **Key Features:**
- **Demand Heatmap** - Mapbox GL JS visualization of delivery demand
- **Real-time Driver Rankings** - Live leaderboard with performance metrics
- **Fleet Status Panel** - Monitor all drivers, vehicles, and operations
- **Shift Management** - Clock in/out, breaks, AM/PM/NIGHT shifts
- **Incident Management** - Track and resolve operational incidents
- **Playback Controls** - Time-based replay of fleet operations
- **Dark Theme UI** - Professional command center aesthetic

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│  Frontend (React + Vite)             │
│  Port: 5173 (dev)                    │
│  Deployed: AWS ECS (production)      │
└──────────────┬──────────────────────┘
               │
               │ HTTPS + SignalR
               │
┌──────────────▼──────────────────────┐
│  Backend API                         │
│  testapi.xpress.ph                   │
│  - 993 REST endpoints                │
│  - SignalR hubs (real-time)          │
│  - C#/.NET Core                      │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ and npm
- Mapbox access token (for heatmap)

### **1. Install Dependencies**
```bash
npm install

# Install additional packages
npm install @tanstack/react-query mapbox-gl @microsoft/signalr
npm install tailwindcss postcss autoprefixer
npm install lucide-react react-hook-form zod
npm install recharts date-fns
```

### **2. Configure Environment**
Create a `.env` file (already exists with defaults):
```bash
VITE_API_BASE_URL=https://testapi.xpress.ph
VITE_API_VERSION=v1
VITE_SIGNALR_HUB_URL=https://testapi.xpress.ph/hubs
VITE_ENABLE_MOCK_DATA=false
VITE_ENABLE_DEBUG=true
VITE_MAPBOX_TOKEN=your_mapbox_token_here
```

### **3. Start Development Server**
```bash
npm run dev
```

Visit: http://localhost:5173

---

## 📊 Backend API (testapi.xpress.ph)

**Swagger Docs:** https://testapi.xpress.ph/swagger/v1/swagger.json

### **Key Endpoints:**
- `/v1/api/AdminDashboard/*` - KPIs, stats, analytics
- `/v1/api/AdminXpressRider/*` - Driver management (55+ endpoints)
- `/v1/api/AdminDeliveryOrder/*` - Orders/Bookings (40+ endpoints)
- `/v1/api/AdminXpressOperator/*` - Fleet/Vehicles
- `/v1/api/AdminXpressDriverCommerce/*` - Bonds/Commerce (24 endpoints)
- `/v1/api/AdminPartnerFinance/*` - Finance reports (6 endpoints)
- `/v1/api/GoogleFleet/*` - Google Fleet Engine integration

### **Real-time Updates:**
- SignalR Hub: `https://testapi.xpress.ph/hubs`
- Events: Fleet updates, order status, driver locations, incidents

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── features/
│   │   ├── dashboard/           # Main command center
│   │   │   ├── DemandHeatmap/   # Mapbox integration
│   │   │   ├── FleetStatus/     # Left panel
│   │   │   ├── DriverRankings/  # Live leaderboard
│   │   │   ├── PlaybackControls/# Time replay
│   │   │   └── ShiftAlertsPanel/# Right panel
│   │   ├── drivers/             # Driver management
│   │   ├── shifts/              # Shift management
│   │   ├── bonds/               # Driver bonds/commerce
│   │   ├── incidents/           # Incident management
│   │   ├── compliance/          # Philippine compliance
│   │   └── payments/            # Maya + GCash
│   ├── components/
│   │   ├── xpress/              # XPRESS Design System
│   │   └── ui/                  # Base UI components
│   ├── services/
│   │   ├── api.ts               # API client
│   │   └── realtime/            # SignalR hubs
│   └── lib/
│       ├── auth/                # Authentication
│       ├── payments/            # Payment clients
│       └── utils/               # Utilities
├── .env                         # Environment config
└── package.json
```

---

## 🎨 Design Reference

Based on: `/Users/nathan/Downloads/opstower-frontend-spec/FRONTEND-REBUILD-SPEC.md`

**Layout:**
- KPI ribbon across top (Revenue/hr, Utilization, Active Orders)
- 3-column layout: Fleet Status | Demand Heatmap | Shift/Alerts
- Bottom: Playback Controls
- Dark theme: #0a0a0f background, #1a1a2e cards

---

## 📝 Development Roadmap

### **Week 1: Foundation** (Current)
- [x] Project setup (React + Vite + TypeScript)
- [x] Git repository initialized
- [x] GitHub repo created
- [ ] Tailwind CSS configuration
- [ ] API client for testapi.xpress.ph
- [ ] SignalR integration
- [ ] Basic 3-column layout

### **Week 2: Core Dashboard**
- [ ] KPI ribbon component
- [ ] Fleet status panel
- [ ] Demand heatmap (Mapbox GL JS)
- [ ] Shift/alerts panel
- [ ] Real-time data updates

### **Week 3: Advanced Features**
- [ ] Driver performance rankings
- [ ] Playback controls
- [ ] Driver management pages
- [ ] Shifts management pages

### **Week 4: Critical Integrations**
- [ ] Philippine Compliance (BSP, DPA, LTFRB)
- [ ] Payment integration (Maya, GCash)
- [ ] Bonds/Commerce pages
- [ ] Incidents module

### **Week 5: Polish & Deploy**
- [ ] Mobile responsive design
- [ ] Performance optimization
- [ ] Testing (Vitest + Playwright)
- [ ] Deploy to AWS ECS

---

## 🔧 Features to Extract from Archives

Located in: `/Users/nathan/XpressOps_Clean/`

### **From 2_ARCHIVE_2025_MID:**
- [ ] Fraud detection algorithms
- [ ] Geographic/spatial analysis patterns
- [ ] ML model weights

### **From 3_ARCHIVE_2026_JAN:**
- [ ] Incidents module (best implementation)
- [ ] Enhanced Shifts logic
- [ ] Driver Tier system
- [ ] Frontend components (KPIRibbon, etc.)

### **From 4_ARCHIVE_2026_FEB:**
- [ ] Philippine Compliance (BSP, DPA, LTFRB)
- [ ] Payment integration (Maya, GCash)
- [ ] XPRESS Design System
- [ ] Security/Auth utilities

---

## 🚀 Deployment

**Target:** AWS ECS (existing infrastructure)

```bash
# Build Docker image
docker build -t xpressops-tower:v2.0 .

# Tag and push to ECR
aws ecr get-login-password --region ap-southeast-1 | \
  docker login --username AWS --password-stdin \
  339712742171.dkr.ecr.ap-southeast-1.amazonaws.com

docker tag xpressops-tower:v2.0 \
  339712742171.dkr.ecr.ap-southeast-1.amazonaws.com/xpressops-tower:v2.0

docker push 339712742171.dkr.ecr.ap-southeast-1.amazonaws.com/xpressops-tower:v2.0

# Update ECS service
aws ecs update-service \
  --cluster xpressops-prod \
  --service xpressops-tower-prod \
  --force-new-deployment \
  --region ap-southeast-1
```

---

## 📚 Documentation

- **Project Overview:** `/Users/nathan/XpressOps_Clean/MASTER_PROJECT_INDEX.md`
- **Quick Start Guide:** `/Users/nathan/XpressOps_Clean/START_HERE.md`
- **Frontend Design Spec:** `/Users/nathan/Downloads/opstower-frontend-spec/FRONTEND-REBUILD-SPEC.md`
- **API Documentation:** https://testapi.xpress.ph/swagger/v1/swagger.json

---

## 📞 Support

**Backend API:** testapi.xpress.ph (owned by XPRESS)
**Deployment:** AWS ECS (ap-southeast-1)
**GitHub:** https://github.com/nathant30/OpsTower-V2-2026

---

*Last updated: February 9, 2026*
