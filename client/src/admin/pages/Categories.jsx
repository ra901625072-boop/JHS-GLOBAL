import React from 'react';
import { Layers } from 'lucide-react';
import ModulePlaceholder from '../components/ModulePlaceholder';

export const Categories = () => {
  return (
    <ModulePlaceholder
      title="Categories & Divisions Manager"
      subtitle="Hierarchy governance for the 3 core commercial divisions: Personal Care Raw Materials, Nutraceutical Raw Materials, and Animal Feed."
      icon={Layers}
      group="Commodity Catalogue"
      phaseStep="Step 4: Products & Categories"
      features={[
        'Three-tier category nesting (Division -> Sub-category -> Micro-segment)',
        'Harmonized System (HS) 2-digit chapter assignment',
        'Display sequence ordering and public visibility toggles',
        'SEO title and meta description editor per division',
        'Automated sitemap and public navbar sync'
      ]}
    />
  );
};

export default Categories;
