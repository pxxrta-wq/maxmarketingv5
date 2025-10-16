import { useEffect, useState } from "react";

interface TrackingStats {
  emails_generated: number;
  plans_generated: number;
  social_posts_generated: number;
  chats_count: number;
  pitch_created: number;
  avatars_generated: number;
}

export const useTracking = () => {
  const [stats, setStats] = useState<TrackingStats>({
    emails_generated: 0,
    plans_generated: 0,
    social_posts_generated: 0,
    chats_count: 0,
    pitch_created: 0,
    avatars_generated: 0,
  });

  const loadStats = () => {
    const tracking = localStorage.getItem("max_tracking");
    if (tracking) {
      setStats(JSON.parse(tracking));
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const trackAction = (action: keyof TrackingStats) => {
    const currentStats = JSON.parse(localStorage.getItem("max_tracking") || JSON.stringify(stats));
    currentStats[action] = (currentStats[action] || 0) + 1;
    localStorage.setItem("max_tracking", JSON.stringify(currentStats));
    setStats(currentStats);
  };

  return { stats, trackAction, loadStats };
};
