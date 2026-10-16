import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import ModulePlaceholder from '../components/ModulePlaceholder';

export const Settings = () => {
  return (
    <ModulePlaceholder
      title="Company Profile & System Settings"
      subtitle="Single source of verified corporate facts for Surat headquarters, founder dossiers, port affiliations, and database health."
      icon={SettingsIcon}
      group="Governance & Settings"
      phaseStep="Step 8: Company & Settings"
      features={[
        'Central repository for legal identity (Sole Proprietorship, GSTIN, IEC, MSME)',
        'Founder dossiers (Jay Prajapati, Suraj Prajapati, Henil Prajapati)',
        'Preferred departure ports (Hazira Port, Mundra Port)',
        'PostgreSQL connection pool & pgvector embedding health check',
        'Database backup snapshot verification and WAL archiving status'
      ]}
    />
  );
};

export default Settings;
