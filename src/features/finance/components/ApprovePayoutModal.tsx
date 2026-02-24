import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { formatCurrency, formatDate } from '@/lib/utils/date';
import type { Settlement } from '@/types/domain.types';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  User, 
  Wallet, 
  Calendar,
  Lock,

  Eye,
  EyeOff,
  Key
} from 'lucide-react';

interface ApprovePayoutModalProps {
  settlement: Settlement | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (settlement: Settlement, data: ApproveData) => void;
}

export interface ApproveData {
  reasonCode: string;
  secondaryApproverId: string;
  secondaryApproverPin: string;
  notes: string;
  acknowledgeRisk: boolean;
}

const reasonCodes = [
  { code: 'ROUTINE', label: 'Routine Settlement', risk: 'low' },
  { code: 'DRIVER_REQUEST', label: 'Driver Request', risk: 'low' },
  { code: 'EMERGENCY', label: 'Emergency Payout', risk: 'high' },
  { code: 'CORRECTION', label: 'Correction Payment', risk: 'medium' },
  { code: 'BONUS', label: 'Bonus/Adjustment', risk: 'medium' },
];

export function ApprovePayoutModal({ settlement, isOpen, onClose, onApprove }: ApprovePayoutModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState<ApproveData>({
    reasonCode: '',
    secondaryApproverId: '',
    secondaryApproverPin: '',
    notes: '',
    acknowledgeRisk: false,
  });
  const [showPin, setShowPin] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ApproveData, string>>>({});

  if (!settlement) return null;

  const selectedReason = reasonCodes.find(r => r.code === data.reasonCode);
  const isHighRisk = selectedReason?.risk === 'high' || settlement.totals.netPayable > 50000;

  const validateStep1 = () => {
    const newErrors: Partial<Record<keyof ApproveData, string>> = {};
    if (!data.reasonCode) newErrors.reasonCode = 'Please select a reason code';
    if (!data.notes.trim()) newErrors.notes = 'Please provide notes';
    if (isHighRisk && !data.acknowledgeRisk) {
      newErrors.acknowledgeRisk = 'Please acknowledge the risk for high-value payouts';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Partial<Record<keyof ApproveData, string>> = {};
    if (!data.secondaryApproverId.trim()) {
      newErrors.secondaryApproverId = 'Secondary approver ID is required';
    }
    if (!data.secondaryApproverPin.trim() || data.secondaryApproverPin.length < 6) {
      newErrors.secondaryApproverPin = 'Valid PIN required (6+ digits)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep2()) {
      onApprove(settlement, data);
      // Reset state
      setStep(1);
      setData({
        reasonCode: '',
        secondaryApproverId: '',
        secondaryApproverPin: '',
        notes: '',
        acknowledgeRisk: false,
      });
      onClose();
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-400" />
          <span>Approve Payout - Dual Control</span>
        </div>
      }
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {step === 1 ? (
            <>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleNext}>
                Continue to Authorization
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSubmit}
                icon={<CheckCircle className="w-4 h-4" />}
              >
                Confirm Approval
              </Button>
            </>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center gap-4 mb-6">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            step >= 1 ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-500"
          )}>
            <div className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-xs font-bold">
              1
            </div>
            Review
          </div>
          <div className="flex-1 h-px bg-white/10" />
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
            step >= 2 ? "bg-blue-500/20 text-blue-400" : "bg-white/5 text-gray-500"
          )}>
            <div className="w-5 h-5 rounded-full bg-current flex items-center justify-center text-xs font-bold">
              2
            </div>
            Authorize
          </div>
        </div>

        {step === 1 ? (
          <>
            {/* Settlement Summary */}
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/5 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">{settlement.driverId}</p>
                  <p className="text-sm text-gray-400 font-mono">{settlement.settlementId}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Net Payable</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(settlement.totals.netPayable)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Period</p>
                  <p className="text-sm text-gray-300">
                    {formatDate(settlement.period.startDate)} - {formatDate(settlement.period.endDate)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">{settlement.payout.method}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">Scheduled: {formatDate(settlement.payout.scheduledDate)}</span>
                </div>
              </div>
            </div>

            {/* High Value Warning */}
            {isHighRisk && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-400">High-Value Payout Alert</p>
                  <p className="text-sm text-gray-400 mt-1">
                    This payout exceeds ₱50,000 or is marked as emergency. 
                    Dual authorization and additional verification are required.
                  </p>
                </div>
              </div>
            )}

            {/* Reason Code */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-3 block">
                Reason Code <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-1 gap-2">
                {reasonCodes.map(reason => (
                  <button
                    key={reason.code}
                    onClick={() => setData(prev => ({ ...prev, reasonCode: reason.code }))}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-lg border text-left transition-all",
                      data.reasonCode === reason.code
                        ? "border-blue-500/50 bg-blue-500/10"
                        : "border-white/10 bg-white/5 hover:border-white/20",
                      getRiskColor(reason.risk)
                    )}
                  >
                    <div>
                      <p className="font-medium text-white">{reason.label}</p>
                      <p className="text-xs text-gray-400">Code: {reason.code}</p>
                    </div>
                    <Badge 
                      variant={reason.risk === 'high' ? 'alert' : reason.risk === 'medium' ? 'warning' : 'active'}
                      className="text-xs"
                    >
                      {reason.risk.toUpperCase()} RISK
                    </Badge>
                  </button>
                ))}
              </div>
              {errors.reasonCode && (
                <p className="text-sm text-red-400 mt-2">{errors.reasonCode}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Approval Notes <span className="text-red-400">*</span>
              </label>
              <textarea
                value={data.notes}
                onChange={(e) => setData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Enter approval justification..."
                rows={3}
                className={cn(
                  "w-full bg-white/5 border rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 resize-none",
                  errors.notes ? "border-red-500" : "border-white/10"
                )}
              />
              {errors.notes && (
                <p className="text-sm text-red-400 mt-2">{errors.notes}</p>
              )}
            </div>

            {/* Risk Acknowledgment */}
            {isHighRisk && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="acknowledgeRisk"
                  checked={data.acknowledgeRisk}
                  onChange={(e) => setData(prev => ({ ...prev, acknowledgeRisk: e.target.checked }))}
                  className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50"
                />
                <label htmlFor="acknowledgeRisk" className="text-sm text-gray-300">
                  I acknowledge that this is a high-value payout and confirm that all 
                  verification steps have been completed according to financial policy.
                </label>
              </div>
            )}
            {errors.acknowledgeRisk && (
              <p className="text-sm text-red-400">{errors.acknowledgeRisk}</p>
            )}
          </>
        ) : (
          <>
            {/* Dual Control Authorization */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-white">Dual Authorization Required</p>
                  <p className="text-sm text-gray-400">
                    A second authorized personnel must verify this transaction
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Approver */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Secondary Approver ID <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  value={data.secondaryApproverId}
                  onChange={(e) => setData(prev => ({ ...prev, secondaryApproverId: e.target.value }))}
                  placeholder="Enter approver employee ID"
                  className={cn(
                    "pl-10 bg-white/5 border",
                    errors.secondaryApproverId ? "border-red-500" : "border-white/10"
                  )}
                />
              </div>
              {errors.secondaryApproverId && (
                <p className="text-sm text-red-400 mt-2">{errors.secondaryApproverId}</p>
              )}
            </div>

            {/* PIN */}
            <div>
              <label className="text-sm font-medium text-gray-400 mb-2 block">
                Approver PIN <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type={showPin ? "text" : "password"}
                  value={data.secondaryApproverPin}
                  onChange={(e) => setData(prev => ({ ...prev, secondaryApproverPin: e.target.value }))}
                  placeholder="Enter 6-digit PIN"
                  maxLength={6}
                  className={cn(
                    "pl-10 pr-10 bg-white/5 border",
                    errors.secondaryApproverPin ? "border-red-500" : "border-white/10"
                  )}
                />
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.secondaryApproverPin && (
                <p className="text-sm text-red-400 mt-2">{errors.secondaryApproverPin}</p>
              )}
            </div>

            {/* Summary */}
            <div className="bg-white/5 rounded-lg p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Settlement ID</span>
                <span className="text-white font-mono">{settlement.settlementId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount</span>
                <span className="text-green-400 font-medium">{formatCurrency(settlement.totals.netPayable)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reason</span>
                <span className="text-white">{selectedReason?.label}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

export default ApprovePayoutModal;
