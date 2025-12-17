# Super Admin System Setup Guide

## Overview

The Art U Esports admin system now includes role-based access control with two types of admins:

1. **Super Admin** - Can manage players, events, AND other admin users
2. **Regular Admin** - Can only manage players and events

## Initial Setup

### Step 1: Run the Database Migration

You need to create the `admin_users` table in your Supabase database.

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project: `ueyhnpazdbtwstkcyedu`
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the contents of `/migrations/create_admin_users.sql`
6. **IMPORTANT**: Before running, replace `'your-email@example.com'` with your actual email address (the one you'll use to login as the first super admin)
7. Click "Run" to execute the migration

This will:
- Create the `admin_users` table with proper structure
- Set up Row Level Security (RLS) policies
- Create indexes for performance
- Insert YOU as the first super admin

### Step 2: Create Your Super Admin Account in Supabase Auth

Since the admin system requires users to exist in Supabase Auth first:

1. In your Supabase Dashboard, go to "Authentication" → "Users"
2. Click "Add user" → "Create new user"
3. Enter your email (the same one you used in Step 1)
4. Create a strong password
5. Click "Create user"

### Step 3: Login as Super Admin

1. Open your website and navigate to `/admin-login.html`
2. Enter your email and password
3. Click "Sign In"

You should now be logged in as a super admin and see the "Admins" link in the navigation bar.

## Adding New Admins

### As a Super Admin:

Creating a new admin is now a single-step process directly from the web interface!

1. **Login to your admin panel** at `/admin-login.html`

2. **Click "Admins"** in the navigation bar

3. **Click "Add New Admin"**

4. **Fill in the form:**
   - **Email**: The new admin's email address
   - **Password**: Set their initial password (minimum 6 characters)
   - **Role**: Select their permission level:
     - **Admin**: Can manage players and events only
     - **Super Admin**: Can manage players, events, and other admins

5. **Click "Save Admin"**

That's it! The system automatically:
- Creates their Supabase Auth account
- Adds them to the admin_users table
- Sets up all necessary permissions

6. **Share the login credentials with the new admin:**
   - Send them the admin login URL: `https://your-domain.com/admin-login.html`
   - Provide them with their email and the password you set
   - (Optional) Recommend they change their password after first login via Supabase Auth

## Managing Admins

### Editing an Admin

Super admins can change an admin's role:

1. Go to the Admins page
2. Click "Edit" next to the admin you want to modify
3. Change their role if needed
4. Click "Save Admin"

### Deleting an Admin

Super admins can remove admin access:

1. Go to the Admins page
2. Click "Delete" next to the admin you want to remove
3. Confirm the deletion

**Note**: You cannot delete your own admin account (safety feature).

This only removes them from the admin system - their Supabase Auth account will still exist. If you want to completely remove them, also delete them from Supabase Auth → Users.

## Access Control Summary

| Action | Regular Admin | Super Admin |
|--------|--------------|-------------|
| Manage Players (add/edit/delete) | ✅ Yes | ✅ Yes |
| Manage Events (add/edit/delete) | ✅ Yes | ✅ Yes |
| View Admins page | ❌ No | ✅ Yes |
| Add new admins | ❌ No | ✅ Yes |
| Edit admin roles | ❌ No | ✅ Yes |
| Delete admins | ❌ No | ✅ Yes |

## Security Features

1. **Row Level Security (RLS)**: All database operations are protected by RLS policies
2. **Role Verification**: Every admin page checks the user's role on load
3. **Auth Required**: All admin pages require authentication
4. **Admin Table Check**: Users must exist in both Supabase Auth AND the admin_users table
5. **Auto Logout**: Unauthorized users are automatically logged out and redirected

## Troubleshooting

### "Access denied. You are not authorized as an admin"

**Cause**: User exists in Supabase Auth but not in the admin_users table.

**Solution**:
1. Have a super admin add them via the Admins page, OR
2. Manually insert them into the admin_users table using SQL Editor

### "Only super admins can manage admin users"

**Cause**: User is a regular admin trying to access the Admins page.

**Solution**: This is expected. Only super admins can manage other admins. If this user needs super admin access, have a current super admin change their role.

### Admin can't see the "Admins" link in navigation

**Cause**: User is a regular admin (not a super admin).

**Solution**: This is expected. The "Admins" navigation link only appears for super admins. Regular admins can only see "Players" and "Events".

### Changes to admin_users table aren't taking effect

**Cause**: Role is fetched when the page loads.

**Solution**: Have the user refresh the page or logout and login again to reload their role from the database.

## Database Schema

### admin_users Table

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Columns:

- `id`: Unique identifier for each admin
- `email`: Must match the email in Supabase Auth
- `role`: Either 'super_admin' or 'admin'
- `created_at`: When the admin was added
- `created_by`: Which super admin created this admin (NULL for first super admin)
- `updated_at`: When the admin record was last updated

## Best Practices

1. **Limit Super Admins**: Only assign super admin role to trusted individuals
2. **Regular Audits**: Periodically review the Admins list and remove inactive admins
3. **Strong Passwords**: Enforce strong password policies in Supabase Auth settings
4. **Email Verification**: Consider enabling email verification in Supabase Auth settings
5. **Monitor Activity**: Check Supabase logs regularly for suspicious activity

## Future Enhancements

Potential improvements to consider:

- [ ] Admin activity logging (who created/edited/deleted what)
- [ ] Email notifications when new admins are added
- [ ] Password reset flow integrated into admin panel
- [ ] Two-factor authentication (2FA) support
- [ ] Admin profile management page
- [ ] Bulk admin import from CSV
- [ ] Admin permissions audit log

## Support

For issues or questions about the super admin system:

1. Check this documentation first
2. Review the browser console for error messages
3. Check Supabase Dashboard → Authentication → Logs
4. Check Supabase Dashboard → Database → Logs
5. Verify RLS policies are enabled and correct

## Migration File Location

The database migration SQL file is located at:
```
/migrations/create_admin_users.sql
```

Make sure to update the bootstrap super admin email before running it!
