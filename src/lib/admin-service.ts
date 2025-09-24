import { supabase } from './supabase';
import { 
  AdminUser, 
  UserRole, 
  Permission, 
  ROLE_PERMISSIONS,
  AdminStats,
  SystemLog
} from '@/types/user-roles';

export class AdminService {
  private static readonly ADMINS_TABLE = 'admin_users';
  private static readonly SYSTEM_LOGS_TABLE = 'system_logs';

  // Create admin user
  static async createAdmin(
    email: string,
    name: string,
    role: UserRole,
    createdBy: string
  ): Promise<string> {
    try {
      const permissions = this.getPermissionsForRole(role);
      
      const adminData = {
        email,
        name,
        role,
        permissions,
        is_active: true,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from(this.ADMINS_TABLE)
        .insert(adminData)
        .select('id')
        .single();

      if (error) throw error;

      // Log the action
      await this.logAction(createdBy, 'CREATE_ADMIN', 'admin_user', data.id, {
        email,
        name,
        role
      });

      return data.id;
    } catch (error) {
      console.error('Error creating admin:', error);
      throw new Error('Failed to create admin user');
    }
  }

  // Get all admin users
  static async getAdminUsers(): Promise<AdminUser[]> {
    try {
      const { data, error } = await supabase
        .from(this.ADMINS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminUser[];
    } catch (error) {
      console.error('Error fetching admin users:', error);
      throw new Error('Failed to fetch admin users');
    }
  }

  // Get admin user by ID
  static async getAdminById(adminId: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from(this.ADMINS_TABLE)
        .select('*')
        .eq('id', adminId)
        .single();

      if (error) throw error;
      return data as AdminUser;
    } catch (error) {
      console.error('Error fetching admin by ID:', error);
      return null;
    }
  }

  // Get admin user by email
  static async getAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      const { data, error } = await supabase
        .from(this.ADMINS_TABLE)
        .select('*')
        .eq('email', email)
        .single();

      if (error) throw error;
      return data as AdminUser;
    } catch (error) {
      console.error('Error fetching admin by email:', error);
      return null;
    }
  }

  // Update admin user
  static async updateAdmin(
    adminId: string,
    updates: Partial<AdminUser>,
    updatedBy: string
  ): Promise<void> {
    try {
      // If role is being updated, update permissions too
      if (updates.role) {
        updates.permissions = this.getPermissionsForRole(updates.role);
      }

      const { error } = await supabase
        .from(this.ADMINS_TABLE)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', adminId);

      if (error) throw error;

      // Log the action
      await this.logAction(updatedBy, 'UPDATE_ADMIN', 'admin_user', adminId, updates);
    } catch (error) {
      console.error('Error updating admin:', error);
      throw new Error('Failed to update admin user');
    }
  }

  // Delete admin user
  static async deleteAdmin(adminId: string, deletedBy: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.ADMINS_TABLE)
        .delete()
        .eq('id', adminId);

      if (error) throw error;

      // Log the action
      await this.logAction(deletedBy, 'DELETE_ADMIN', 'admin_user', adminId, {});
    } catch (error) {
      console.error('Error deleting admin:', error);
      throw new Error('Failed to delete admin user');
    }
  }

  // Check if user has permission
  static hasPermission(userRole: UserRole, permission: Permission): boolean {
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    return rolePermissions.includes(permission);
  }

  // Get permissions for a role
  static getPermissionsForRole(role: UserRole): Record<string, boolean> {
    const permissions = ROLE_PERMISSIONS[role] || [];
    const permissionMap: Record<string, boolean> = {};
    
    // Initialize all permissions to false
    Object.values(Permission).forEach(perm => {
      permissionMap[perm] = false;
    });
    
    // Set role permissions to true
    permissions.forEach(perm => {
      permissionMap[perm] = true;
    });
    
    return permissionMap;
  }

  // Update admin login time
  static async updateLastLogin(adminId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.ADMINS_TABLE)
        .update({
          last_login_at: new Date().toISOString()
        })
        .eq('id', adminId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  // Get admin dashboard stats
  static async getAdminStats(): Promise<AdminStats> {
    try {
      // This would typically involve multiple queries to get stats
      // For now, we'll return mock data - in production, you'd query actual tables
      return {
        totalUsers: 1250,
        totalAdmins: 5,
        totalPosts: 3420,
        totalItems: 1890,
        totalTransactions: 567,
        pendingVerifications: 23,
        activeUsers: 890,
        revenue: 1250000 // ₦1,250,000
      };
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw new Error('Failed to fetch admin statistics');
    }
  }

  // Log system action
  static async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    details: Record<string, any>,
    ipAddress: string = 'unknown',
    userAgent: string = 'unknown'
  ): Promise<void> {
    try {
      const logData = {
        user_id: userId,
        action,
        resource,
        resource_id: resourceId,
        details,
        ip_address: ipAddress,
        user_agent: userAgent,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from(this.SYSTEM_LOGS_TABLE)
        .insert(logData);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging action:', error);
      // Don't throw error for logging failures
    }
  }

  // Get system logs
  static async getSystemLogs(limit: number = 100): Promise<SystemLog[]> {
    try {
      const { data, error } = await supabase
        .from(this.SYSTEM_LOGS_TABLE)
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as SystemLog[];
    } catch (error) {
      console.error('Error fetching system logs:', error);
      throw new Error('Failed to fetch system logs');
    }
  }

  // Initialize super admin (call this once to create the first super admin)
  static async initializeSuperAdmin(
    email: string,
    name: string
  ): Promise<string> {
    try {
      // Check if any super admin already exists
      const { data, error } = await supabase
        .from(this.ADMINS_TABLE)
        .select('id')
        .eq('role', UserRole.SUPER_ADMIN)
        .limit(1);

      if (error) throw error;
      if (data && data.length > 0) {
        throw new Error('Super admin already exists');
      }

      return await this.createAdmin(email, name, UserRole.SUPER_ADMIN, 'system');
    } catch (error) {
      console.error('Error initializing super admin:', error);
      throw new Error('Failed to initialize super admin');
    }
  }
}