# Xpress API Specification Snapshot

**Base URL:** `https://testapi.xpress.ph`  
**Version:** v1

## Key Endpoints Discovered

### Admin Dashboard
- `POST /v1/api/AdminDashboard/GetDashboardStats` - Dashboard statistics
- `POST /v1/api/AdminDashboard/GetServiceTypeDashboard` - Service type breakdown
- `POST /v1/api/AdminDashboard/GetReportDriversDashboard` - Driver reports
- `POST /v1/api/AdminDashboard/GetReportCustomersDashboard` - Customer reports
- `POST /v1/api/AdminDashboard/GetReportRevenueDashboard` - Revenue reports
- `POST /v1/api/AdminDashboard/GetTransactionDashboard` - Transaction dashboard
- `POST /v1/api/AdminDashboard/GetTransactionAccountingDashboard` - Accounting data
- `POST /v1/api/AdminDashboard/ExportAvgReport` - Export reports

### Admin Delivery Order
- `POST /v1/api/AdminDeliveryOrder/GetOrdersList` - List orders
- `POST /v1/api/AdminDeliveryOrder/GetOrderDetail` - Order details
- `POST /v1/api/AdminDeliveryOrder/GetDeliveryOrders` - Delivery orders
- `POST /v1/api/AdminDeliveryOrder/CancelDeliveryOrder` - Cancel order
- `POST /v1/api/AdminDeliveryOrder/CompleteOrder` - Complete order
- `POST /v1/api/AdminDeliveryOrder/AssignRider` - Assign driver
- `POST /v1/api/AdminDeliveryOrder/OfferOrderToRider` - Offer order
- `POST /v1/api/AdminDeliveryOrder/PrioritizeOrder` - Prioritize order
- `POST /v1/api/AdminDeliveryOrder/GetNearbyDriversForAssign` - Nearby drivers
- `POST /v1/api/AdminDeliveryOrder/GetRiderDeliveryOrders` - Driver orders
- `POST /v1/api/AdminDeliveryOrder/GetRiderDeliveryOrderDetail` - Driver order detail
- `POST /v1/api/AdminDeliveryOrder/GetLiveMapActiveOrders` - Live map orders
- `POST /v1/api/AdminDeliveryOrder/GetLiveMapActiveOrderDetails` - Live map details
- `POST /v1/api/AdminDeliveryOrder/GetRiderAssigningHistory` - Assignment history
- `POST /v1/api/AdminDeliveryOrder/GetDeliveryOrdersByGeoZone` - Orders by zone

### Transactions & Finance
- `POST /v1/api/AdminDeliveryOrder/GetTransactions` - Transactions list
- `POST /v1/api/AdminDeliveryOrder/GetGuaranteedPay` - Driver earnings
- `POST /v1/api/AdminDeliveryOrder/GetTopUps` - Top-ups
- `POST /v1/api/AdminDeliveryOrder/GetCashOut` - Cash outs
- `POST /v1/api/AdminDeliveryOrder/GetRiderWalletInfo` - Wallet info
- `POST /v1/api/AdminDeliveryOrder/ExportTransactions` - Export transactions

### Admin Disciplinary (Incidents)
- `POST /v1/api/AdminDisciplinary/GetRidersDisciplinaries` - List incidents
- `POST /v1/api/AdminDisciplinary/AddOrUpdateDisciplinary` - Create/update
- `POST /v1/api/AdminDisciplinary/GetDetailDisciplinary` - Incident details
- `POST /v1/api/AdminDisciplinary/SetInvestigativeUserAndSetStatusInvestigation` - Assign investigator
- `POST /v1/api/AdminDisciplinary/SaveInvestigationAndSetStatusPending` - Save investigation
- `POST /v1/api/AdminDisciplinary/SaveDisciplinaryAction` - Take action
- `POST /v1/api/AdminDisciplinary/SuspensionUserThirtyDays` - 30-day suspension
- `POST /v1/api/AdminDisciplinary/ChangePriority` - Change priority

### Broadcast Messages
- `POST /v1/api/AdminBroadcastMessage/GetBroadcastMessages` - List messages
- `POST /v1/api/AdminBroadcastMessage/GetDetailBroadcastMessage` - Message details
- `POST /v1/api/AdminBroadcastMessage/CreateBroadcastMessage` - Create message
- `POST /v1/api/AdminBroadcastMessage/GetBroadcastMessageUsers` - Message users

### Code of Conduct
- `POST /v1/api/AdminCodeConduct/GetCodeConducts` - List codes
- `POST /v1/api/AdminCodeConduct/CreateCodeConduct` - Create code

---
*Note: Full API spec saved for reference*
