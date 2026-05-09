import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Follow {
  follower_id: string; // db uses snake_case and composite keys
  followee_id: string;
  created_at: any;
}

export function useFollows(targetUserId?: string) {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<Follow[]>([]);
  const [following, setFollowing] = useState<Follow[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const target = targetUserId || user.id;

    const fetchFollows = async () => {
      // Get followers
      const { data: followersData } = await supabase
        .from('follows')
        .select('*')
        .eq('followee_id', target);
        
      if (followersData) {
        setFollowers(followersData as Follow[]);
        if (targetUserId) {
          setIsFollowing(followersData.some(f => f.follower_id === user.id));
        }
      }

      // Get following
      const { data: followingData } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', target);
        
      if (followingData) {
        setFollowing(followingData as Follow[]);
      }
      
      setLoading(false);
    };

    fetchFollows();

    const subscription = supabase
      .channel(`follows_changes_${target}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => {
        fetchFollows();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, targetUserId]);

  const toggleFollow = async (followeeId: string) => {
    if (!user) return;
    
    try {
      if (isFollowing) {
        setIsFollowing(false); // optimistic UI
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('followee_id', followeeId);
      } else {
        setIsFollowing(true); // optimistic UI
        await supabase
          .from('follows')
          .insert([{
            follower_id: user.id,
            followee_id: followeeId
          }]);
      }
    } catch (err: any) {
      console.error(err);
      setIsFollowing(prev => !prev); // revert
    }
  };

  // Convert for compatibility with existing UI
  const compatFollowers = followers.map(f => ({...f, id: `${f.follower_id}_${f.followee_id}`, followerId: f.follower_id, followeeId: f.followee_id}));
  const compatFollowing = following.map(f => ({...f, id: `${f.follower_id}_${f.followee_id}`, followerId: f.follower_id, followeeId: f.followee_id}));

  return { followers: compatFollowers, following: compatFollowing, isFollowing, toggleFollow, loading };
}
