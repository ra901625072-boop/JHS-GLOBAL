import React from 'react';
import { BookOpen } from 'lucide-react';
import ModulePlaceholder from '../components/ModulePlaceholder';

export const BlogCms = () => {
  return (
    <ModulePlaceholder
      title="Trade Intelligence & Blog CMS"
      subtitle="Publish international trade intelligence, QA monographs, and export regulations across the 3 core divisions."
      icon={BookOpen}
      group="Content CMS"
      phaseStep="Step 6: FAQ & Blog"
      features={[
        'Rich-text article editor with image embedding and code blocks',
        'Category restrictions adhering to the 3 catalogue divisions',
        'SEO title, meta description, and social graph preview editor',
        'Draft, Scheduled, and Published state management',
        'Automatic XML sitemap update upon publishing'
      ]}
    />
  );
};

export default BlogCms;
