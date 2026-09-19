import { supabase } from '../lib/supabase';
import { Category, Notification, Bookmark, Offer, Report, Payment, PaymentAccount } from '../types';
import { CATEGORIES } from '../utils/constants';

// Re-export verificationService from its dedicated file
export { verificationService } from './verificationService';

/**
 * Flattens nested CATEGORIES hierarchy into a 1D flat array with valid parent_id references.
 */
export function flattenVirtualCategories(catList: any[], parentId: string | null = null): Category[] {
  let flat: Category[] = [];
  catList.forEach((cat, index) => {
    const { subcategories, ...rest } = cat;
    const flatCat: any = {
      ...rest,
      parent_id: rest.parent_id || parentId || null,
      sort_order: rest.sort_order !== undefined ? rest.sort_order : index + 1
    };
    flat.push(flatCat as Category);
    if (subcategories && Array.isArray(subcategories) && subcategories.length > 0) {
      flat = flat.concat(flattenVirtualCategories(subcategories, cat.id));
    }
  });
  return flat;
}

// Re-export all flattened categories as VIRTUAL_CATEGORIES for admin sync functionality
export const VIRTUAL_CATEGORIES = flattenVirtualCategories(CATEGORIES);

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notificationsService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return data as Notification[];
  },

  async markRead(id: string): Promise<void> {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id);
  },

  async markAllRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
  },

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<void> {
    await supabase.from('notifications').insert(notification);
  },

  subscribeToNotifications(userId: string, onNotification: (n: Notification) => void) {
    return supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => onNotification(payload.new as Notification)
      )
      .subscribe();
  },
};

// ============================================================
// BOOKMARKS
// ============================================================
export const bookmarksService = {
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    const { data, error } = await supabase
      .from('bookmarks')
      .select(`*, listing:listings(*, category:categories!listings_category_id_fkey(id, name, slug, icon, color), seller:users!listings_seller_id_fkey(id, full_name, avatar_url, is_verified))`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as Bookmark[];
  },

  async addBookmark(userId: string, listingId: string): Promise<void> {
    await supabase.from('bookmarks').insert({ user_id: userId, listing_id: listingId });
  },

  async removeBookmark(userId: string, listingId: string): Promise<void> {
    await supabase.from('bookmarks').delete().eq('user_id', userId).eq('listing_id', listingId);
  },

  async isBookmarked(userId: string, listingId: string): Promise<boolean> {
    const { data } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('listing_id', listingId)
      .single();
    return !!data;
  },
};

// ============================================================
// OFFERS
// ============================================================
export const offersService = {
  async getOffers(userId: string): Promise<Offer[]> {
    const { data, error } = await supabase
      .from('offers')
      .select(`*, listing:listings(id, title, images, price, currency), buyer:users!offers_buyer_id_fkey(id, full_name, avatar_url)`)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as Offer[];
  },

  async createOffer(offer: Omit<Offer, 'id' | 'created_at'>): Promise<Offer> {
    const { data, error } = await supabase.from('offers').insert(offer).select().single();
    if (error) throw error;
    return data as Offer;
  },

  async updateOfferStatus(id: string, status: Offer['status']): Promise<void> {
    const { error } = await supabase.from('offers').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// REPORTS
// ============================================================
export const reportsService = {
  async getReports(): Promise<Report[]> {
    const { data, error } = await supabase
      .from('reports')
      .select(`*, listing:listings(id, title, images), reporter:users!reports_reporter_id_fkey(id, full_name, avatar_url)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as Report[];
  },

  async createReport(report: Omit<Report, 'id' | 'created_at'>): Promise<void> {
    const { error } = await supabase.from('reports').insert(report);
    if (error) throw error;
  },

  async updateReport(id: string, updates: Partial<Report>): Promise<void> {
    const { error } = await supabase.from('reports').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// CATEGORIES
// ============================================================
export const categoriesService = {
  async getCategories(): Promise<Category[]> {
    try {
      const { data: dbCats, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order', { ascending: true });

      const allVirtualFlat = flattenVirtualCategories(CATEGORIES);

      if (error || !dbCats || dbCats.length === 0) {
        return allVirtualFlat;
      }

      // Merge DB records with virtual flat categories (DB records take precedence)
      const mergedMap = new Map<string, Category>();

      // 1. Put all DB records first
      dbCats.forEach(c => {
        if (c.is_active !== false) {
          mergedMap.set(c.id, c as unknown as Category);
        }
      });

      // 2. Add missing virtual categories if not overridden or deleted in DB
      allVirtualFlat.forEach(vc => {
        if (!mergedMap.has(vc.id)) {
          const dbItem = dbCats.find(c => c.id === vc.id || c.slug === vc.slug);
          if (!dbItem || dbItem.is_active !== false) {
            mergedMap.set(vc.id, vc);
          }
        }
      });

      return Array.from(mergedMap.values()).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    } catch (err) {
      console.error('getCategories error, using fallback:', err);
      return flattenVirtualCategories(CATEGORIES);
    }
  },

  async syncAllToDatabase(progressCallback?: (msg: string) => void): Promise<{ success: boolean; count: number; error?: any }> {
    try {
      const allVirtualFlat = flattenVirtualCategories(CATEGORIES);
      if (progressCallback) progressCallback(`Starting sync of ${allVirtualFlat.length} categories to database...`);

      // Separate Level 1, Level 2, and Level 3 so parents exist before children
      const level1 = allVirtualFlat.filter(c => !c.parent_id);
      const level1Ids = new Set(level1.map(c => c.id));
      const level2 = allVirtualFlat.filter(c => c.parent_id && level1Ids.has(c.parent_id));
      const level2Ids = new Set(level2.map(c => c.id));
      const level3 = allVirtualFlat.filter(c => c.parent_id && level2Ids.has(c.parent_id));

      const formatPayload = (c: Category) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        icon: c.icon || 'Tag',
        parent_id: c.parent_id || null,
        description: c.description || null,
        color: c.color || '#3b82f6',
        sort_order: c.sort_order || 0,
        is_active: true,
        attributes_schema: (c as any).attributes_schema || [],
        image_url: (c as any).image_url || null,
      });

      // 1. Level 1
      if (progressCallback) progressCallback(`Upserting ${level1.length} main categories...`);
      for (const cat of level1) {
        await supabase.from('categories').upsert(formatPayload(cat), { onConflict: 'id' });
      }

      // 2. Level 2
      if (progressCallback) progressCallback(`Upserting ${level2.length} subcategories...`);
      for (const cat of level2) {
        await supabase.from('categories').upsert(formatPayload(cat), { onConflict: 'id' });
      }

      // 3. Level 3
      if (progressCallback) progressCallback(`Upserting ${level3.length} sub-subcategories...`);
      for (const cat of level3) {
        await supabase.from('categories').upsert(formatPayload(cat), { onConflict: 'id' });
      }

      return { success: true, count: allVirtualFlat.length };
    } catch (err: any) {
      console.error('syncAllToDatabase error:', err);
      return { success: false, count: 0, error: err };
    }
  }
};

// ============================================================
// USERS (Admin)
// ============================================================
export const usersService = {
  async getAllUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: Record<string, unknown>) {
    const updatedData: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
    if (typeof updates.role === 'string') {
      updatedData.roles = (updates.role === 'seller' ? ['buyer', 'seller'] : [updates.role]) as string[];
    }
    const { error } = await supabase.from('users').update(updatedData).eq('id', id);
    if (error) throw error;
  },

  async deleteUser(id: string) {
    const { error } = await supabase.rpc('delete_user_by_admin', {
      target_user_id: id
    });
    if (error) throw error;
  },

  async uploadAvatar(file: File, userId: string): Promise<string> {
    try {
      const ext = file.name.split('.').pop();
      const path = `${userId}/avatar_${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      return publicUrl;
    } catch {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
  },

  async deleteUserAccount(userId: string): Promise<void> {
    try {
      // 1. Set user status as deactivated (is_active = false) in public.users table
      await supabase.from('users').update({ is_active: false, updated_at: new Date().toISOString() }).eq('id', userId);
      // 2. Suspend all active listings for this user
      await supabase.from('listings').update({ status: 'suspended' }).eq('seller_id', userId);
      // 3. Delete user's bookmarks and notifications
      await Promise.allSettled([
        supabase.from('bookmarks').delete().eq('user_id', userId),
        supabase.from('notifications').delete().eq('user_id', userId),
      ]);
    } catch (err) {
      console.error('deleteUserAccount error:', err);
    }
  },

  async createAdmin(params: { email: string; name: string; phone?: string; password: string }): Promise<string> {
    const userPassword = params.password;

    const { data: inviteId, error } = await supabase.rpc('invite_user_by_admin', {
      user_email: params.email,
      user_full_name: params.name,
      user_phone: params.phone || null,
      user_role: 'admin',
      user_password: userPassword
    });
    if (error) throw error;

    // Send email via Edge Function
    const inviteLink = `${window.location.origin}/login/admin?email=${encodeURIComponent(params.email)}`;
    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 24px; font-weight: bold; color: #2563eb;">All in one</span>
            <span style="font-size: 24px; font-weight: bold; color: #1e293b;">Marketplace</span>
          </div>
          <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #2563eb, #8b5cf6); margin: 0 auto; border-radius: 2px;"></div>
        </div>

        <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;">
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Welcome to the Team, ${params.name}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
            You have been invited to join the platform as a staff member. Your account has been created with the role of <strong style="color: #2563eb;">Admin</strong>.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Credentials</p>
            <div style="font-family: monospace; font-size: 14px; color: #0f172a; line-height: 1.8;">
              <strong>Email Address:</strong> ${params.email}<br/>
              <strong>Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${userPassword}</code>
            </div>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="display: inline-block; padding: 14px 28px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">Sign In to Admin Portal</a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
          <p>© 2026 All in one Marketplace. All rights reserved.</p>
        </div>
      </div>
    `;

    const plainText = `Welcome to the Team, ${params.name}!\n\nYou have been added as an Admin to All in One Marketplace.\n\nYour Credentials:\nEmail: ${params.email}\nPassword: ${userPassword}\n\nLogin URL: ${inviteLink}`;

    try {
      const { data: resData, error: resError } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.email,
          subject: `Welcome ${params.name} - Admin Access Credentials`,
          text: plainText,
          html: emailBody
        }
      });
      if (resError) {
        console.error('❌ Edge function returned error:', resError);
      } else {
        console.log('✅ Edge function success:', resData);
      }
    } catch (fnErr) {
      console.error('❌ Edge function invocation threw error:', fnErr);
    }

    return inviteId;
  },

  async createModerator(params: { email: string; name: string; phone?: string; password: string }): Promise<string> {
    const userPassword = params.password;

    const { data: inviteId, error } = await supabase.rpc('invite_user_by_admin', {
      user_email: params.email,
      user_full_name: params.name,
      user_phone: params.phone || null,
      user_role: 'moderator',
      user_password: userPassword
    });
    if (error) throw error;

    // Send email via Edge Function
    const inviteLink = `${window.location.origin}/login/moderator?email=${encodeURIComponent(params.email)}`;
    const emailBody = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-flex; align-items: center; gap: 8px; margin-bottom: 12px;">
            <span style="font-size: 24px; font-weight: bold; color: #10b981;">All in one</span>
            <span style="font-size: 24px; font-weight: bold; color: #1e293b;">Marketplace</span>
          </div>
          <div style="height: 4px; width: 60px; background: linear-gradient(90deg, #10b981, #8b5cf6); margin: 0 auto; border-radius: 2px;"></div>
        </div>

        <div style="background-color: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); border: 1px solid #f1f5f9;">
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-top: 0; margin-bottom: 16px;">Welcome to the Team, ${params.name}!</h2>
          <p style="font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
            You have been invited to join the platform as a staff member. Your account has been created with the role of <strong style="color: #10b981;">Moderator</strong>.
          </p>

          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 10px 0; font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Your Login Credentials</p>
            <div style="font-family: monospace; font-size: 14px; color: #0f172a; line-height: 1.8;">
              <strong>Email Address:</strong> ${params.email}<br/>
              <strong>Password:</strong> <code style="background-color: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-weight: bold;">${userPassword}</code>
            </div>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${inviteLink}" style="display: inline-block; padding: 14px 28px; background-color: #10b981; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);">Sign In to Moderator Portal</a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px; font-size: 12px; color: #94a3b8;">
          <p>© 2026 All in one Marketplace. All rights reserved.</p>
        </div>
      </div>
    `;

    const plainText = `Welcome to the Team, ${params.name}!\n\nYou have been added as a Moderator to All in One Marketplace.\n\nYour Credentials:\nEmail: ${params.email}\nPassword: ${userPassword}\n\nLogin URL: ${inviteLink}`;

    try {
      const { data: resData, error: resError } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.email,
          subject: `Welcome ${params.name} - Moderator Access Credentials`,
          text: plainText,
          html: emailBody
        }
      });
      if (resError) {
        console.error('❌ Edge function returned error:', resError);
      } else {
        console.log('✅ Edge function success:', resData);
      }
    } catch (fnErr) {
      console.error('❌ Edge function invocation threw error:', fnErr);
    }

    return inviteId;
  },

  async updateAdmin(id: string, params: { email: string; name: string; phone?: string; password?: string }) {
    const { error } = await supabase.rpc('update_admin_user', {
      target_user_id: id,
      new_email: params.email,
      new_full_name: params.name,
      new_phone: params.phone || null,
      new_password: params.password || null
    });
    if (error) throw error;
  },

  async sendWelcomeEmail(params: { email: string; name: string }) {
    if (!params.email) return;

    const appOrigin = typeof window !== 'undefined' && window.location.origin.includes('localhost')
      ? 'https://all-in-one-classified.vercel.app'
      : (typeof window !== 'undefined' ? window.location.origin : 'https://all-in-one-classified.vercel.app');

    const getStartedUrl = appOrigin;
    const supportUrl = `${appOrigin}/contact`;
    const userName = params.name || 'Member';

    const emailBody = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Welcome to All In One</title></head>
      <body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #2563eb; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">All In One</h1>
          </div>
          <div style="padding: 28px 24px;">
            <h2 style="font-size: 18px; margin: 0 0 14px 0; color: #0f172a;">Welcome, ${userName}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0 0 20px 0;">Your account registration is complete and your email is verified. You can now post ads, explore products, and chat directly with buyers and sellers.</p>
            <div style="text-align: center; margin: 28px 0;">
              <a href="${getStartedUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">Get Started</a>
            </div>
            <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">If you ever have any questions, our support team is here to help at <a href="${supportUrl}" style="color: #2563eb; text-decoration: none;">${supportUrl}</a>.</p>
          </div>
          <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
            © ${new Date().getFullYear()} All In One Marketplace. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;

    const plainText = `Welcome to All In One, ${userName}!\n\nYour account registration is complete. You can now browse listings and post ads.\n\nAccess your account: ${getStartedUrl}\nSupport: ${supportUrl}`;

    try {
      const { data: resData, error: resError } = await supabase.functions.invoke('send-email', {
        body: {
          to: params.email,
          subject: `Welcome to All In One Marketplace, ${userName}!`,
          text: plainText,
          html: emailBody
        }
      });
      if (resError) {
        console.error('❌ Welcome email error:', resError);
      } else {
        console.log('✅ Welcome email sent successfully:', resData);
      }
    } catch (err) {
      console.error('❌ Welcome email invocation error:', err);
    }
  },
};

// ============================================================
// PAYMENTS & PAYMENT ACCOUNTS
// ============================================================
export const DEFAULT_PAYMENT_ACCOUNTS: PaymentAccount[] = [
  {
    id: 'acc-meezan-01',
    account_type: 'bank',
    bank_name: 'Meezan Bank',
    account_title: 'All In One Classifieds (Pvt) Ltd',
    account_number: '01010102938475',
    iban: 'PK45MEZN0001010102938475',
    instructions: 'Send exact package amount and upload clear transaction slip / screenshot.',
    is_active: true,
  },
  {
    id: 'acc-easypaisa-01',
    account_type: 'easypaisa',
    bank_name: 'EasyPaisa Wallet',
    account_title: 'Muhammad Abdullah',
    account_number: '03001234567',
    instructions: 'Transfer via EasyPaisa app or retail shop. Ensure TRX ID is clearly visible in screenshot.',
    is_active: true,
  },
  {
    id: 'acc-jazzcash-01',
    account_type: 'jazzcash',
    bank_name: 'JazzCash Wallet',
    account_title: 'Muhammad Abdullah',
    account_number: '03007654321',
    instructions: 'Send payment to JazzCash mobile account and attach payment receipt proof.',
    is_active: true,
  },
];

const LOCAL_ACCOUNTS_KEY = 'aio_payment_accounts';
const CONFIG_STORAGE_PATH = 'config/payment_accounts.json';

const getLocalPaymentAccounts = (): PaymentAccount[] => {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_PAYMENT_ACCOUNTS;
};

const setLocalPaymentAccounts = (accounts: PaymentAccount[]) => {
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
};

const syncCloudAccounts = async (accounts: PaymentAccount[]) => {
  try {
    const jsonBlob = new Blob([JSON.stringify(accounts, null, 2)], { type: 'application/json' });
    await supabase.storage
      .from('listing-images')
      .upload(CONFIG_STORAGE_PATH, jsonBlob, { upsert: true, cacheControl: '0' });
  } catch (err) {
    console.warn('Could not sync accounts to cloud storage fallback:', err);
  }
};

const fetchCloudAccounts = async (): Promise<PaymentAccount[] | null> => {
  try {
    const { data } = supabase.storage
      .from('listing-images')
      .getPublicUrl(CONFIG_STORAGE_PATH);
    if (data?.publicUrl) {
      const res = await fetch(`${data.publicUrl}?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json) && json.length > 0) {
          setLocalPaymentAccounts(json);
          return json as PaymentAccount[];
        }
      }
    }
  } catch {}
  return null;
};

export const paymentsService = {
  async getPayments() {
    const { data, error } = await supabase
      .from('payments')
      .select(`*, user:users!payments_user_id_fkey(id, full_name, email), listing:listings(id, title, is_featured, featured_until)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []) as Payment[];
  },

  async createPayment(payment: Record<string, unknown>) {
    const { data, error } = await supabase.from('payments').insert(payment).select().single();
    if (error) throw error;
    return data;
  },

  async updatePayment(id: string, updates: Record<string, unknown>) {
    const { error } = await supabase.from('payments').update(updates).eq('id', id);
    if (error) throw error;
  },

  async getPaymentAccounts(): Promise<PaymentAccount[]> {
    // 1. Try Supabase SQL Table
    try {
      const { data, error } = await supabase
        .from('payment_accounts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocalPaymentAccounts(data as PaymentAccount[]);
        return data as PaymentAccount[];
      }
    } catch {}

    // 2. Try Supabase Cloud Storage (universal real-time cloud sync across all users)
    const cloudAccounts = await fetchCloudAccounts();
    if (cloudAccounts && cloudAccounts.length > 0) {
      return cloudAccounts.filter(a => a.is_active !== false);
    }

    // 3. Fallback to localStorage or defaults
    return getLocalPaymentAccounts().filter(a => a.is_active !== false);
  },

  async getAllPaymentAccounts(): Promise<PaymentAccount[]> {
    // 1. Try Supabase SQL Table
    try {
      const { data, error } = await supabase
        .from('payment_accounts')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        setLocalPaymentAccounts(data as PaymentAccount[]);
        return data as PaymentAccount[];
      }
    } catch {}

    // 2. Try Supabase Cloud Storage
    const cloudAccounts = await fetchCloudAccounts();
    if (cloudAccounts && cloudAccounts.length > 0) {
      return cloudAccounts;
    }

    // 3. Fallback to localStorage or defaults
    return getLocalPaymentAccounts();
  },

  async createPaymentAccount(account: Omit<PaymentAccount, 'id' | 'created_at' | 'updated_at'>): Promise<PaymentAccount> {
    let createdItem: PaymentAccount | null = null;
    try {
      const { data, error } = await supabase
        .from('payment_accounts')
        .insert({
          account_type: account.account_type,
          bank_name: account.bank_name,
          account_title: account.account_title,
          account_number: account.account_number,
          iban: account.iban || null,
          instructions: account.instructions || null,
          is_active: account.is_active ?? true,
        })
        .select()
        .single();
      if (!error && data) {
        createdItem = data as PaymentAccount;
      }
    } catch (e) {
      console.warn('payment_accounts table insert not available, saving to cloud/local fallback:', e);
    }

    if (!createdItem) {
      createdItem = {
        id: 'acc-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        account_type: account.account_type,
        bank_name: account.bank_name,
        account_title: account.account_title,
        account_number: account.account_number,
        iban: account.iban || undefined,
        instructions: account.instructions || undefined,
        is_active: account.is_active ?? true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const current = getLocalPaymentAccounts();
    const updated = [createdItem, ...current.filter(a => a.id !== createdItem?.id)];
    setLocalPaymentAccounts(updated);
    await syncCloudAccounts(updated);
    return createdItem;
  },

  async updatePaymentAccount(id: string, updates: Partial<PaymentAccount>): Promise<void> {
    try {
      await supabase
        .from('payment_accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (e) {
      console.warn('payment_accounts table update error:', e);
    }

    const local = getLocalPaymentAccounts();
    const updated = local.map(a => a.id === id ? { ...a, ...updates, updated_at: new Date().toISOString() } : a);
    setLocalPaymentAccounts(updated);
    await syncCloudAccounts(updated);
  },

  async deletePaymentAccount(id: string): Promise<void> {
    try {
      await supabase
        .from('payment_accounts')
        .delete()
        .eq('id', id);
    } catch (e) {
      console.warn('payment_accounts table delete error:', e);
    }

    const local = getLocalPaymentAccounts();
    const updated = local.filter(a => a.id !== id);
    setLocalPaymentAccounts(updated);
    await syncCloudAccounts(updated);
  },

  async uploadReceiptScreenshot(file: File, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const fileName = `receipts/${userId}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listing-images')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (!uploadError) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(fileName);
        if (data?.publicUrl) return data.publicUrl;
      }
    } catch (e) {
      console.warn('Storage upload error, falling back to base64 receipt:', e);
    }

    // Fallback to base64 Data URL if storage bucket fails
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  async submitManualPayment(params: {
    listing_id: string;
    user_id: string;
    amount: number;
    package_name: string;
    duration_days: number;
    transaction_id: string;
    receipt_file: File;
    notes?: string;
  }) {
    const receiptUrl = await this.uploadReceiptScreenshot(params.receipt_file, params.user_id);

    const notesWithProof = params.notes
      ? `${params.notes} | Proof: ${receiptUrl}`
      : `Manual payment proof: ${receiptUrl}`;

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          listing_id: params.listing_id,
          user_id: params.user_id,
          amount: params.amount,
          currency: 'PKR',
          method: 'Manual Bank / Wallet Transfer',
          status: 'pending',
          transaction_id: params.transaction_id,
          receipt_url: receiptUrl,
          package_name: params.package_name,
          duration_days: params.duration_days,
          notes: notesWithProof,
        })
        .select()
        .single();

      if (!error && data) return data;
      if (error) throw error;
    } catch {
      // Fallback if receipt_url column does not exist in schema cache
      const { data, error } = await supabase
        .from('payments')
        .insert({
          listing_id: params.listing_id,
          user_id: params.user_id,
          amount: params.amount,
          currency: 'PKR',
          method: 'Manual Bank / Wallet Transfer',
          status: 'pending',
          transaction_id: params.transaction_id,
          package_name: params.package_name,
          duration_days: params.duration_days,
          notes: notesWithProof,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  async approveAndPromote(paymentId: string, adminId: string, status: string = 'completed') {
    try {
      const { error } = await supabase.rpc('approve_payment_and_promote', {
        p_payment_id: paymentId,
        p_admin_id: adminId,
        p_status: status,
      });
      if (error) throw error;
    } catch {
      // Fallback if RPC not yet created in Supabase SQL editor
      await supabase
        .from('payments')
        .update({ status, verified_by: adminId, updated_at: new Date().toISOString() })
        .eq('id', paymentId);
      
      if (status === 'completed') {
        const { data: p } = await supabase.from('payments').select('listing_id, duration_days, package_name').eq('id', paymentId).single();
        if (p && p.listing_id) {
          const days = p.duration_days || 7;
          const until = new Date();
          until.setDate(until.getDate() + days);
          await supabase.from('listings').update({
            is_featured: true,
            featured_until: until.toISOString(),
            featured_package: p.package_name || 'Featured',
          }).eq('id', p.listing_id);
        }
      }
    }
  },
};

// ============================================================
// ANALYTICS
// ============================================================
export const analyticsService = {
  async getDashboardStats() {
    const [listings, users, payments] = await Promise.all([
      supabase.from('listings').select('status', { count: 'exact' }),
      supabase.from('users').select('role', { count: 'exact' }),
      supabase.from('payments').select('amount, status'),
    ]);

    const totalRevenue = (payments.data || [])
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      total_listings: listings.count || 0,
      total_users: users.count || 0,
      total_revenue: totalRevenue,
      listings_by_status: listings.data || [],
    };
  },
};
