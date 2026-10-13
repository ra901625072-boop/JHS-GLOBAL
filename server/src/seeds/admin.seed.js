import User from '../modules/user/user.model.js';
import logger from '../utils/logger.js';

export const seedAdminUsers = async () => {
  logger.info('Seeding staff admin users...');

  const users = [
    {
      name: 'Global Export Administrator',
      email: 'admin@exportb2b.com',
      password: 'Admin@Export2026!',
      role: 'admin',
      isActive: true,
    },
    {
      name: 'International Sales Desk',
      email: 'sales@exportb2b.com',
      password: 'Sales@Export2026!',
      role: 'sales',
      isActive: true,
    },
    {
      name: 'Catalogue Content Editor',
      email: 'editor@exportb2b.com',
      password: 'Editor@Export2026!',
      role: 'editor',
      isActive: true,
    },
  ];

  for (const u of users) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (!existing) {
      await User.create(u);
      logger.info(`Created user: ${u.email} [role: ${u.role}]`);
    } else {
      logger.info(`User already exists: ${u.email}`);
    }
  }

  logger.info('Staff admin users seeded successfully.');
};

export default seedAdminUsers;
