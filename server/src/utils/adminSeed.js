import UserModel from '../models/user.model.js';

/**
 * Seeds a default admin user from env variables on server start.
 * Runs only if no admin exists OR the specified email doesn't exist yet.
 *
 * Required env vars:
 *   ADMIN_EMAIL     - admin's email
 *   ADMIN_PASSWORD  - admin's plain-text password (hashed automatically by model)
 *   ADMIN_NAME      - (optional) display name, defaults to "Admin"
 */
export const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.log('[seed] ADMIN_EMAIL or ADMIN_PASSWORD not set — skipping admin seed.');
    return;
  }

  try {
    const existing = await UserModel.findOne({ email });

    if (existing) {
      // Update role to admin in case someone demoted it accidentally
      if (existing.role !== 'admin') {
        await UserModel.findByIdAndUpdate(existing._id, { role: 'admin' });
        console.log(`[seed] Existing user "${email}" promoted to admin.`);
      } else {
        console.log(`[seed] Admin "${email}" already exists — skipping.`);
      }
      return;
    }

    const name = process.env.ADMIN_NAME || 'Admin';
    await UserModel.create({ name, email, password, role: 'admin' });
    console.log(`[seed] Admin user "${email}" created successfully.`);
  } catch (err) {
    console.error('[seed] Failed to seed admin:', err.message);
  }
};
