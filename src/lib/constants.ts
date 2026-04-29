export function calculateTrueSolarTime(dateStr: string, timeStr: string, lng: number) {
  // 120°E is Beijing Time.
  // Correction: (lng - 120) * 4 minutes.
  const correctionMinutes = (lng - 120) * 4;
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  let totalMinutes = hours * 60 + minutes + correctionMinutes;
  
  // Handle overflow/underflow
  if (totalMinutes < 0) totalMinutes += 24 * 60;
  if (totalMinutes >= 24 * 60) totalMinutes -= 24 * 60;
  
  const h = Math.floor(totalMinutes / 60);
  const m = Math.round(totalMinutes % 60);
  
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}
