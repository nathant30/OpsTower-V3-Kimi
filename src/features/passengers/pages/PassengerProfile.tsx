import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { XpressCard } from '@/components/ui/XpressCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import {
  usePassenger,
  usePassengerRides,
  usePassengerTickets,
  useUpdatePassengerStatus,
  useSendPassengerMessage,
} from '../hooks/usePassengers';
import type { PassengerStatus } from '@/services/passengers/passengers.service';
import {
  User,
  Star,
  Phone,
  Mail,
  CreditCard,
  Home,
  MapPin,
  AlertCircle,
  MessageSquare,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Shield,
  Send,
  Ban,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const PassengerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: passenger, isLoading: passengerLoading } = usePassenger(id);
  const { data: rides, isLoading: ridesLoading } = usePassengerRides(id);
  const { data: tickets, isLoading: ticketsLoading } = usePassengerTickets(id);
  
  const updateStatus = useUpdatePassengerStatus();
  const sendMessage = useSendPassengerMessage();

  // Modals state
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<PassengerStatus | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [messageText, setMessageText] = useState('');

  if (passengerLoading || !passenger) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0f0f14]">
        <div className="animate-spin w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleStatusChange = (status: PassengerStatus) => {
    setTargetStatus(status);
    setStatusModalOpen(true);
  };

  const confirmStatusChange = () => {
    if (targetStatus && id) {
      updateStatus.mutate(
        { id, status: targetStatus, reason: statusReason },
        {
          onSuccess: () => {
            setStatusModalOpen(false);
            setTargetStatus(null);
            setStatusReason('');
          },
        }
      );
    }
  };

  const handleSendMessage = () => {
    if (messageText.trim() && id) {
      sendMessage.mutate(
        { id, message: messageText },
        {
          onSuccess: () => {
            setMessageModalOpen(false);
            setMessageText('');
          },
        }
      );
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(value);
  };

  const getStatusBadgeVariant = (status: PassengerStatus) => {
    switch (status) {
      case 'active':
        return 'active';
      case 'inactive':
        return 'idle';
      case 'suspended':
        return 'warning';
      case 'banned':
        return 'alert';
      default:
        return 'default';
    }
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getTrustScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full overflow-y-auto bg-[#0f0f14]">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => navigate('/passengers')} icon={<ArrowLeft className="w-4 h-4" />}>
          Back to Passengers
        </Button>

        {/* Profile Header */}
        <XpressCard>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center flex-shrink-0">
                  {passenger.photo ? (
                    <img src={passenger.photo} alt="" className="w-20 h-20 rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-orange-400">
                      {passenger.firstName[0]}{passenger.lastName[0]}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {passenger.firstName} {passenger.lastName}
                  </h1>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant={getStatusBadgeVariant(passenger.status)} className="capitalize">
                      {passenger.status}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-gray-400">{passenger.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-sm text-gray-400">{passenger.id}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Mail className="w-4 h-4" />
                      {passenger.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-400">
                      <Phone className="w-4 h-4" />
                      {passenger.phone}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessageModalOpen(true)}
                  icon={<MessageSquare className="w-4 h-4" />}
                >
                  Send Message
                </Button>
                {passenger.status === 'active' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('suspended')}
                      icon={<PauseCircle className="w-4 h-4" />}
                      className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                    >
                      Suspend
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStatusChange('banned')}
                      icon={<Ban className="w-4 h-4" />}
                      className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                    >
                      Ban
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('active')}
                    icon={<PlayCircle className="w-4 h-4" />}
                  >
                    Reactivate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </XpressCard>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <XpressCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total Rides</span>
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-white">{passenger.totalRides}</p>
            </div>
          </XpressCard>
          <XpressCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total Spent</span>
                <TrendingUp className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(passenger.totalSpent)}</p>
            </div>
          </XpressCard>
          <XpressCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Member Since</span>
                <Calendar className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-white">
                {new Date(passenger.joinedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </XpressCard>
          <XpressCard>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Trust Score</span>
                <Shield className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex items-center gap-2">
                <p className={cn('text-2xl font-bold', getTrustScoreColor(passenger.trustScore))}>
                  {passenger.trustScore}
                </p>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', getTrustScoreBg(passenger.trustScore))}
                    style={{ width: `${passenger.trustScore}%` }}
                  />
                </div>
              </div>
            </div>
          </XpressCard>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Trip History */}
          <div className="lg:col-span-2 space-y-6">
            <XpressCard title="Recent Rides" icon={<MapPin className="w-5 h-5" />}>
              <div className="overflow-x-auto">
                {ridesLoading ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
                  </div>
                ) : rides && rides.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500 border-b border-gray-800">
                        <th className="pb-3 pl-4">Date</th>
                        <th className="pb-3">From</th>
                        <th className="pb-3">To</th>
                        <th className="pb-3">Service</th>
                        <th className="pb-3">Fare</th>
                        <th className="pb-3">Driver</th>
                        <th className="pb-3 pr-4">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rides.map((ride) => (
                        <tr key={ride.id} className="border-b border-gray-800 text-sm hover:bg-gray-900/50">
                          <td className="py-3 pl-4 text-gray-400">
                            {new Date(ride.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-white">{ride.from}</td>
                          <td className="py-3 text-white">{ride.to}</td>
                          <td className="py-3">
                            <Badge variant="default">{ride.serviceType}</Badge>
                          </td>
                          <td className="py-3 text-white">{formatCurrency(ride.fare)}</td>
                          <td className="py-3 text-gray-400">{ride.driverName}</td>
                          <td className="py-3 pr-4">
                            {ride.rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                <span className="text-white">{ride.rating}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No ride history available</p>
                  </div>
                )}
              </div>
            </XpressCard>

            {/* Support Tickets */}
            <XpressCard title="Support History" icon={<MessageSquare className="w-5 h-5" />}>
              {ticketsLoading ? (
                <div className="py-8 flex justify-center">
                  <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full" />
                </div>
              ) : tickets && tickets.length > 0 ? (
                <div className="divide-y divide-gray-800">
                  {tickets.map((ticket) => (
                    <div key={ticket.id} className="py-3 px-4 flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">{ticket.subject}</p>
                        <p className="text-xs text-gray-500">
                          {ticket.id} • {new Date(ticket.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            ticket.status === 'open'
                              ? 'warning'
                              : ticket.status === 'resolved'
                              ? 'active'
                              : 'default'
                          }
                        >
                          {ticket.status}
                        </Badge>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            ticket.priority === 'urgent'
                              ? 'bg-red-500/20 text-red-400'
                              : ticket.priority === 'high'
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-gray-700 text-gray-400'
                          )}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No support tickets</p>
                </div>
              )}
            </XpressCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Payment Methods */}
            <XpressCard title="Payment Methods" icon={<CreditCard className="w-5 h-5" />}>
              {passenger.paymentMethods && passenger.paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {passenger.paymentMethods.map((method, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-[#0f0f14] rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{method.type}</p>
                          <p className="text-xs text-gray-500">•••• {method.last4}</p>
                        </div>
                      </div>
                      {method.isDefault && <Badge variant="active">Default</Badge>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-2">No payment methods on file</p>
              )}
            </XpressCard>

            {/* Saved Addresses */}
            <XpressCard title="Saved Addresses" icon={<Home className="w-5 h-5" />}>
              {passenger.savedAddresses && passenger.savedAddresses.length > 0 ? (
                <div className="space-y-3">
                  {passenger.savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className="p-3 bg-[#0f0f14] rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-3 h-3 text-orange-400" />
                        <span className="text-sm font-medium text-white">{address.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{address.address}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm py-2">No saved addresses</p>
              )}
            </XpressCard>

            {/* Preferences */}
            <XpressCard title="Preferences" icon={<User className="w-5 h-5" />}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Preferred Service</span>
                  <span className="text-sm text-white font-medium">
                    {passenger.preferredServiceType || 'None set'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Last Ride</span>
                  <span className="text-sm text-white font-medium">
                    {passenger.lastRideAt
                      ? new Date(passenger.lastRideAt).toLocaleDateString()
                      : 'Never'}
                  </span>
                </div>
              </div>
            </XpressCard>
          </div>
        </div>
      </div>

      {/* Status Change Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setTargetStatus(null);
          setStatusReason('');
        }}
        title={`${targetStatus === 'active' ? 'Reactivate' : targetStatus ? targetStatus.charAt(0).toUpperCase() + targetStatus.slice(1) : ''} Account`}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setStatusModalOpen(false);
                setTargetStatus(null);
                setStatusReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={updateStatus.isPending || !statusReason.trim()}
              variant={targetStatus === 'banned' ? 'danger' : 'primary'}
              loading={updateStatus.isPending}
            >
              Confirm
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-medium">
                You are about to {targetStatus === 'active' ? 'reactivate' : targetStatus} the account for:
              </p>
              <p className="text-orange-400 font-semibold mt-1">
                {passenger.firstName} {passenger.lastName}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-2">
              Reason for {targetStatus === 'active' ? 'reactivation' : targetStatus}
              <span className="text-red-400">*</span>
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder="Enter the reason for this status change..."
              className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              rows={3}
            />
          </div>
          {targetStatus === 'banned' && (
            <p className="text-xs text-red-400">
              Warning: Banning a passenger will prevent them from using the platform. This action should be used for serious violations only.
            </p>
          )}
        </div>
      </Modal>

      {/* Send Message Modal */}
      <Modal
        isOpen={messageModalOpen}
        onClose={() => {
          setMessageModalOpen(false);
          setMessageText('');
        }}
        title={`Send Message to ${passenger.firstName}`}
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setMessageModalOpen(false);
                setMessageText('');
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={sendMessage.isPending || !messageText.trim()}
              icon={<Send className="w-4 h-4" />}
              loading={sendMessage.isPending}
            >
              Send Message
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 block mb-2">Message</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={`Type your message to ${passenger.firstName}...`}
              className="w-full bg-[#0f0f14] border border-gray-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-orange-500 resize-none"
              rows={5}
            />
          </div>
          <p className="text-xs text-gray-500">
            This message will be sent via email and in-app notification.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default PassengerProfile;
