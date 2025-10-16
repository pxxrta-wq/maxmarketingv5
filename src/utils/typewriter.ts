export const typewriterEffect = async (
  text: string,
  onUpdate: (partial: string) => void,
  speed: number = 30
): Promise<void> => {
  let currentText = "";
  
  for (let i = 0; i < text.length; i++) {
    currentText += text[i];
    onUpdate(currentText);
    
    // Variable speed for more natural effect
    const delay = Math.random() * 20 + speed;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};
