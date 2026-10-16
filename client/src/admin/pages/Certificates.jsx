import React from 'react';
import { Award } from 'lucide-react';
import ModulePlaceholder from '../components/ModulePlaceholder';

export const Certificates = () => {
  return (
    <ModulePlaceholder
      title="Certificates & Statutory Compliance Desk"
      subtitle="Single source of truth for statutory export credentials (FSSAI, APEDA, Spices Board CRES, IEC, GST, Udyam) and renewal alerts."
      icon={Award}
      group="Compliance & Trust"
      phaseStep="Step 5: Certificates"
      features={[
        'Full lifecycle management of statutory export certificates',
        'Official registration number, issuing authority, and legal scope registry',
        'Automated 60-day renewal countdown alerts for compliance officers',
        'PDF certificate and high-resolution badge document vault',
        'Public trust strip and homepage accreditation badges toggle'
      ]}
    />
  );
};

export default Certificates;
