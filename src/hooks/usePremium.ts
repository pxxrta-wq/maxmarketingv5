import { useState, useEffect } from "react";

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremium = () => {
      const status = localStorage.getItem("max_premium") === "true";
      setIsPremium(status);
    };

    checkPremium();
    
    // Listen for storage changes
    window.addEventListener("storage", checkPremium);
    
    return () => {
      window.removeEventListener("storage", checkPremium);
    };
  }, []);

  return isPremium;
};
