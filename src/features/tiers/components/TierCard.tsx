/**
 * Tier Card Component
 * Displays tier information with benefits and requirements
 */

import { 
  Crown, 
  Star, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Clock,
  Wallet,
  Award,
  CheckCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { XpressCard } from '@/components/ui/XpressCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { Tier, TierLevel } from '@/features/tiers/types';
import { 
  getTierBadgeClasses, 
  getTierIcon, 
  getTierLabel,
  getPriorityLabel,
} from '../hooks/useTiers';

interface TierCardProps {
  tier: Tier;
  driverCount?: number;
  isActive?: boolean;
  showActions?: boolean;
  onEdit?: (tier: Tier) => void;
  onDelete?: (tier: Tier) => void;
  onClick?: (tier: Tier) => void;
  className?: string;
}

// Requirement item component
function RequirementItem({ 
  icon: Icon, 
  label, 
  value,
  met,
}: { 
  icon: any;
  label: string;
  value: string;
  met?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 text-sm ${met === false ? 'text-red-400' : 'text-gray-400'}`}>
      <Icon className="w-4 h-4" />
      <span>{label}:</span>
      <span className={`font-medium ${met === false ? 'text-red-400' : 'text-white'}`}>
        {value}
      </span>
      {met !== undefined && (
        met ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <span className="text-xs text-red-400">(Not met)</span>
        )
      )}
    </div>
  );
}

// Benefit item component
function BenefitItem({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-300">
      <Icon className="w-4 h-4 text-green-400" />
      <span>{text}</span>
    </div>
  );
}

// Main Tier Card
export function TierCard({
  tier,
  driverCount,
  isActive,
  showActions = false,
  onEdit,
  onDelete,
  onClick,
  className,
}: TierCardProps) {
  const badgeClasses = getTierBadgeClasses(tier.level);
  const tierIcon = getTierIcon(tier.level);

  return (
    <XpressCard
      className={`${className || ''} ${isActive ? 'ring-2 ring-blue-500/50' : ''} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(tier)}
      headerAction={showActions ? (
        <div className="flex gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tier);
              }}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-400 hover:text-red-300"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(tier);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ) : undefined}
    >
      {/* Tier Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ 
              backgroundColor: `${tier.color}20`,
              border: `2px solid ${tier.color}40`,
            }}
          >
            {tierIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">{tier.name}</h3>
              <Badge className={badgeClasses}>{getTierLabel(tier.level)}</Badge>
            </div>
            <p className="text-sm text-gray-500">{tier.description}</p>
          </div>
        </div>
        {driverCount !== undefined && (
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{driverCount}</div>
            <div className="text-xs text-gray-500">drivers</div>
          </div>
        )}
      </div>

      {/* Requirements Section */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
          <Award className="w-4 h-4" />
          Requirements
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <RequirementItem
            icon={TrendingUp}
            label="Min Trips"
            value={tier.requirements?.minTrips?.toString() ?? '0'}
          />
          <RequirementItem
            icon={Star}
            label="Min Rating"
            value={tier.requirements?.minRating?.toString() ?? '0'}
          />
          <RequirementItem
            icon={CheckCircle}
            label="Completion"
            value={`${tier.requirements.minCompletionRate}%`}
          />
          <RequirementItem
            icon={Users}
            label="Acceptance"
            value={`${tier.requirements.minAcceptanceRate}%`}
          />
          <RequirementItem
            icon={Clock}
            label="Account Age"
            value={`${tier.requirements.minAccountAgeDays} days`}
          />
          <RequirementItem
            icon={Wallet}
            label="Min Earnings"
            value={`₱${(tier.requirements?.minEarnings ?? 0).toLocaleString()}`}
          />
        </div>
      </div>

      {/* Benefits Section */}
      <div>
        <h4 className="text-sm font-semibold text-gray-400 mb-2 flex items-center gap-2">
          <Crown className="w-4 h-4" />
          Benefits
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <BenefitItem
            icon={Wallet}
            text={`${tier.benefits.commissionRate}% commission`}
          />
          <BenefitItem
            icon={Zap}
            text={`${getPriorityLabel(tier.benefits.priorityLevel)} priority`}
          />
          <BenefitItem
            icon={TrendingUp}
            text={`${tier.benefits.bonusMultiplier}x bonus`}
          />
          {tier.benefits.guaranteedHourlyRate && (
            <BenefitItem
              icon={Clock}
              text={`₱${tier.benefits.guaranteedHourlyRate}/hr guarantee`}
            />
          )}
          {tier.benefits.prioritySupport && (
            <BenefitItem
              icon={Shield}
              text="Priority support"
            />
          )}
          {tier.benefits.instantPayout && (
            <BenefitItem
              icon={Wallet}
              text="Instant payout"
            />
          )}
        </div>
        {tier.benefits.perks.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {tier.benefits.perks.map((perk, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/30"
              >
                {perk}
              </span>
            ))}
          </div>
        )}
      </div>
    </XpressCard>
  );
}

// Compact tier card for lists
export function TierCardCompact({
  tier,
  driverCount,
  isSelected,
  onClick,
}: {
  tier: Tier;
  driverCount?: number;
  isSelected?: boolean;
  onClick?: () => void;
}) {
  const badgeClasses = getTierBadgeClasses(tier.level);

  return (
    <div
      onClick={onClick}
      className={`
        p-4 rounded-lg border transition-all cursor-pointer
        ${isSelected 
          ? 'bg-blue-500/10 border-blue-500/50' 
          : 'bg-[#12121a] border-white/10 hover:border-white/20'
        }
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{
              backgroundColor: `${tier.color}20`,
              border: `1px solid ${tier.color}40`,
            }}
          >
            {getTierIcon(tier.level)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white">{tier.name}</span>
              <Badge className={`${badgeClasses} text-xs`}>
                {getTierLabel(tier.level)}
              </Badge>
            </div>
            <div className="text-xs text-gray-500">
              {tier.benefits.commissionRate}% commission • {tier.requirements.minTrips}+ trips
            </div>
          </div>
        </div>
        {driverCount !== undefined && (
          <div className="text-right">
            <div className="text-lg font-semibold text-white">{driverCount}</div>
            <div className="text-xs text-gray-500">drivers</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tier badge for inline display
export function TierBadge({ 
  level, 
  showIcon = true,
  size = 'md',
}: { 
  level: TierLevel;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const badgeClasses = getTierBadgeClasses(level);
  const icon = getTierIcon(level);
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${badgeClasses} ${sizeClasses[size]}`}>
      {showIcon && <span>{icon}</span>}
      <span className="font-medium">{getTierLabel(level)}</span>
    </span>
  );
}

// Tier progress bar
export function TierProgressBar({
  currentTier,
  nextTier,
  progress,
  missingRequirements,
}: {
  currentTier: TierLevel;
  nextTier?: TierLevel;
  progress: number;
  missingRequirements?: string[];
}) {
  const currentColor = getTierBadgeClasses(currentTier);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Progress to {nextTier || 'next tier'}</span>
        <span className="text-white font-medium">{progress}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {missingRequirements && missingRequirements.length > 0 && (
        <div className="text-xs text-gray-500">
          Missing: {missingRequirements.join(', ')}
        </div>
      )}
    </div>
  );
}

export default TierCard;
