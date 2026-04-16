import { supabase } from '../lib/supabase';

/**
 * UTILITY TYPES
 * Based on your SQL Schema ..
 */
export type ServiceType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';

export const SupabaseService = {
  
  // --- 1. USER & PROFILE OPERATIONS ---
  users: {
    async getProfile(telegramId: number) {
      return await supabase.from('app_users').select('*').eq('telegram_id', telegramId).single();
    },
    async updateLoyalty(userId: string, points: number) {
      return await supabase.rpc('increment_loyalty', { user_id: userId, amount: points });
    }
  },

  // --- 2. RESTAURANT & MENU OPERATIONS ---
  restaurants: {
    async getAll(city?: string) {
      let query = supabase.from('restaurants').select(`
        *,
        operating_hours (*),
        delivery_zones (*)
      `);
      if (city) query = query.eq('city', city);
      return await query;
    },
    
    async getFullMenu(restaurantId: string) {
      return await supabase.from('menu_items').select(`
        *,
        menu_item_options (
          *,
          menu_item_values (*)
        )
      `).eq('restaurant_id', restaurantId);
    }
  },

  // --- 3. ORDERING SYSTEM (Complex CRUD) ---
  orders: {
    /**
     * Creates an order and its items in a single logical flow
     */
    async placeOrder(orderData: any, items: any[]) {
      // 1. Insert the main order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // 2. Insert order items
      const preparedItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        selected_options: item.options // jsonb field
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(preparedItems);
      if (itemsErr) throw itemsErr;

      return order;
    },

    async getHistory(userId: string) {
      return await supabase
        .from('orders')
        .select(`*, restaurants(name, logo_url), order_items(*)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },

    async updateStatus(orderId: string, status: OrderStatus) {
      return await supabase.from('orders').update({ status }).eq('id', orderId);
    }
  },

  // --- 4. ADVERTISING & PROMO ---
  marketing: {
    async getActiveAds(placement: string = 'home_screen') {
      return await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .eq('placement', placement)
        .gt('ends_at', new Date().toISOString());
    },
    
    async validatePromo(code: string) {
      return await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();
    }
  },

  // --- 5. WALLET & FINANCES ---
  wallet: {
    async getBalance(userId: string) {
      return await supabase.from('wallets').select('*').eq('owner_id', userId).single();
    },
    
    async createTransaction(orderId: string, amount: number) {
      return await supabase.from('transactions').insert([{
        order_id: orderId,
        amount,
        status: 'success'
      }]);
    }
  },

  // --- 6. DISCOVERY & ANALYTICS ---
  discovery: {
    async logSearch(userId: string, query: string, count: number) {
      return await supabase.from('search_analytics').insert([{
        user_id: userId,
        query,
        results_count: count
      }]);
    },

    async toggleFavorite(userId: string, restaurantId: string, isFavorite: boolean) {
      if (isFavorite) {
        return await supabase.from('favorites').insert([{ user_id: userId, restaurant_id: restaurantId }]);
      } else {
        return await supabase.from('favorites').delete().match({ user_id: userId, restaurant_id: restaurantId });
      }
    }
  },

  // --- 7. SUPPORT & FEEDBACK ---
  support: {
    async submitReview(restaurantId: string, userId: string, rating: number, comment: string) {
      return await supabase.from('reviews').insert([{
        restaurant_id: restaurantId,
        user_id: userId,
        rating,
        comment
      }]);
    },
    
    async createTicket(userId: string, subject: string, orderId?: string) {
      return await supabase.from('support_tickets').insert([{
        user_id: userId,
        subject,
        order_id: orderId,
        status: 'open'
      }]);
    }
  }
};
