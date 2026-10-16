import React from 'react';
import { UserCheck } from 'lucide-react';
import ModulePlaceholder from '../components/ModulePlaceholder';

export const Users = () => {
  return (
    <ModulePlaceholder
      title="Team Governance & User Roles"
      subtitle="Administrative provision of sales officers and content editors with server-enforced role permissions (RBAC)."
      icon={UserCheck}
      group="Governance & Settings"
      phaseStep="Step 10: Final Governance & Audit"
      features={[
        'Role-Based Access Control matrix (Admin, Sales, Editor, Viewer)',
        'Staff user invitation and activation/deactivation toggles',
        'Session security, login rate limits, and audit history',
        'Granular module permission assignment and review',
        'Password resets and authenticated session invalidation'
      ]}
    />
  );
};

export default Users;
