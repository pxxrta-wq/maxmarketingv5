import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("check-subscription");
      
      if (error) {
        console.error("Error checking subscription:", error);
        setIsPremium(false);
      } else {
        setIsPremium(data?.subscribed || false);
        // Sync with localStorage for backward compatibility
        localStorage.setItem("max_premium", data?.subscribed ? "true" : "false");
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
    
    // Refresh subscription status every minute
    const interval = setInterval(checkSubscription, 60000);
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkSubscription();
    });

    return () => {
      interval && clearInterval(interval);
      subscription?.unsubscribe();
    };
  }, []);

  return { isPremium, loading, refresh: checkSubscription };
};
