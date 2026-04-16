import { supabase } from '../lib/supabase';

/**
 * MASTER TYPES
 */
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type ServiceType = 'dine_in' | 'takeaway' | 'delivery';
export type CourierVehicle = 'bike' | 'car' | 'scooter';

export const SupabaseService = {

  // --- 1. USER & PROFILE ---
  users: {
    async getProfile(telegramId: number) {
      return await supabase.from('app_users').select('*').eq('telegram_id', telegramId).single();
    },
    async updateProfile(userId: string, updates: any) {
      return await supabase.from('app_users').update(updates).eq('id', userId);
    },
    async getAddresses(userId: string) {
      return await supabase.from('user_addresses').select('*').eq('user_id', userId);
    },
    async getNotifications(userId: string) {
      return await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    },
    async markNotificationRead(notificationId: string) {
      return await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId);
    }
  },

  // --- 2. RESTAURANTS, LOGISTICS & MEDIA ---
  restaurants: {
    async getAll(city?: string) {
      let query = supabase.from('restaurants').select('*, operating_hours(*), delivery_zones(*)');
      if (city) query = query.eq('city', city);
      return await query;
    },
    async getGallery(restaurantId: string) {
      return await supabase.from('media_assets').select('*').eq('restaurant_id', restaurantId);
    },
    async getFullMenu(restaurantId: string) {
      return await supabase.from('menu_items').select(`
        *,
        menu_categories(*),
        menu_item_options (*, menu_item_values (*))
      `).eq('restaurant_id', restaurantId).order('created_at');
    },
    async getNearbyDeals(userLat: number, userLng: number) {
      const { data: restaurants, error } = await supabase.rpc('get_nearby_restaurants', {
        user_lat: userLat,
        user_lng: userLng,
        radius_km: 1.0 
      });
      if (error) throw error;
      return restaurants.map((res: any) => ({
        ...res,
        navigation_url: `https://www.google.com/maps/dir/?api=1&destination=${res.latitude},${res.longitude}&travelmode=walking`
      }));
    }
  },

  // --- 3. COURIER OPERATIONS ---
  couriers: {
    async getActiveInZone(lat: number, lng: number) {
      return await supabase.from('couriers').select('*, app_users(display_name)').eq('is_active', true);
    },
    async updateLocation(courierId: string, lat: number, lng: number) {
      return await supabase.from('couriers').update({
        current_latitude: lat,
        current_longitude: lng,
        last_location_update: new Date().toISOString()
      }).eq('id', courierId);
    }
  },

  // --- 4. ADVANCED ORDERING SYSTEM ---
  orders: {
    async placeOrder(orderData: any, items: any[]) {
      const { data: order, error: orderErr } = await supabase.from('orders').insert([orderData]).select().single();
      if (orderErr) throw orderErr;

      const preparedItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        selected_options: item.options 
      }));
      await supabase.from('order_items').insert(preparedItems);

      await SupabaseService.loyalty.awardPoints(orderData.user_id, items.length * 10, "Order reward");
      if (orderData.promoter_id) {
        await SupabaseService.finance.processCommission(order.id, orderData.promoter_id, orderData.total);
      }
      return order;
    },
    async updateStatus(orderId: string, status: OrderStatus) {
      return await supabase.from('orders').update({ status }).eq('id', orderId);
    },
    async getHistory(userId: string) {
      return await supabase.from('orders').select('*, restaurants(name, logo_url), order_items(*, menu_items(name))').eq('user_id', userId).order('created_at', { ascending: false });
    }
  },

  // --- 5. FINANCE & TRANSACTIONS ---
  finance: {
    async getWallet(userId: string) {
      return await supabase.from('wallets').select('*').eq('owner_id', userId).single();
    },
    async getTransactions(orderId?: string) {
      let query = supabase.from('transactions').select('*');
      if (orderId) query = query.eq('order_id', orderId);
      return await query;
    },
    async processCommission(orderId: string, promoterId: string, total: number) {
      const { data: user } = await supabase.from('app_users').select('promoter_commission_rate').eq('id', promoterId).single();
      const commission = (total * (user?.promoter_commission_rate || 0)) / 100;
      
      if (commission > 0) {
        await supabase.rpc('increment_wallet_balance', { user_id: promoterId, amount: commission });
        await supabase.from('transactions').insert([{ order_id: orderId, amount: commission, status: 'success', currency: 'AED' }]);
      }
    },
    async requestPayout(walletId: string, amount: number, method: string) {
      return await supabase.from('payouts').insert([{ wallet_id: walletId, amount, method, status: 'pending' }]);
    }
  },

  // --- 6. LOYALTY, MARKETING & ADS ---
  loyalty: {
    async awardPoints(userId: string, amount: number, reason: string) {
      await supabase.rpc('increment_loyalty', { user_id: userId, amount: amount });
      return await supabase.from('audit_logs').insert([{
        actor_id: userId,
        action: `LOYALTY_EARNED: ${reason}`,
        entity_type: 'loyalty_points',
        entity_id: userId
      }]);
    }
  },
  marketing: {
    async getActiveAds(placement: string = 'home_screen') {
      return await supabase.from('ads').select('*').eq('is_active', true).eq('placement', placement).gt('ends_at', new Date().toISOString());
    },
    async trackClick(adId: string) {
      return await supabase.rpc('increment_ad_click', { ad_id: adId });
    },
    async validatePromo(code: string) {
      return await supabase.from('promo_codes').select('*').eq('code', code).eq('is_active', true).single();
    }
  },

  // --- 7. DISCOVERY & ANALYTICS ---
  discovery: {
    async logSearch(userId: string, query: string, count: number) {
      return await supabase.from('search_analytics').insert([{ user_id: userId, query, results_count: count }]);
    },
    async toggleFavorite(userId: string, restaurantId: string, isFavorite: boolean) {
      if (isFavorite) {
        return await supabase.from('favorites').insert([{ user_id: userId, restaurant_id: restaurantId }]);
      } else {
        return await supabase.from('favorites').delete().match({ user_id: userId, restaurant_id: restaurantId });
      }
    }
  },

  // --- 8. SUPPORT & CONFIG ---
  support: {
    async submitReview(restaurantId: string, userId: string, rating: number, comment: string) {
      const { error } = await supabase.from('reviews').insert([{ restaurant_id: restaurantId, user_id: userId, rating, comment }]);
      if (!error) {
        const points = comment.trim().length > 0 ? 100 : 25;
        await SupabaseService.loyalty.awardPoints(userId, points, "Review reward");
      }
    },
    async createTicket(userId: string, subject: string, orderId?: string) {
      return await supabase.from('support_tickets').insert([{ user_id: userId, subject, order_id: orderId }]);
    },
    async getAppSettings(key: string) {
      return await supabase.from('app_settings').select('value').eq('key', key).single();
    }
  }
};
