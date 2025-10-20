export const typewriterEffect = async (
  text: string,
  onUpdate: (partial: string) => void,
  baseSpeed?: number
): Promise<void> => {
  let currentText = "";
  const textLength = text.length;
  
  // Adaptive speed based on text length - optimized for 3-6 seconds display
  let speed: number;
  if (textLength < 250) {
    speed = baseSpeed || 15; // 15-25ms range
  } else if (textLength < 600) {
    speed = baseSpeed || 10; // 10-18ms range
  } else {
    speed = baseSpeed || 6; // 6-12ms range
  }
  
  for (let i = 0; i < text.length; i++) {
    currentText += text[i];
    onUpdate(currentText);
    
    // Slight variation for natural feel
    const delay = Math.random() * 6 + speed;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};
