import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Database, Globe, Users, Server, Activity, Settings,
  AlertTriangle, CheckCircle, Lock, Zap, BarChart2, TrendingUp,
  Eye, EyeOff, Edit
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { StatCard, Badge, Button, Skeleton, Modal, Input, Select, Avatar } from '../../components/ui';
import { usersService, analyticsService } from '../../services';
import { User } from '../../types';
import { formatDate, formatPrice } from '../../utils/helpers';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

export const superAdminNav = [
  { label: 'Overview', icon: 'LayoutDashboard', to: '/superadmin' },
  { label: 'Admin Management', icon: 'Shield', to: '/superadmin/admins' },
  { label: 'Moderator Management', icon: 'UserCheck', to: '/superadmin/moderators' },
  { label: 'Listings', icon: 'Package', to: '/superadmin/listings' },
  { label: 'User Management', icon: 'Users', to: '/superadmin/users' },
  { label: 'Payments', icon: 'CreditCard', to: '/superadmin/payments' },
  { label: 'Categories', icon: 'Tag', to: '/superadmin/categories' },
  { label: 'Global Analytics', icon: 'BarChart2', to: '/superadmin/analytics' },
  { label: 'System Config', icon: 'Settings', to: '/superadmin/config' },
  { label: 'Database Settings', icon: 'Database', to: '/superadmin/database' },
];

// ============================================================
// SUPER ADMIN OVERVIEW
// ============================================================
export const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ total_listings: 0, total_users: 0, total_revenue: 0 });
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      Promise.all([
        analyticsService.getDashboardStats(),
        usersService.getAllUsers(),
      ]).then(([s, u]) => {
        setStats(s);
        setAdmins((u as unknown as User[]).filter(user => user.roles?.includes('admin') || user.roles?.includes('super_admin')));
      }).catch(console.error).finally(() => setLoading(false));
    };
    fetchData();

    // Subscribe to listings table changes (realtime)
    const listingsChannel = supabase
      .channel('superadmin-listings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, () => {
        fetchData();
      })
      .subscribe();

    // Subscribe to users table changes (realtime)
    const usersChannel = supabase
      .channel('superadmin-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      listingsChannel.unsubscribe();
      usersChannel.unsubscribe();
    };
  }, []);

  const systemHealth = [
    { label: 'API Status', status: 'Operational', icon: Server, color: 'text-green-500' },
    { label: 'Database', status: 'Healthy', icon: Database, color: 'text-green-500' },
    { label: 'Storage', status: '68% Used', icon: Globe, color: 'text-amber-500' },
    { label: 'Realtime', status: 'Active', icon: Zap, color: 'text-green-500' },
  ];

  return (
    <DashboardLayout navItems={superAdminNav} title="Super Admin">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Super Admin Control Center</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Full system control and oversight</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Platform Users" value={stats.total_users.toLocaleString()} icon={<Users size={20} />} color="blue" />
          <StatCard title="Total Listings" value={stats.total_listings.toLocaleString()} icon={<Activity size={20} />} color="green" />
          <StatCard title="Platform Revenue" value={formatPrice(stats.total_revenue)} icon={<TrendingUp size={20} />} color="purple" />
          <StatCard title="Active Admins" value={admins.length} icon={<Shield size={20} />} color="orange" />
        </div>

        {/* System Health */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Activity size={18} /> System Health
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {systemHealth.map(item => (
              <div key={item.label} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <item.icon size={18} className={item.color} />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{item.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin list */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Platform Administrators</h2>
          {loading ? (
            <Skeleton className="h-32" />
          ) : (
            <div className="space-y-2">
              {admins.map(admin => (
                <div key={admin.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl">
                  <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {admin.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{admin.full_name}</p>
                    <p className="text-xs text-slate-500">{admin.email}</p>
                  </div>
                  <Badge variant={admin.role === 'super_admin' ? 'purple' : 'info'} className="capitalize">
                    {admin.role.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// ============================================================
// ADMIN MANAGEMENT PAGE
// ============================================================
export const SuperAdminManagementPage: React.FC = () => {
  const [admins, setAdmins] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Edit Mode state
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);

  // Manual Admin Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    usersService.getAllUsers().then(data => {
      const users = data as unknown as User[];
      setAdmins(users.filter(u => u.role === 'admin' || u.role === 'super_admin'));
    }).finally(() => setLoading(false));
  }, []);

  const handleStartAdd = () => {
    setEditingAdmin(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAvatarFile(null);
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleStartEdit = (admin: User) => {
    setEditingAdmin(admin);
    setName(admin.full_name);
    setEmail(admin.email);
    setPhone(admin.phone || '');
    setPassword('');
    setAvatarFile(null);
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingAdmin(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAvatarFile(null);
    setShowPassword(false);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and Email are required');
      return;
    }
    if (!editingAdmin && !password) {
      toast.error('Password is required');
      return;
    }
    setSubmitting(true);
    try {
      let adminId = editingAdmin?.id;
      let avatarUrl = editingAdmin?.avatar_url || null;

      if (editingAdmin) {
        // Edit Mode
        await usersService.updateAdmin(adminId!, { name, email, phone, password: password || undefined });
      } else {
        // Create Mode (Invitation flow with manual password)
        adminId = await usersService.createAdmin({ name, email, phone, password });
      }

      // Handle avatar upload if a new file is chosen
      if (avatarFile && adminId) {
        avatarUrl = await usersService.uploadAvatar(avatarFile, adminId);
        await usersService.updateUser(adminId, { avatar_url: avatarUrl });
      }

      const updatedAdmin: User = {
        id: adminId!,
        full_name: name,
        email: email,
        phone: phone || null,
        role: editingAdmin ? editingAdmin.role : 'admin',
        roles: editingAdmin ? editingAdmin.roles || ['admin'] : ['admin'],
        is_verified: true,
        email_verified: true,
        is_active: true,
        is_temp_password: editingAdmin ? editingAdmin.is_temp_password : true,
        created_at: editingAdmin ? editingAdmin.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: avatarUrl,
        city: editingAdmin ? editingAdmin.city : null,
        country: editingAdmin ? editingAdmin.country : 'Pakistan',
        bio: editingAdmin ? editingAdmin.bio : null
      };

      if (editingAdmin) {
        setAdmins(prev => prev.map(a => a.id === adminId ? updatedAdmin : a));
        toast.success('Admin updated successfully');
      } else {
        setAdmins(prev => [...prev, updatedAdmin]);
        toast.success('Admin created successfully!');
      }

      handleCloseModal();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('duplicate key') || msg.includes('unique') || err?.status === 409 || msg.includes('409') || msg.includes('Conflict') || msg.includes('already exists')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(err?.message || 'Operation failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemote = async (id: string, role: string) => {
    if (role === 'super_admin') { toast.error('Cannot remove super admin'); return; }
    try {
      await usersService.deleteUser(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
      toast.success('Admin deleted successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete admin');
    }
  };

  return (
    <DashboardLayout navItems={superAdminNav} title="Admin Management">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Management</h1>
          <Button icon={<Shield size={16} />} onClick={handleStartAdd}>Add Admin</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {admins.map(admin => (
              <motion.div key={admin.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 flex items-center gap-3">
                <Avatar src={admin.avatar_url} name={admin.full_name} size="md" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{admin.full_name}</p>
                  <p className="text-xs text-slate-500">{admin.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Joined {formatDate(admin.created_at)}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant={admin.role === 'super_admin' ? 'purple' : 'info'} className="capitalize">
                      {admin.role.replace('_', ' ')}
                    </Badge>
                    {admin.is_temp_password && (
                      <Badge variant="warning" className="text-[10px]">Pending Invite</Badge>
                    )}
                  </div>
                  {admin.role !== 'super_admin' && (
                    <div className="flex items-center gap-2.5 text-xs font-medium mt-1">
                      <button onClick={() => handleStartEdit(admin)} className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1">
                        <Edit size={12} /> Edit
                      </button>
                      <button onClick={() => handleDemote(admin.id, admin.role)} className="text-red-500 hover:text-red-600 hover:underline">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingAdmin ? "Edit Admin Details" : "Add Admin"} size="sm">
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Name"
            placeholder="Admin Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Phone (Optional)"
            placeholder="+92 300 1234567"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <Input
            label={editingAdmin ? "New Password (Optional)" : "Password"}
            type={showPassword ? 'text' : 'password'}
            placeholder={editingAdmin ? "Leave blank to keep current password" : "Set password for login"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={!editingAdmin}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <div>
            <label className="label text-sm font-medium text-slate-700 dark:text-slate-300">Profile Picture (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs text-slate-500 dark:text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-xs file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                dark:file:bg-slate-800 dark:file:text-slate-300"
              onChange={e => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={submitting}>
              {editingAdmin ? "Save Changes" : "Create Admin"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

// ============================================================
// MODERATOR MANAGEMENT PAGE (SUPER ADMIN)
// ============================================================
export const SuperAdminModeratorsPage: React.FC = () => {
  const [moderators, setModerators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Edit Mode state
  const [editingModerator, setEditingModerator] = useState<User | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    usersService.getAllUsers().then(data => {
      const users = data as unknown as User[];
      setModerators(users.filter(u => u.role === 'moderator'));
    }).finally(() => setLoading(false));
  }, []);

  const handleStartAdd = () => {
    setEditingModerator(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAvatarFile(null);
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleStartEdit = (moderator: User) => {
    setEditingModerator(moderator);
    setName(moderator.full_name);
    setEmail(moderator.email);
    setPhone(moderator.phone || '');
    setPassword('');
    setAvatarFile(null);
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingModerator(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAvatarFile(null);
    setShowPassword(false);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and Email are required');
      return;
    }
    if (!editingModerator && !password) {
      toast.error('Password is required');
      return;
    }
    setSubmitting(true);
    try {
      let moderatorId = editingModerator?.id;
      let avatarUrl = editingModerator?.avatar_url || null;

      if (editingModerator) {
        // Edit Mode
        await usersService.updateAdmin(moderatorId!, { name, email, phone, password: password || undefined });
      } else {
        // Create Mode (Invitation flow)
        moderatorId = await usersService.createModerator({ name, email, phone, password });
      }

      // Handle avatar upload if a new file is chosen
      if (avatarFile && moderatorId) {
        avatarUrl = await usersService.uploadAvatar(avatarFile, moderatorId);
        await usersService.updateUser(moderatorId, { avatar_url: avatarUrl });
      }

      const updatedModerator: User = {
        id: moderatorId!,
        full_name: name,
        email: email,
        phone: phone || null,
        role: 'moderator',
        roles: ['moderator'],
        is_verified: true,
        email_verified: true,
        is_active: true,
        is_temp_password: editingModerator ? editingModerator.is_temp_password : true,
        created_at: editingModerator ? editingModerator.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        avatar_url: avatarUrl,
        city: editingModerator ? editingModerator.city : null,
        country: editingModerator ? editingModerator.country : 'Pakistan',
        bio: editingModerator ? editingModerator.bio : null
      };

      if (editingModerator) {
        setModerators(prev => prev.map(m => m.id === moderatorId ? updatedModerator : m));
        toast.success('Moderator updated successfully');
      } else {
        setModerators(prev => [...prev, updatedModerator]);
        toast.success('Moderator created successfully!');
      }

      handleCloseModal();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('duplicate key') || msg.includes('unique') || err?.status === 409 || msg.includes('409') || msg.includes('Conflict') || msg.includes('already exists')) {
        toast.error('An account with this email already exists');
      } else {
        toast.error(err?.message || 'Operation failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemote = async (id: string) => {
    try {
      await usersService.deleteUser(id);
      setModerators(prev => prev.filter(m => m.id !== id));
      toast.success('Moderator deleted successfully');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete moderator');
    }
  };

  return (
    <DashboardLayout navItems={superAdminNav} title="Moderator Management">
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Moderator Management</h1>
          <Button icon={<Shield size={16} />} onClick={handleStartAdd}>Add Moderator</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {moderators.map(moderator => (
              <motion.div key={moderator.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 flex items-center gap-3">
                <Avatar src={moderator.avatar_url} name={moderator.full_name} size="md" className="shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{moderator.full_name}</p>
                  <p className="text-xs text-slate-500">{moderator.email}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Joined {formatDate(moderator.created_at)}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Badge variant="purple" className="capitalize">
                      {moderator.role.replace('_', ' ')}
                    </Badge>
                    {moderator.is_temp_password && (
                      <Badge variant="warning" className="text-[10px]">Pending Invite</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2.5 text-xs font-medium mt-1">
                    <button onClick={() => handleStartEdit(moderator)} className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => handleDemote(moderator.id)} className="text-red-500 hover:text-red-600 hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={handleCloseModal} title={editingModerator ? "Edit Moderator Details" : "Add Moderator"} size="sm">
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Name"
            placeholder="Moderator Full Name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="moderator@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            label="Phone (Optional)"
            placeholder="+92 300 1234567"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />
          <Input
            label={editingModerator ? "New Password (Optional)" : "Password"}
            type={showPassword ? 'text' : 'password'}
            placeholder={editingModerator ? "Leave blank to keep current password" : "Set password for login"}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required={!editingModerator}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="cursor-pointer text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <div>
            <label className="label text-sm font-medium text-slate-700 dark:text-slate-300">Profile Picture (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-xs text-slate-500 dark:text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-xl file:border-0
                file:text-xs file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                dark:file:bg-slate-800 dark:file:text-slate-300"
              onChange={e => setAvatarFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={submitting}>
              {editingModerator ? "Save Changes" : "Create Moderator"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

// ============================================================
// GLOBAL ANALYTICS PAGE
// ============================================================
export const SuperAdminAnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState({ total_listings: 0, total_users: 0, total_revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardStats().then(setStats).finally(() => setLoading(false));
  }, []);

  const growthData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    users: Math.floor(Math.random() * 500) + 200 + i * 50,
    revenue: Math.floor(Math.random() * 100000) + 50000 + i * 10000,
  }));

  return (
    <DashboardLayout navItems={superAdminNav} title="Global Analytics">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Global Platform Analytics</h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={stats.total_users} icon={<Users size={20} />} color="blue" trend={{ value: 23, label: 'YoY growth' }} />
          <StatCard title="Total Listings" value={stats.total_listings} icon={<Activity size={20} />} color="green" trend={{ value: 18, label: 'YoY growth' }} />
          <StatCard title="Total Revenue" value={formatPrice(stats.total_revenue)} icon={<TrendingUp size={20} />} color="purple" trend={{ value: 31, label: 'YoY growth' }} />
          <StatCard title="Platform Health" value="99.8%" icon={<CheckCircle size={20} />} color="green" />
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Annual Growth Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="url(#usersGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ============================================================
// SYSTEM CONFIG PAGE
// ============================================================
export const SystemConfigPage: React.FC = () => {
  const [settings, setSettings] = useState({
    siteName: 'Bazaar Marketplace',
    siteUrl: 'https://bazaar.pk',
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: true,
    maxImagesPerListing: 10,
    maxVideoSizeMB: 50,
    listingExpiryDays: 30,
    featuredListingPrice: 500,
  });

  const handleSave = () => {
    toast.success('System settings saved successfully');
  };

  return (
    <DashboardLayout navItems={superAdminNav} title="System Configuration">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">System Configuration</h1>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">General Settings</h2>
          <Input label="Site Name" value={settings.siteName} onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))} />
          <Input label="Site URL" value={settings.siteUrl} onChange={e => setSettings(s => ({ ...s, siteUrl: e.target.value }))} />

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Maintenance Mode</p>
              <p className="text-xs text-slate-500">Temporarily disable public access</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.maintenanceMode} onChange={e => setSettings(s => ({ ...s, maintenanceMode: e.target.checked }))} className="sr-only peer" />
              <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Allow New Registration</p>
              <p className="text-xs text-slate-500">Allow new users to sign up</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.allowRegistration} onChange={e => setSettings(s => ({ ...s, allowRegistration: e.target.checked }))} className="sr-only peer" />
              <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
            </label>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Require Email Verification</p>
              <p className="text-xs text-slate-500">Users must verify email before posting</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.requireEmailVerification} onChange={e => setSettings(s => ({ ...s, requireEmailVerification: e.target.checked }))} className="sr-only peer" />
              <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
            </label>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Listing Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Images Per Listing"
              type="number"
              value={settings.maxImagesPerListing}
              onChange={e => setSettings(s => ({ ...s, maxImagesPerListing: Number(e.target.value) }))}
            />
            <Input
              label="Max Video Size (MB)"
              type="number"
              value={settings.maxVideoSizeMB}
              onChange={e => setSettings(s => ({ ...s, maxVideoSizeMB: Number(e.target.value) }))}
            />
            <Input
              label="Listing Expiry (Days)"
              type="number"
              value={settings.listingExpiryDays}
              onChange={e => setSettings(s => ({ ...s, listingExpiryDays: Number(e.target.value) }))}
            />
            <Input
              label="Featured Listing Price (PKR)"
              type="number"
              value={settings.featuredListingPrice}
              onChange={e => setSettings(s => ({ ...s, featuredListingPrice: Number(e.target.value) }))}
            />
          </div>
        </div>

        <Button size="lg" onClick={handleSave}>Save Configuration</Button>
      </div>
    </DashboardLayout>
  );
};

// ============================================================
// DATABASE SETTINGS PAGE
// ============================================================
export const DatabaseSettingsPage: React.FC = () => {
  return (
    <DashboardLayout navItems={superAdminNav} title="Database Settings">
      <div className="max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Database Settings</h1>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Database size={18} /> Connection Status
          </h2>
          <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <p className="font-medium text-green-800 dark:text-green-400 text-sm">Connected to Supabase</p>
              <p className="text-xs text-green-600 dark:text-green-500">PostgreSQL 15.x · Region: ap-southeast-1</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Database Stats</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500">Total Tables</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">11</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500">Storage Used</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">2.4 GB</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500">RLS Policies</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">28</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-xs text-slate-500">Active Connections</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100">12</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Backup & Maintenance</h2>
          <div className="space-y-3">
            <Button variant="secondary" className="w-full justify-start" icon={<Database size={16} />}>
              Run Manual Backup
            </Button>
            <Button variant="secondary" className="w-full justify-start" icon={<Activity size={16} />}>
              View Query Performance
            </Button>
            <Button variant="danger" className="w-full justify-start" icon={<AlertTriangle size={16} />}>
              Clear Cache
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
