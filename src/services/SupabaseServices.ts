import { supabase } from '../lib/supabase';

/**
 * MASTER TYPES & ENUMS
 * Strictly aligned with SQL Check Constraints
 */
export type ServiceType = 'dine_in' | 'takeaway' | 'delivery';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type UserRole = 'customer' | 'owner' | 'admin' | 'promoter' | 'courier';
export type AdPlacement = 'home_screen' | 'search_results' | 'category_page';

export const SupabaseService = {

  // --- 1. USER & PROFILE MANAGEMENT ---
  users: {
    async getProfile(telegramId: number) {
      return await supabase
        .from('app_users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();
    },

    async updateProfile(userId: string, updates: any) {
      return await supabase
        .from('app_users')
        .update(updates)
        .eq('id', userId);
    },

    async getAddresses(userId: string) {
      return await supabase
        .from('user_addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });
    },

    async addAddress(addressData: { user_id: string; label: string; address_line: string; is_default?: boolean }) {
      return await supabase
        .from('user_addresses')
        .insert([addressData]);
    },

    async getNotifications(userId: string) {
      return await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },

    async markNotificationRead(id: string) {
      return await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    }
  },

  // --- 2. RESTAURANT & LOGISTICS ---
  restaurants: {
    async getAll(city?: string) {
      let query = supabase
        .from('restaurants')
        .select(`*, operating_hours (*), delivery_zones (*)`);
      
      if (city) {
        query = query.eq('city', city);
      }
      return await query;
    },

    async getById(id: string) {
      return await supabase
        .from('restaurants')
        .select(`*, operating_hours(*), delivery_zones(*)`)
        .eq('id', id)
        .single();
    },

    async getFullMenu(restaurantId: string) {
      return await supabase
        .from('menu_items')
        .select(`
          *,
          menu_categories(name, icon),
          menu_item_options (
            *,
            menu_item_values (*)
          )
        `)
        .eq('restaurant_id', restaurantId)
        .order('created_at');
    },

    async getGallery(restaurantId: string) {
      return await supabase
        .from('media_assets')
        .select('*')
        .eq('restaurant_id', restaurantId);
    },

    async getNearbyDeals(userLat: number, userLng: number, radiusKm: number = 1.0) {
      const { data: nearby, error } = await supabase.rpc('get_nearby_restaurants', {
        user_lat: userLat,
        user_lng: userLng,
        radius_km: radiusKm
      });

      if (error) throw error;

      return nearby.map((res: any) => ({
        ...res,
        navigation_url: `https://www.google.com/maps/dir/?api=1&destination=${res.latitude},${res.longitude}&travelmode=walking`
      }));
    }
  },

  // --- 3. COURIER OPERATIONS ---
  couriers: {
    async updateLocation(courierId: string, lat: number, lng: number) {
      return await supabase
        .from('couriers')
        .update({
          current_latitude: lat,
          current_longitude: lng,
          last_location_update: new Date().toISOString()
        })
        .eq('id', courierId);
    },

    async setAvailability(courierId: string, isActive: boolean) {
      return await supabase
        .from('couriers')
        .update({ is_active: isActive })
        .eq('id', courierId);
    }
  },

  // --- 4. THE ORDERING ENGINE ---
  orders: {
    async placeOrder(orderData: { 
      user_id: string; 
      restaurant_id: string; 
      service_type: ServiceType; 
      total: number; 
      delivery_fee?: number; 
      promoter_id?: string; 
      notes?: string;
    }, items: any[]) {
      
      // Step 1: Insert Master Order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (orderErr) throw orderErr;

      // Step 2: Batch Insert Items
      const preparedItems = items.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        selected_options: item.options 
      }));

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(preparedItems);

      if (itemsErr) throw itemsErr;

      // Step 3: Trigger Automation
      await SupabaseService.loyalty.awardOrderPoints(orderData.user_id, items.length);
      
      if (orderData.promoter_id) {
        await SupabaseService.finance.calculateCommission(order.id, orderData.promoter_id, orderData.total);
      }

      return order;
    },

    async getOrderHistory(userId: string) {
      return await supabase
        .from('orders')
        .select(`*, restaurants(name, logo_url), order_items(*, menu_items(name))`)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    },

    async updateOrderStatus(orderId: string, status: OrderStatus) {
      return await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
    }
  },

  // --- 5. LOYALTY & GAMIFICATION ---
  loyalty: {
    async awardPoints(userId: string, amount: number, reason: string) {
      const { data, error } = await supabase.rpc('increment_loyalty', { 
        user_id: userId, 
        amount: amount 
      });

      await supabase.from('audit_logs').insert([{
        actor_id: userId,
        action: `POINTS_EARNED: ${reason}`,
        entity_type: 'loyalty_points',
        entity_id: userId
      }]);

      return { data, error };
    },

    async awardOrderPoints(userId: string, itemCount: number) {
      return this.awardPoints(userId, itemCount * 10, `Order reward: ${itemCount} items`);
    },

    async handleReferral(userId: string) {
      return this.awardPoints(userId, 100, "App Referral/Share");
    }
  },

  // --- 6. FINANCE, WALLETS & PAYOUTS ---
  finance: {
    async getWalletBalance(userId: string) {
      return await supabase
        .from('wallets')
        .select('*')
        .eq('owner_id', userId)
        .single();
    },

    async calculateCommission(orderId: string, promoterId: string, orderTotal: number) {
      const { data: user } = await supabase
        .from('app_users')
        .select('promoter_commission_rate')
        .eq('id', promoterId)
        .single();

      const rate = user?.promoter_commission_rate || 0;
      const commission = (orderTotal * rate) / 100;

      if (commission > 0) {
        await supabase.rpc('increment_wallet_balance', { 
          user_id: promoterId, 
          amount: commission 
        });

        return await supabase.from('transactions').insert([{
          order_id: orderId,
          amount: commission,
          status: 'success',
          currency: 'AED'
        }]);
      }
    },

    async requestPayout(walletId: string, amount: number, method: string) {
      return await supabase
        .from('payouts')
        .insert([{ 
          wallet_id: walletId, 
          amount: amount, 
          method: method, 
          status: 'pending' 
        }]);
    }
  },

  // --- 7. MARKETING & DISCOVERY ---
  marketing: {
    async getActiveAds(placement: AdPlacement = 'home_screen') {
      return await supabase
        .from('ads')
        .select('*')
        .eq('is_active', true)
        .eq('placement', placement)
        .gt('ends_at', new Date().toISOString());
    },

    async recordAdClick(adId: string) {
      return await supabase.rpc('increment_ad_click', { ad_id: adId });
    },

    async checkPromoCode(code: string) {
      return await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();
    }
  },

  discovery: {
    async logSearch(userId: string, query: string, resultCount: number) {
      return await supabase
        .from('search_analytics')
        .insert([{ 
          user_id: userId, 
          query: query, 
          results_count: resultCount 
        }]);
    },

    async toggleFavorite(userId: string, restaurantId: string, isCurrentlyFavorite: boolean) {
      if (isCurrentlyFavorite) {
        return await supabase
          .from('favorites')
          .delete()
          .match({ user_id: userId, restaurant_id: restaurantId });
      } else {
        return await supabase
          .from('favorites')
          .insert([{ user_id: userId, restaurant_id: restaurantId }]);
      }
    }
  },

  // --- 8. SUPPORT & REVIEWS ---
  support: {
    async submitReview(restaurantId: string, userId: string, rating: number, comment: string) {
      const { error } = await supabase
        .from('reviews')
        .insert([{ 
          restaurant_id: restaurantId, 
          user_id: userId, 
          rating: rating, 
          comment: comment 
        }]);

      if (!error) {
        const points = comment.trim().length > 0 ? 100 : 25;
        await SupabaseService.loyalty.awardPoints(userId, points, comment ? "Detailed Review" : "Star Rating");
      }
    },

    async openSupportTicket(userId: string, subject: string, orderId?: string) {
      return await supabase
        .from('support_tickets')
        .insert([{ 
          user_id: userId, 
          subject: subject, 
          order_id: orderId, 
          status: 'open' 
        }]);
    },

    async getAppSettings(key: string) {
      return await supabase
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .single();
    }
  }
};
