import { useState } from 'react';
import { Button } from '@/components/ui/Button';

import { Table, type Column } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDateTime } from '@/lib/utils/date';
import type { Wallet } from '@/types/domain.types';
import {
  Clock,
  Wallet as WalletIcon,
  ArrowDownLeft,
  ArrowUpRight,
  Lock,
  Unlock,
  Plus,
  Minus,
  History,
  User,
  Truck,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface WalletViewerProps {
  wallets: Wallet[];
  isLoading: boolean;
  onAdjust?: (wallet: Wallet, amount: number, reason: string, type: 'Credit' | 'Debit') => void;
  onToggleFreeze?: (wallet: Wallet, frozen: boolean, reason: string) => void;
  onReleaseHeld?: (wallet: Wallet, amount?: number) => void;
}

interface WalletTransaction {
  transactionId: string;
  type: 'Credit' | 'Debit';
  amount: number;
  description: string;
  balanceAfter: number;
  timestamp: string;
}

export function WalletViewer({ 
  wallets, 
  isLoading, 
  onAdjust,
  onToggleFreeze,
  onReleaseHeld 
}: WalletViewerProps) {
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isFreezeModalOpen, setIsFreezeModalOpen] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustType, setAdjustType] = useState<'Credit' | 'Debit'>('Credit');
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeAction, setFreezeAction] = useState<'freeze' | 'unfreeze'>('freeze');

  const columns: Column<Wallet>[] = [
    {
      key: 'walletId',
      header: 'Wallet ID',
      accessor: (row) => row.walletId,
      render: (value) => (
        <span className="font-mono text-xpress-accent-blue">{String(value)}</span>
      ),
      sortable: true,
      width: '130px',
    },
    {
      key: 'userId',
      header: 'User',
      accessor: (row) => row.userId,
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-xpress-bg-elevated flex items-center justify-center">
            {row.userType === 'Driver' ? (
              <Truck className="w-4 h-4 text-xpress-text-secondary" />
            ) : (
              <User className="w-4 h-4 text-xpress-text-secondary" />
            )}
          </div>
          <div>
            <span className="font-mono text-xpress-text-primary">{String(value)}</span>
            <p className="text-xs text-xpress-text-muted">{row.userType}</p>
          </div>
        </div>
      ),
      sortable: true,
      width: '160px',
    },
    {
      key: 'available',
      header: 'Available',
      accessor: (row) => row.balance.available,
      render: (value) => (
        <span className="font-semibold text-xpress-accent-green">
          {formatCurrency(Number(value))}
        </span>
      ),
      align: 'right',
      sortable: true,
      width: '120px',
    },
    {
      key: 'pending',
      header: 'Pending',
      accessor: (row) => row.balance.pending,
      render: (value) => (
        <span className="text-xpress-accent-amber">
          {formatCurrency(Number(value))}
        </span>
      ),
      align: 'right',
      sortable: true,
      width: '100px',
    },
    {
      key: 'held',
      header: 'Held',
      accessor: (row) => row.balance.held,
      render: (value, row) => (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xpress-accent-red">
            {formatCurrency(Number(value))}
          </span>
          {Number(value) > 0 && onReleaseHeld && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onReleaseHeld(row);
              }}
              title="Release held funds"
            >
              <Unlock className="w-3 h-3 text-xpress-text-muted hover:text-xpress-accent-green" />
            </Button>
          )}
        </div>
      ),
      align: 'right',
      sortable: true,
      width: '110px',
    },
    {
      key: 'total',
      header: 'Total',
      accessor: (row) => row.balance.available + row.balance.pending + row.balance.held,
      render: (value) => (
        <span className="font-semibold text-xpress-text-primary">
          {formatCurrency(Number(value))}
        </span>
      ),
      align: 'right',
      sortable: true,
      width: '120px',
    },
    {
      key: 'limits',
      header: 'Limits',
      accessor: (row) => row.limits.maxWithdrawal,
      render: (_, row) => (
        <div className="text-xs text-xpress-text-muted">
          <p>Min: {formatCurrency(row.limits.minWithdrawal)}</p>
          <p>Max: {formatCurrency(row.limits.maxWithdrawal)}</p>
        </div>
      ),
      sortable: true,
      width: '120px',
    },
    {
      key: 'lastTransaction',
      header: 'Last Activity',
      accessor: (row) => row.lastTransaction?.timestamp || '',
      render: (_, row) => row.lastTransaction ? (
        <div className="flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-xpress-text-muted" />
          <div>
            <span className="text-xpress-text-secondary text-sm">
              {formatCurrency(row.lastTransaction.amount)}
            </span>
            <p className="text-xs text-xpress-text-muted">
              {new Date(row.lastTransaction.timestamp).toLocaleDateString()}
            </p>
          </div>
        </div>
      ) : (
        <span className="text-xpress-text-muted">-</span>
      ),
      sortable: true,
      width: '140px',
    },
  ];

  const handleAdjust = () => {
    if (selectedWallet && onAdjust && adjustAmount && adjustReason) {
      onAdjust(selectedWallet, parseFloat(adjustAmount), adjustReason, adjustType);
      setIsAdjustModalOpen(false);
      setAdjustAmount('');
      setAdjustReason('');
    }
  };

  const handleFreeze = () => {
    if (selectedWallet && onToggleFreeze && freezeReason) {
      onToggleFreeze(selectedWallet, freezeAction === 'freeze', freezeReason);
      setIsFreezeModalOpen(false);
      setFreezeReason('');
    }
  };

  // Mock transactions for the selected wallet
  const mockTransactions: WalletTransaction[] = selectedWallet ? [
    {
      transactionId: 'TXN001',
      type: 'Credit',
      amount: 1500,
      description: 'Trip earnings - ORD12345',
      balanceAfter: 8500,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      transactionId: 'TXN002',
      type: 'Debit',
      amount: 500,
      description: 'Cash out to GCash',
      balanceAfter: 7000,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      transactionId: 'TXN003',
      type: 'Credit',
      amount: 2000,
      description: 'Trip earnings - ORD12346',
      balanceAfter: 7500,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    },
  ] : [];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="kpi-label">Total Wallets</p>
              <p className="kpi-value">{wallets.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-xpress-accent-blue/10 text-xpress-accent-blue">
              <WalletIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="kpi-label">Available Balance</p>
              <p className="kpi-value">
                {formatCurrency(wallets.reduce((sum, w) => sum + w.balance.available, 0))}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-xpress-accent-green/10 text-xpress-accent-green">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="kpi-label">Pending</p>
              <p className="kpi-value">
                {formatCurrency(wallets.reduce((sum, w) => sum + w.balance.pending, 0))}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-xpress-accent-amber/10 text-xpress-accent-amber">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>
        
        <div className="kpi-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="kpi-label">Held</p>
              <p className="kpi-value">
                {formatCurrency(wallets.reduce((sum, w) => sum + w.balance.held, 0))}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-xpress-accent-red/10 text-xpress-accent-red">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-xpress-text-primary">
          Wallet Balances
        </h3>
        <div className="flex items-center gap-2">
          {onAdjust && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsAdjustModalOpen(true)}
            >
              Adjust Balance
            </Button>
          )}
          {onToggleFreeze && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Lock className="w-4 h-4" />}
              onClick={() => setIsFreezeModalOpen(true)}
            >
              Freeze/Unfreeze
            </Button>
          )}
        </div>
      </div>

      {/* Wallets Table */}
      <div className="xpress-card overflow-hidden">
        <Table
          data={wallets}
          columns={columns}
          loading={isLoading}
          getRowId={(row) => row.walletId}
          onRowClick={(row) => setSelectedWallet(row)}
          emptyMessage="No wallets found"
        />
      </div>

      {/* Wallet Detail Modal */}
      <Modal
        isOpen={!!selectedWallet && !isAdjustModalOpen && !isFreezeModalOpen}
        onClose={() => setSelectedWallet(null)}
        title="Wallet Details"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setSelectedWallet(null)}>
              Close
            </Button>
            {onAdjust && (
              <Button 
                variant="primary" 
                onClick={() => setIsAdjustModalOpen(true)}
              >
                Adjust Balance
              </Button>
            )}
          </div>
        }
      >
        {selectedWallet && (
          <div className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-xpress-bg-secondary rounded-lg p-4 text-center">
                <p className="text-xs text-xpress-text-muted uppercase tracking-wider">Available</p>
                <p className="text-xl font-bold text-xpress-accent-green mt-1">
                  {formatCurrency(selectedWallet.balance.available)}
                </p>
              </div>
              <div className="bg-xpress-bg-secondary rounded-lg p-4 text-center">
                <p className="text-xs text-xpress-text-muted uppercase tracking-wider">Pending</p>
                <p className="text-xl font-bold text-xpress-accent-amber mt-1">
                  {formatCurrency(selectedWallet.balance.pending)}
                </p>
              </div>
              <div className="bg-xpress-bg-secondary rounded-lg p-4 text-center">
                <p className="text-xs text-xpress-text-muted uppercase tracking-wider">Held</p>
                <p className="text-xl font-bold text-xpress-accent-red mt-1">
                  {formatCurrency(selectedWallet.balance.held)}
                </p>
              </div>
            </div>

            {/* Limits */}
            <div className="p-4 bg-xpress-bg-secondary rounded-lg">
              <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Withdrawal Limits</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-xpress-text-muted">Minimum</span>
                  <span className="text-xpress-text-primary">{formatCurrency(selectedWallet.limits.minWithdrawal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xpress-text-muted">Maximum</span>
                  <span className="text-xpress-text-primary">{formatCurrency(selectedWallet.limits.maxWithdrawal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xpress-text-muted">Daily Limit</span>
                  <span className="text-xpress-text-primary">{formatCurrency(selectedWallet.limits.dailyWithdrawal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xpress-text-muted">Max Balance</span>
                  <span className="text-xpress-text-primary">{formatCurrency(selectedWallet.limits.maxBalance)}</span>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="text-sm font-medium text-xpress-text-secondary mb-3">Recent Transactions</h4>
              <div className="space-y-2">
                {mockTransactions.map((txn) => (
                  <div 
                    key={txn.transactionId} 
                    className="flex items-center justify-between p-3 bg-xpress-bg-secondary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${txn.type === 'Credit' ? 'bg-xpress-accent-green/10 text-xpress-accent-green' : 'bg-xpress-accent-red/10 text-xpress-accent-red'}`}>
                        {txn.type === 'Credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-xpress-text-primary">{txn.description}</p>
                        <p className="text-xs text-xpress-text-muted">{formatDateTime(txn.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${txn.type === 'Credit' ? 'text-xpress-accent-green' : 'text-xpress-accent-red'}`}>
                        {txn.type === 'Credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </p>
                      <p className="text-xs text-xpress-text-muted">Bal: {formatCurrency(txn.balanceAfter)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Adjust Balance Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Wallet Balance"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsAdjustModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAdjust}>
              Confirm Adjustment
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {selectedWallet && (
            <div className="p-4 bg-xpress-bg-secondary rounded-lg">
              <p className="text-sm text-xpress-text-muted">Current Balance</p>
              <p className="text-2xl font-bold text-xpress-text-primary">
                {formatCurrency(selectedWallet.balance.available)}
              </p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">Adjustment Type</label>
            <div className="flex gap-2">
              <Button
                variant={adjustType === 'Credit' ? 'primary' : 'secondary'}
                onClick={() => setAdjustType('Credit')}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Credit (Add)
              </Button>
              <Button
                variant={adjustType === 'Debit' ? 'primary' : 'secondary'}
                onClick={() => setAdjustType('Debit')}
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Debit (Deduct)
              </Button>
            </div>
          </div>
          
          <Input
            label="Amount (₱)"
            type="number"
            placeholder="0.00"
            value={adjustAmount}
            onChange={(e) => setAdjustAmount(e.target.value)}
            icon={<CreditCard className="w-4 h-4" />}
          />
          
          <Input
            label="Reason"
            placeholder="Enter reason for adjustment..."
            value={adjustReason}
            onChange={(e) => setAdjustReason(e.target.value)}
          />
        </div>
      </Modal>

      {/* Freeze Modal */}
      <Modal
        isOpen={isFreezeModalOpen}
        onClose={() => setIsFreezeModalOpen(false)}
        title="Freeze/Unfreeze Wallet"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsFreezeModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant={freezeAction === 'freeze' ? 'danger' : 'primary'} 
              onClick={handleFreeze}
            >
              {freezeAction === 'freeze' ? (
                <><Lock className="w-4 h-4 mr-2" /> Freeze Wallet</>
              ) : (
                <><Unlock className="w-4 h-4 mr-2" /> Unfreeze Wallet</>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-xpress-text-secondary mb-2 block">Action</label>
            <div className="flex gap-2">
              <Button
                variant={freezeAction === 'freeze' ? 'danger' : 'secondary'}
                onClick={() => setFreezeAction('freeze')}
                className="flex-1"
              >
                <Lock className="w-4 h-4 mr-2" />
                Freeze
              </Button>
              <Button
                variant={freezeAction === 'unfreeze' ? 'primary' : 'secondary'}
                onClick={() => setFreezeAction('unfreeze')}
                className="flex-1"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Unfreeze
              </Button>
            </div>
          </div>
          
          <Input
            label="Reason"
            placeholder={`Enter reason for ${freezeAction}ing wallet...`}
            value={freezeReason}
            onChange={(e) => setFreezeReason(e.target.value)}
          />
          
          {freezeAction === 'freeze' && (
            <div className="p-3 bg-xpress-accent-red/10 border border-xpress-accent-red/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-xpress-accent-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-xpress-accent-red">
                Freezing a wallet will prevent the user from making any withdrawals or payments. Use with caution.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default WalletViewer;
