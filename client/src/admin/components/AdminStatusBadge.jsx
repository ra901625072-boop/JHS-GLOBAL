import React from 'react';

/**
 * AdminStatusBadge — Phase 2
 * 
 * Curated 5-Tier Trade Semantic Status Badge:
 * - Soft-tint backgrounds with WCAG AA compliance (4.5:1+ text contrast)
 * - Static indicator dots (no distracting animate-pulse)
 * - Zero shadows (flat, crisp 1px borders)
 */
export const AdminStatusBadge = ({ status, priority, className = '' }) => {
  if (priority) {
    const priorityConfigs = {
      hot: {
        style: 'bg-[#FEE2E2] text-[#991B1B] border-[#EF444440] font-bold',
        dot: 'bg-[#DC2626]',
      },
      warm: {
        style: 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B40] font-semibold',
        dot: 'bg-[#D97706]',
      },
      cold: {
        style: 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E140] font-medium',
        dot: 'bg-[#64748B]',
      },
    };
    const key = String(priority).toLowerCase();
    const config = priorityConfigs[key] || priorityConfigs.cold;
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-admin-sm text-[10px] border uppercase tracking-wider select-none ${config.style} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
        <span>{priority}</span>
      </span>
    );
  }

  const raw = String(status || '').toLowerCase().trim();

  // Tier 1: Action Required / New / Hot
  const isAction = ['new', 'action_required', 'pending_review', 'hot'].includes(raw);

  // Tier 2: Progress / Active Process / Quoted / In Transit
  const isProgress = [
    'contacted',
    'requirement_confirmed',
    'quotation_preparing',
    'quotation_sent',
    'quoted',
    'negotiation',
    'order_processing',
    'in_production',
    'preparing',
    'booked',
    'dispatched',
    'in_transit',
    'on_water',
    'customs_clearance',
    'sample_dispatched',
    'in_progress',
    'in_review',
  ].includes(raw);

  // Tier 3: Confirmed / Won / Delivered / Active / Feedback Received
  const isSuccess = ['won', 'confirmed', 'completed', 'delivered', 'feedback_received', 'active', 'paid', 'stuffing_completed'].includes(raw);

  // Tier 4: Critical / Lost / Spam / Overdue
  const isDanger = ['lost', 'spam', 'cancelled', 'rejected', 'overdue', 'hold', 'breached'].includes(raw);

  // Styles configuration
  let badgeStyle = 'bg-[#F1F5F9] text-[#334155] border-[#CBD5E140]';
  let dotStyle = 'bg-[#64748B]';

  if (isAction) {
    badgeStyle = 'bg-[#FEF3C7] text-[#92400E] border-[#F59E0B40] font-semibold';
    dotStyle = 'bg-[#D97706]';
  } else if (isProgress) {
    badgeStyle = 'bg-[#E0F2FE] text-[#075985] border-[#0EA5E940] font-semibold';
    dotStyle = 'bg-[#0284C7]';
  } else if (isSuccess) {
    badgeStyle = 'bg-[#D1FAE5] text-[#065F46] border-[#10B98140] font-semibold';
    dotStyle = 'bg-[#059669]';
  } else if (isDanger) {
    badgeStyle = 'bg-[#FEE2E2] text-[#991B1B] border-[#EF444440] font-medium';
    dotStyle = 'bg-[#DC2626]';
  }

  const formatLabel = (str) => {
    return str
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-admin-sm text-[10px] border tracking-wider uppercase font-semibold whitespace-nowrap select-none ${badgeStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
      <span>{formatLabel(raw || 'Unknown')}</span>
    </span>
  );
};

export default AdminStatusBadge;
