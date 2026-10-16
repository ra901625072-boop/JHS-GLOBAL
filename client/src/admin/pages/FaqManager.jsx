import React from 'react';
import { HelpCircle } from 'lucide-react';
import ModulePlaceholder from '../components/ModulePlaceholder';

export const FaqManager = () => {
  return (
    <ModulePlaceholder
      title="Export FAQ Manager"
      subtitle="Commercial FAQ management categorized into MOQ, Incoterms, LC payments, and QC laboratory certifications."
      icon={HelpCircle}
      group="Content CMS"
      phaseStep="Step 6: FAQ & Blog"
      features={[
        'Commercial category grouping (MOQ, Incoterms, Payment, Quality)',
        'Display sequence reordering and homepage visibility toggle',
        'Markdown-enabled rich answer composer with link embedding',
        'Direct synchronization with AI quote assistant knowledge base',
        'Audit trail of answers and last updated timestamps'
      ]}
    />
  );
};

export default FaqManager;
