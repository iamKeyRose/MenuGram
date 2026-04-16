import { supabase } from '../lib/supabase';
import { UserRole } from './SupabaseService';

/**
 * 1. THE GATEKEEPER (requireAuth)
 * Ensures the user is logged in and returns their profile data.
 */
export const requireAuth = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    throw new Error('Unauthorized: No active session found.');
  }

  const { data: profile, error: profileError } = await supabase
    .from('app_users')
    .select('*')
    .eq('auth_id', session.user.id)
    .single();

  if (profileError || !profile) {
    throw new Error('User profile not found.');
  }

  return profile;
};

/**
 * 2. THE ROLE GUARD (checkRole)
 * Restricts access to specific roles.
 */
export const checkRole = (userRole: string, allowedRoles: UserRole[]) => {
  if (!allowedRoles.includes(userRole as UserRole)) {
    throw new Error(`Forbidden: Access denied for role ${userRole}.`);
  }
  return true;
};

/**
 * 3. THE OWNERSHIP GUARD (validateOwnership)
 * Ensures a user (Customer/Owner) is only touching their own data.
 */
export const validateOwnership = (userId: string, resourceOwnerId: string, role: string) => {
  // Super Admins can bypass ownership checks for support/debugging
  if (role === 'super_admin') return true;

  if (userId !== resourceOwnerId) {
    throw new Error('Forbidden: You do not own this resource.');
  }
  return true;
};

/**
 * 4. THE LOGISTICS GUARD (activeCourierGuard)
 * Specifically for the "Delivery" (Dekucery) role.
 */
export const activeCourierGuard = async (userId: string) => {
  const { data: courier, error } = await supabase
    .from('couriers')
    .select('is_active')
    .eq('user_id', userId)
    .single();

  if (error || !courier?.is_active) {
    throw new Error('Logistics Error: Courier must be marked as "Active" to perform this action.');
  }
  return true;
};

/**
 * 5. THE ADMIN HIERARCHY GUARD (adminOversight)
 * Distinguishes between System Admin and Super Admin capabilities.
 */
export const adminOversight = (role: string, requiresSuper: boolean = false) => {
  if (requiresSuper && role !== 'super_admin') {
    throw new Error('Critical: This operation requires Super Admin privileges.');
  }
  
  const adminRoles = ['super_admin', 'system_admin'];
  if (!adminRoles.includes(role)) {
    throw new Error('Forbidden: Admin access required.');
  }
  return true;
};
