import { supabase } from '../lib/supabase';

/**
 * UTILITY TYPES
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

  // --- 3. ORDERING SYSTEM ---
  orders: {
    async placeOrder(orderData: any, items: any[]) {
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderErr) throw orderErr;

      const preparedItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        selected_options: item.options 
      }));

      const { error: itemsErr } = await supabase.from('order_items').insert(preparedItems);
      if (itemsErr) throw itemsErr;

      // Automatically award points: 10 per item
      await SupabaseService.loyalty.awardOrderPoints(orderData.user_id, items.length);

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

  // --- 4. LOYALTY SYSTEM ---
  loyalty: {
    async awardPoints(userId: string, amount: number, reason: string) {
      const { data, error } = await supabase.rpc('increment_loyalty', { 
        user_id: userId, 
        amount: amount 
      });

      await supabase.from('audit_logs').insert([{
        actor_id: userId,
        action: `LOYALTY_EARNED: ${reason}`,
        entity_type: 'loyalty_points',
        entity_id: userId
      }]);

      return { data, error };
    },

    async handleShare(userId: string) {
      return SupabaseService.loyalty.awardPoints(userId, 100, "App Shared");
    },

    async awardOrderPoints(userId: string, itemCount: number) {
      const totalPoints = itemCount * 10;
      return SupabaseService.loyalty.awardPoints(userId, totalPoints, `Ordered ${itemCount} items`);
    }
  },

  // --- 5. MARKETING & PROMO ---
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

  // --- 6. WALLET & FINANCES ---
  wallet: {
    async getBalance(userId: string) {
      return await supabase.from('wallets').select('*').eq('owner_id', userId).single();
    },
    
    async createTransaction(order_id: string, amount: number) {
      return await supabase.from('transactions').insert([{
        order_id,
        amount,
        status: 'success'
      }]);
    }
  },

  // --- 7. DISCOVERY & ANALYTICS ---
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

  // --- 8. SUPPORT & FEEDBACK ---
  support: {
    async submitReview(restaurantId: string, userId: string, rating: number, comment: string) {
      const { data, error } = await supabase.from('reviews').insert([{
        restaurant_id: restaurantId,
        user_id: userId,
        rating,
        comment
      }]);

      if (!error) {
        // Award 25 for rating + 75 extra if there is a comment (Total 100)
        const points = comment ? 100 : 25;
        await SupabaseService.loyalty.awardPoints(userId, points, "Reviewed Item");
      }
      
      return { data, error };
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
