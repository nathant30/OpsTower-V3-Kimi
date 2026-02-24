# Scratchpad for TypeScript Fixes

## Issues to Fix

### 1. src/components/layout/Header.tsx
- Uses `notification.read` and `notification.timestamp` 
- Need to ensure these are properly typed in ui.types.ts
- Status: Types already exist as optional, should work

### 2. src/components/layout/Sidebar.tsx  
- Unused import 'Menu' - CHECKED: No Menu import found, already clean

### 3. src/features/dashboard/components/DemandHeatmap.tsx
- Unused imports: useEffect, useRef, Layers, Navigation
- Status: Need to remove these imports

### 4. src/lib/stores/ui.store.ts
- Unused type imports: ModalState, SidebarState
- newNotification.duration possibly undefined issue at line 115
- Status: Need to remove unused imports and fix duration check

### 5. src/types/ui.types.ts
- Already has read and timestamp as optional fields
- Status: Already correct

### 6. src/features/finance/hooks/useTransactions.ts
- Unused import 'Settlement'
- Status: Need to remove

### 7. src/features/dashboard/components/PlaybackControls.tsx
- NodeJS.Timeout error - needs to use ReturnType<typeof setInterval>
- Status: Need to fix the type

## Build Verification
- Run `npm run build` to verify all fixes
