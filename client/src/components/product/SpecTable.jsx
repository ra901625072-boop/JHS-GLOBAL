import React from 'react';
import Reveal from '../ui/Reveal';

export const SpecTable = ({ specs = [], title = 'Technical Quality Specifications' }) => {
  if (!specs || specs.length === 0) {
    return (
      <div className="p-4 rounded-lg bg-surface-subtle border border-surface-border text-xs text-neutral-500">
        Standard export specifications available upon formal RFQ request.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-surface-border bg-white shadow-subtle">
      <div className="bg-surface-subtle px-4 sm:px-5 py-3 border-b border-surface-border">
        <h3 className="font-serif text-sm font-bold text-neutral-900">{title}</h3>
      </div>

      {/* Mobile Stacked Key-Value Cards (<1024px) */}
      <div className="lg:hidden p-3.5 sm:p-4 space-y-2.5">
        {specs.map((spec, index) => (
          <div
            key={index}
            className="p-3.5 rounded-xl border border-surface-border bg-neutral-50/70 space-y-1.5"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-900 leading-tight flex items-center gap-1.5">
                {spec.key}
                {spec.verified === false && (
                  <span className="text-[9px] font-sans font-medium text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                    Typical
                  </span>
                )}
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-neutral-200/80 text-neutral-600 shrink-0">
                {spec.unit || 'COA Method'}
              </span>
            </div>
            <div className="font-mono text-xs font-bold text-primary-900">
              {spec.value}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Standard Table View (>=1024px) */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-surface-border">
            <tr>
              <th className="py-3 px-5">Testing Parameter</th>
              <th className="py-3 px-5">Standard Specification</th>
              <th className="py-3 px-5">Unit / Method</th>
              <th className="py-3 px-5 text-right">Status</th>
            </tr>
          </thead>
          <Reveal as="tbody" direction="up" cascade selector="tr" stagger={0.04} className="divide-y divide-surface-border text-neutral-700">
            {specs.map((spec, index) => (
              <tr
                key={index}
                className="hover:bg-neutral-50/70 transition-colors duration-150"
              >
                <td className="py-3.5 px-5 font-medium text-neutral-900">{spec.key}</td>
                <td className="py-3.5 px-5 font-mono text-primary-800 font-semibold">{spec.value}</td>
                <td className="py-3.5 px-5 text-neutral-500">{spec.unit || 'Standard COA'}</td>
                <td className="py-3.5 px-5 text-right">
                  {spec.verified === false ? (
                    <span className="inline-block text-[10px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Typical Spec
                    </span>
                  ) : (
                    <span className="inline-block text-[10px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Guaranteed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </Reveal>
        </table>
      </div>
    </div>
  );
};

export default SpecTable;
