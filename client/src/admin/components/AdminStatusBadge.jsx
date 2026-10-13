import React from 'react';

/**
 * AdminStatusBadge
 * 
 * Curated 5-Tier Trade Semantic Status Badge:
 * - action / hot / new: Amber Gold (high urgency)
 * - progress / transit / quoted: Sky / Cobalt (active deal)
 * - confirmed / won / active: Forest Emerald (success)
 * - danger / lost / critical: Rose (lost or canceled)
 * - neutral / cold / draft / archived: Slate Neutral
 */
export const AdminStatusBadge = ({ status, priority, className = '' }) => {
  if (priority) {
    const priorityConfigs = {
      hot: 'bg-rose-50 text-rose-700 border-rose-200/90 font-bold',
      warm: 'bg-amber-50 text-amber-700 border-amber-200/90 font-semibold',
      cold: 'bg-neutral-100 text-neutral-600 border-neutral-200/90 font-medium',
    };
    const key = String(priority).toLowerCase();
    const style = priorityConfigs[key] || priorityConfigs.cold;
    const dotRing = key === 'hot' ? 'bg-rose-500 ring-2 ring-rose-400/30 animate-pulse' : key === 'warm' ? 'bg-amber-500 ring-2 ring-amber-400/30' : 'bg-neutral-400';
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border uppercase tracking-wider select-none ${style} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotRing}`} />
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
    'booked',
    'dispatched',
    'on_water',
    'customs_clearance',
    'sample_dispatched',
    'in_progress',
  ].includes(raw);

  // Tier 3: Confirmed / Won / Delivered / Active
  const isSuccess = ['won', 'confirmed', 'completed', 'delivered', 'active', 'paid', 'stuffing_completed'].includes(raw);

  // Tier 4: Critical / Lost / Spam / Overdue
  const isDanger = ['lost', 'spam', 'cancelled', 'rejected', 'overdue', 'hold'].includes(raw);

  // Styles configuration
  let badgeStyle = 'bg-neutral-100 text-neutral-700 border-neutral-200/80';
  let dotStyle = 'bg-neutral-400';

  if (isAction) {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300 font-semibold shadow-2xs';
    dotStyle = 'bg-amber-500 ring-2 ring-amber-400/30 animate-pulse';
  } else if (isProgress) {
    badgeStyle = 'bg-sky-50 text-sky-800 border-sky-300 font-semibold shadow-2xs';
    dotStyle = 'bg-sky-500 ring-2 ring-sky-400/30';
  } else if (isSuccess) {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-2xs';
    dotStyle = 'bg-emerald-500 ring-2 ring-emerald-400/30';
  } else if (isDanger) {
    badgeStyle = 'bg-rose-50 text-rose-800 border-rose-300 font-medium';
    dotStyle = 'bg-rose-500 ring-2 ring-rose-400/30';
  }

  const formatLabel = (str) => {
    return str
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] border tracking-wider uppercase font-semibold whitespace-nowrap select-none ${badgeStyle} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotStyle}`} />
      <span>{formatLabel(raw || 'Unknown')}</span>
    </span>
  );
};

export default AdminStatusBadge;
