import React from 'react';
import { Helmet } from 'react-helmet-async';
import { ShieldCheck, Clock, ArrowRight, Construction } from 'lucide-react';

export const ModulePlaceholder = ({
  title,
  subtitle,
  icon: Icon = Construction,
  group = 'Operations',
  phaseStep = 'Upcoming Phase Step',
  features = [],
}) => {
  return (
    <>
      <Helmet>
        <title>{title} — JHS GLOBAL Admin Suite</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-200/80 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-900" />
              <span>{group.toUpperCase()} • {phaseStep.toUpperCase()}</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight flex items-center gap-3">
              {Icon && <Icon className="w-7 h-7 text-neutral-700 shrink-0" />}
              <span>{title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-2xl">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Empty / Pipeline Staging Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-subtle">
          <div className="w-16 h-16 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto mb-4 text-neutral-700 shadow-2xs">
            {Icon && <Icon className="w-8 h-8" />}
          </div>
          <h2 className="font-serif text-xl font-bold text-neutral-900 mb-2">
            {title} Module Ready for Execution
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto mb-6">
            Architectural specifications, RBAC rules, data schemas, and API contracts for this module have been verified in Phase 1. Implementation is scheduled for {phaseStep}.
          </p>

          {features.length > 0 && (
            <div className="text-left bg-neutral-50 rounded-xl p-5 border border-neutral-100 max-w-md mx-auto space-y-2 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-600 mb-2">
                Planned Administrative Capabilities:
              </p>
              {features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-neutral-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-700 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          )}

          <div className="inline-flex items-center gap-2 text-xs font-medium text-neutral-400">
            <Clock className="w-4 h-4" />
            <span>Scheduled in sequential Ralph autonomous build loop</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModulePlaceholder;
