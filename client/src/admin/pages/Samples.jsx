import React from 'react';
import { FlaskConical } from 'lucide-react';
import ModulePlaceholder from '../components/ModulePlaceholder';

export const Samples = () => {
  return (
    <ModulePlaceholder
      title="Sample Dispatch Desk"
      subtitle="Laboratory testing evaluation sample pipeline, courier integration (DHL/FedEx), AWB live tracking, and COA/SDS document dispatch."
      icon={FlaskConical}
      group="Commercial Sales"
      phaseStep="Step 3: Samples"
      features={[
        'Evaluation sample pipeline (requested -> preparing -> dispatched -> delivered)',
        'Recipient corporate address and customs declaration validation',
        'Courier booking and AWB tracking with live courier hyperlink',
        'Batch COA and SDS PDF document attachment generator',
        'Automatic sample dispatch notification email to buyer'
      ]}
    />
  );
};

export default Samples;
