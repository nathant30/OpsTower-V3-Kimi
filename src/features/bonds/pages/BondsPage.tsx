// src/features/bonds/pages/BondsPage.tsx
// Driver Bond Management

import { useState } from 'react';
import { useBondTransactions, useLowBondDrivers, useBondStats, useCreateDeposit } from '@/features/bonds/hooks/useBonds';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { XpressCard as Card } from '@/components/ui/XpressCard';
import { Modal } from '@/components/ui/Modal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { cn } from '@/lib/utils/cn';
import { format } from 'date-fns';
import { 
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  Users,
  TrendingUp,
  Filter,
  Plus,
  Minus
} from 'lucide-react';

const TRANSACTION_TYPES = {
  DEPOSIT: { label: 'Deposit', color: 'text-green-400', icon: ArrowUpCircle },
  WITHDRAWAL: { label: 'Withdrawal', color: 'text-amber-400', icon: ArrowDownCircle },
  DEDUCTION: { label: 'Deduction', color: 'text-red-400', icon: Minus },
  REFUND: { label: 'Refund', color: 'text-blue-400', icon: Plus },
};

export default function BondsPage() {
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  
  const { data: transactions, isLoading: txLoading } = useBondTransactions(
    { driverId: selectedDriver, type: filterType },
    1,
    50
  );
  const { data: lowBondDrivers } = useLowBondDrivers();
  const { data: stats } = useBondStats();
  const depositMutation = useCreateDeposit();

  const txList = transactions?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bond Management</h1>
          <p className="text-gray-400">Driver security bond tracking and transactions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setShowDepositModal(true)}>
            New Deposit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard 
          label="Total Bond Balance" 
          value={`₱${(stats?.totalBalance || 0).toLocaleString()}`}
          icon={Wallet} 
          color="blue" 
        />
        <StatCard 
          label="Active Drivers" 
          value={stats?.activeDriverCount || 0}
          icon={Users} 
          color="green" 
        />
        <StatCard 
          label="Low Balance Alerts" 
          value={lowBondDrivers?.length || 0}
          icon={AlertTriangle} 
          color="amber"
          alert={lowBondDrivers && lowBondDrivers.length > 0}
        />
        <StatCard 
          label="Avg Balance/Driver" 
          value={`₱${Math.round(stats?.averageBalance || 0).toLocaleString()}`}
          icon={TrendingUp} 
          color="emerald" 
        />
      </div>

      {/* Low Balance Alerts */}
      {lowBondDrivers && lowBondDrivers.length > 0 && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/20">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-semibold text-amber-400">Low Bond Balance Alerts</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {lowBondDrivers.slice(0, 6).map((driver: any) => (
              <div 
                key={driver.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-medium text-white">
                    {driver.firstName?.[0]}{driver.lastName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{driver.firstName} {driver.lastName}</p>
                    <p className="text-xs text-gray-400">
                      Required: ₱{Number(driver.securityBondRequired).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-red-400">
                    ₱{Number(driver.securityBondBalance).toLocaleString()}
                  </p>
                  <p className="text-xs text-red-400/70">
                    {((Number(driver.securityBondBalance) / Number(driver.securityBondRequired)) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-[#12121a] border border-white/10">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="drivers">Driver Balances</TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 p-4 bg-[#12121a] border border-white/10 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter:</span>
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300"
            >
              <option value="">All Types</option>
              <option value="DEPOSIT">Deposits</option>
              <option value="WITHDRAWAL">Withdrawals</option>
              <option value="DEDUCTION">Deductions</option>
              <option value="REFUND">Refunds</option>
            </select>

            <input
              type="text"
              placeholder="Search driver..."
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 w-64"
            />
          </div>

          {/* Transactions Table */}
          <div className="bg-[#12121a] border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">Balance After</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {txLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : txList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  txList.map((tx: any) => {
                    const typeConfig = TRANSACTION_TYPES[tx.type as keyof typeof TRANSACTION_TYPES] || TRANSACTION_TYPES.DEPOSIT;
                    const TypeIcon = typeConfig.icon;
                    
                    return (
                      <tr key={tx.id} className="hover:bg-white/5">
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-300">
                            {format(new Date(tx.createdAt), 'MMM d, yyyy')}
                          </span>
                          <p className="text-xs text-gray-500">
                            {format(new Date(tx.createdAt), 'h:mm a')}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-white">{tx.driver?.firstName} {tx.driver?.lastName}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <TypeIcon className={cn("w-4 h-4", typeConfig.color)} />
                            <Badge variant="default" className={cn("text-xs", typeConfig.color)}>
                              {typeConfig.label}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "text-sm font-medium",
                            tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? "text-green-400" : "text-red-400"
                          )}>
                            {tx.type === 'DEPOSIT' || tx.type === 'REFUND' ? '+' : '-'}
                            ₱{Number(tx.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-sm text-gray-300">
                            ₱{Number(tx.balanceAfter).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-400">{tx.description}</span>
                          {tx.referenceType && (
                            <p className="text-xs text-gray-500">{tx.referenceType}</p>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Driver Balances Tab */}
        <TabsContent value="drivers" className="space-y-4">
          <div className="bg-[#12121a] border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Driver Bond Status</h3>
            
            {stats?.driverBalances && stats.driverBalances.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {stats.driverBalances.map((driver: any) => {
                  const percent = (Number(driver.balance) / Number(driver.required)) * 100;
                  const status = percent >= 100 ? 'OK' : percent >= 50 ? 'LOW' : 'CRITICAL';
                  
                  return (
                    <div key={driver.driverId} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white",
                          status === 'OK' ? "bg-green-500" : status === 'LOW' ? "bg-amber-500" : "bg-red-500"
                        )}>
                          {driver.driverName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{driver.driverName}</p>
                          <p className="text-xs text-gray-400">
                            Required: ₱{Number(driver.required).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          status === 'OK' ? "text-green-400" : status === 'LOW' ? "text-amber-400" : "text-red-400"
                        )}>
                          ₱{Number(driver.balance).toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full rounded-full",
                                status === 'OK' ? "bg-green-500" : status === 'LOW' ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{percent.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No driver balance data available</p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* New Deposit Modal */}
      <Modal 
        isOpen={showDepositModal} 
        onClose={() => setShowDepositModal(false)} 
        title="New Bond Deposit"
        size="md"
      >
        <NewDepositForm 
          onSubmit={(data) => {
            depositMutation.mutate(data, {
              onSuccess: () => setShowDepositModal(false),
            });
          }}
          onCancel={() => setShowDepositModal(false)}
          isSubmitting={depositMutation.isPending}
        />
      </Modal>
    </div>
  );
}

// New Deposit Form
function NewDepositForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting 
}: { 
  onSubmit: (data: { driverId: string; amount: number; reference?: string }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const [driverId, setDriverId] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      driverId,
      amount: Number(amount),
      reference: reference || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-400 mb-1">Driver ID</label>
        <input
          type="text"
          value={driverId}
          onChange={(e) => setDriverId(e.target.value)}
          placeholder="e.g., D001"
          className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Amount (₱)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="5000"
          min="1"
          className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm text-gray-400 mb-1">Reference (optional)</label>
        <input
          type="text"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Transaction reference"
          className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/10 rounded-lg text-white text-sm"
        />
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="ghost" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={isSubmitting}>
          Create Deposit
        </Button>
      </div>
    </form>
  );
}

// Components
function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  color,
  alert
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  color: string;
  alert?: boolean;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    red: 'bg-red-500/10 text-red-400',
  };

  return (
    <Card className={cn(
      "p-4 bg-[#12121a] border-white/10",
      alert && "border-amber-500/50"
    )}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2 rounded-lg", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </Card>
  );
}
