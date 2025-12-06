import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AdminCheckResult {
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdminCheck(): AdminCheckResult {
  const { user, session, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (authLoading) return;
      
      if (!user || !session) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data, error: fnError } = await supabase.functions.invoke('check-admin-role', {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (fnError) {
          console.error('Admin check error:', fnError);
          setError(fnError.message);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.isAdmin === true);
        }
      } catch (err) {
        console.error('Failed to check admin role:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user, session, authLoading]);

  return { isAdmin, loading: loading || authLoading, error };
}
