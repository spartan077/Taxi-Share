import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from './supabase';
import { Notification } from '../types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const setupSubscription = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            const newNotification = payload.new as Notification;
            toast(newNotification.message, {
              icon: newNotification.type === 'ride_full' ? '🎉' : '✅',
            });
            setNotifications(prev => [newNotification, ...prev]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    };

    setupSubscription();
  }, []);

  return notifications;
}