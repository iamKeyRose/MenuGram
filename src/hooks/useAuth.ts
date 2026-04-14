import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTelegram } from './useTelegram';

export const useAuth = () => {
  const { user: tgUser } = useTelegram();
  const [dbUser, setDbUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncUser = async () => {
      if (!tgUser) return;

      let { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('telegram_id', tgUser.id)
        .single();

      if (error && error.code === 'PGRST116') {
        const { data: newUser, error: insertError } = await supabase
          .from('app_users')
          .insert([{
            telegram_id: tgUser.id,
            display_name: `${tgUser.first_name} ${tgUser.last_name || ''}`.trim(),
            username: tgUser.username,
            role: 'customer', 
            avatar_url: tgUser.photo_url
          }])
          .select()
          .single();
        
        if (!insertError) setDbUser(newUser);
      } else {
        setDbUser(data);
      }
      setLoading(false);
    };

    syncUser();
  }, [tgUser]);

  return { dbUser, loading };
};
