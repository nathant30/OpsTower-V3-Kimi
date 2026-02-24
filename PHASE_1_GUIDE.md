# Phase 1: Critical Features - Step-by-Step Guide
**Duration:** Week 1-2 (Feb 17 - Mar 2, 2026)
**Features:** Fraud Detection, Payments, RBAC, Analytics

---

## 🚀 Getting Started (Day 1 Morning)

### Step 1: Verify Setup ✅

```bash
# Navigate to Kimi project
cd ~/OpsTower-V2-2026_Kimi

# Verify you're on the feature branch
git branch --show-current
# Should show: feature/port-all-features

# Verify backups exist
ls ~/OpsTower_Backups/
# Should show 3 backup folders

# Install current dependencies
npm install

# Start dev server to ensure everything works
npm run dev
```

**Expected Result:** Dev server runs on http://localhost:5173 ✅

---

## 📋 Feature 1: 🔥 Fraud Detection (Days 1-3)

### **Why First?**
- HIGH business value (prevents losses)
- Self-contained feature
- Good learning experience for porting process

### **Analysis: What Are We Porting?**

```bash
# Explore the fraud feature in source project
ls -la ~/2026_OpsTower/src/features/fraud/

# Read key files to understand structure
# (We'll do this together in next step)
```

### **Day 1 Afternoon: Analyze Source Files**

```bash
# List all fraud-related files
find ~/2026_OpsTower/src/features/fraud -type f -name "*.tsx" -o -name "*.ts"

# Count files
find ~/2026_OpsTower/src/features/fraud -type f | wc -l
```

**Expected Files:**
- `FraudDashboard.tsx` - Main dashboard
- `FraudAlerts.tsx` - Alert list
- `FraudPatterns.tsx` - Pattern detection
- `FraudAnalytics.tsx` - Analytics charts
- `types.ts` - TypeScript types
- `hooks/` - Custom hooks
- `utils/` - Utility functions
- `services/` - API calls

### **Day 2 Morning: Create Fraud Feature Structure in Kimi**

```bash
cd ~/OpsTower-V2-2026_Kimi

# Create fraud feature directory structure
mkdir -p src/features/fraud
mkdir -p src/features/fraud/components
mkdir -p src/features/fraud/hooks
mkdir -p src/features/fraud/utils
mkdir -p src/services/fraud

echo "✅ Fraud directory structure created"
```

### **Day 2 Afternoon: Port Fraud Files**

**Manual Steps:**
1. Copy files from source to target
2. Update imports to match Kimi's structure
3. Adapt styling to Kimi's design system
4. Fix TypeScript errors

**Example: Port FraudDashboard.tsx**

```bash
# Copy the file
cp ~/2026_OpsTower/src/features/fraud/FraudDashboard.tsx \
   ~/OpsTower-V2-2026_Kimi/src/features/fraud/FraudDashboard.tsx
```

**Then manually edit the file:**

**BEFORE (2026_OpsTower imports):**
```typescript
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFraudAlerts } from '../hooks/useFraudAlerts';
```

**AFTER (Kimi imports):**
```typescript
import { XpressCard } from '@/components/ui/XpressCard';
import { XpressButton } from '@/components/ui/XpressButton';
import { useFraudAlerts } from './hooks/useFraudAlerts';
```

**BEFORE (2026_OpsTower styling):**
```typescript
<div className="card bg-ops-card">
```

**AFTER (Kimi styling):**
```typescript
<div className="xpress-card bg-xpress-bg-tertiary">
```

### **Day 3: Install Dependencies & Test**

```bash
# Install fraud-related dependencies (if any)
# Check package.json in 2026_OpsTower for fraud-specific packages

# Example: If ML libraries are needed
# npm install tensorflow @tensorflow/tfjs

# Test the fraud feature
npm run dev
# Navigate to /fraud in browser
```

### **Day 3 Evening: Commit Fraud Feature**

```bash
git add src/features/fraud/
git add src/services/fraud/
git commit -m "feat: Port fraud detection system from 2026_OpsTower

- Add FraudDashboard component
- Add FraudAlerts, FraudPatterns, FraudAnalytics
- Add fraud detection hooks and utilities
- Add fraud API service
- Integrate with Kimi design system

Source: /Users/nathan/2026_OpsTower/src/features/fraud/"

git push origin feature/port-all-features
```

---

## 💰 Feature 2: Payments (Days 4-6)

### **Why Second?**
- REVENUE critical
- Well-documented in XpressOps_Clean
- Builds on fraud detection (payment fraud)

### **Day 4 Morning: Analyze Payments Feature**

```bash
# Explore payments in XpressOps_Clean
ls -la ~/XpressOps_Clean/1_ACTIVE_DEVELOPMENT/frontend/src/features/payments/

# Count files
find ~/XpressOps_Clean/1_ACTIVE_DEVELOPMENT/frontend/src/features/payments -type f | wc -l
```

**Expected Components:**
- Maya payment gateway integration
- GCash payment gateway integration
- Payment history
- Transaction tracking
- Refunds/chargebacks

### **Day 4 Afternoon: Create Payments Structure**

```bash
cd ~/OpsTower-V2-2026_Kimi

# Create payments feature directory
mkdir -p src/features/payments
mkdir -p src/features/payments/components
mkdir -p src/features/payments/maya
mkdir -p src/features/payments/gcash
mkdir -p src/features/payments/hooks
mkdir -p src/services/payments

echo "✅ Payments directory structure created"
```

### **Day 5-6: Port Payments Files**

**Steps:**
1. Port Maya integration
2. Port GCash integration
3. Port payment history components
4. Port transaction tracking
5. Add payment API services
6. Test with mock data
7. Commit

**Environment Variables to Add:**

Edit `/Users/nathan/OpsTower-V2-2026_Kimi/.env`:

```bash
# Add these payment gateway keys
VITE_MAYA_PUBLIC_KEY=your_maya_public_key_here
VITE_MAYA_SECRET_KEY=your_maya_secret_key_here
VITE_GCASH_MERCHANT_ID=your_gcash_merchant_id_here
VITE_GCASH_API_KEY=your_gcash_api_key_here
```

### **Day 6 Evening: Commit Payments Feature**

```bash
git add src/features/payments/
git add src/services/payments/
git add .env
git commit -m "feat: Port payment system (Maya + GCash) from XpressOps_Clean

- Add Maya payment gateway integration
- Add GCash payment gateway integration
- Add payment history and transaction tracking
- Add payment hooks and utilities
- Add payment API services
- Configure environment variables for payment gateways

Source: /Users/nathan/XpressOps_Clean/1_ACTIVE_DEVELOPMENT/frontend/src/features/payments/"

git push origin feature/port-all-features
```

---

## 🎯 Feature 3: RBAC (Days 7-9)

### **Why Third?**
- SECURITY critical
- Needed before other features
- Well-structured in 2026_OpsTower

### **Day 7: Analyze & Port RBAC**

```bash
# Explore RBAC in 2026_OpsTower
ls -la ~/2026_OpsTower/src/features/rbac/

# Create RBAC structure in Kimi
mkdir -p ~/OpsTower-V2-2026_Kimi/src/features/rbac
mkdir -p ~/OpsTower-V2-2026_Kimi/src/features/rbac/components
mkdir -p ~/OpsTower-V2-2026_Kimi/src/features/rbac/hooks
mkdir -p ~/OpsTower-V2-2026_Kimi/src/lib/rbac
```

**RBAC Roles (7 total):**
1. Super Admin
2. Admin
3. Operations Manager
4. Fleet Manager
5. Dispatcher
6. Support Agent
7. Viewer (Read-only)

### **Day 8-9: Port RBAC Files & Test**

**Key Files to Port:**
- Role definitions
- Permission mappings
- Role-based routing guards
- Permission checking hooks
- Admin UI for role management

### **Day 9 Evening: Commit RBAC**

```bash
git add src/features/rbac/
git add src/lib/rbac/
git commit -m "feat: Port RBAC system with 7 roles from 2026_OpsTower

- Add 7-role permission system (Super Admin → Viewer)
- Add role-based routing guards
- Add permission checking hooks
- Add role management UI
- Add permission definitions and mappings

Source: /Users/nathan/2026_OpsTower/src/features/rbac/"

git push origin feature/port-all-features
```

---

## 📊 Feature 4: Analytics (Days 10-14)

### **Why Last in Phase 1?**
- Most complex feature
- Requires other features as dependencies
- Benefits from lessons learned

### **Day 10-11: Analyze Analytics Suite**

```bash
# Explore analytics in 2026_OpsTower
ls -la ~/2026_OpsTower/src/features/analytics/

# This is a BIG feature with many sub-components
# Take time to understand the architecture
```

**Analytics Components:**
- Revenue analytics
- Fleet utilization charts
- Driver performance metrics
- Order volume tracking
- Geographic heat maps
- Time-series analysis
- Custom report builder

### **Day 12-13: Port Analytics Files**

```bash
# Create analytics structure
mkdir -p ~/OpsTower-V2-2026_Kimi/src/features/analytics
mkdir -p ~/OpsTower-V2-2026_Kimi/src/features/analytics/components
mkdir -p ~/OpsTower-V2-2026_Kimi/src/features/analytics/charts
mkdir -p ~/OpsTower-V2-2026_Kimi/src/features/analytics/reports
mkdir -p ~/OpsTower-V2-2026_Kimi/src/features/analytics/hooks
mkdir -p ~/OpsTower-V2-2026_Kimi/src/services/analytics
```

**Install Chart Dependencies:**

```bash
cd ~/OpsTower-V2-2026_Kimi
npm install recharts date-fns date-fns-tz
npm install --save-dev @types/recharts
```

### **Day 14: Test & Commit Analytics**

```bash
git add src/features/analytics/
git add src/services/analytics/
git add package.json package-lock.json
git commit -m "feat: Port complete analytics suite from 2026_OpsTower

- Add revenue analytics dashboard
- Add fleet utilization charts
- Add driver performance metrics
- Add order volume tracking
- Add geographic analytics
- Add time-series analysis
- Add custom report builder
- Add chart components (recharts)

Source: /Users/nathan/2026_OpsTower/src/features/analytics/"

git push origin feature/port-all-features
```

---

## ✅ Phase 1 Completion Checklist

### Week 2 Friday: Phase 1 Review

**Verify Everything:**

```bash
cd ~/OpsTower-V2-2026_Kimi

# 1. Check all files are committed
git status

# 2. Run TypeScript check
npm run build

# 3. Start dev server
npm run dev

# 4. Manual testing checklist:
```

**Manual Tests:**
- [ ] Navigate to `/fraud` - Fraud dashboard loads
- [ ] Navigate to `/payments` - Payment options visible
- [ ] Try accessing admin features - RBAC restricts based on role
- [ ] Navigate to `/analytics` - Charts and metrics display
- [ ] Check console for errors - Should be clean
- [ ] Check network tab - API calls working
- [ ] Test responsive design - Mobile view works

**Code Quality:**
- [ ] No TypeScript errors (`npm run build`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All imports resolve correctly
- [ ] Styling consistent with Kimi's design system
- [ ] All features use Kimi's components (Xpress*)

**Documentation:**
- [ ] Update PORTING_PLAN.md with completed features
- [ ] Add comments to complex code
- [ ] Update README.md with new features

### Commit Phase 1 Completion

```bash
git add PORTING_PLAN.md README.md
git commit -m "docs: Complete Phase 1 - Critical Features

Phase 1 Summary:
✅ Fraud Detection - Working with mock data
✅ Payments - Maya + GCash integrated
✅ RBAC - 7-role system implemented
✅ Analytics - Complete analytics suite

Next: Phase 2 - Operations Features (Live Ops, Dispatch, Safety, Tiers)
"

git push origin feature/port-all-features
```

---

## 🎉 Phase 1 Complete!

**What You've Achieved:**
- ✅ 4 critical features ported
- ✅ ~50-100 new files added
- ✅ Payment revenue streams secured
- ✅ Security (RBAC) implemented
- ✅ Business intelligence (Analytics) enabled
- ✅ Risk management (Fraud) active

**Next Steps:**
- Take a 1-day break to review and test
- Read PHASE_2_GUIDE.md
- Start Phase 2: Operations Features

---

## 🆘 Troubleshooting

### Issue: Import errors
**Solution:** Check that paths match Kimi's structure (`@/` is alias for `src/`)

### Issue: Styling looks wrong
**Solution:** Replace old class names with Kimi's xpress-* classes

### Issue: TypeScript errors
**Solution:** Check types match testapi.xpress.ph schema

### Issue: Feature not displaying
**Solution:** Check routing in `App.tsx`, ensure route is added

### Issue: API calls failing
**Solution:** Verify `.env` variables, check network tab in browser

---

**Ready to start? Run these commands to begin Phase 1:**

```bash
cd ~/OpsTower-V2-2026_Kimi
git checkout feature/port-all-features
npm install
npm run dev
```

**Then open this guide and follow Day 1 steps!** 🚀
