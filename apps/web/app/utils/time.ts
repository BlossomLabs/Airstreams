const units = {
  years: 31536000,
  months: 2592000,
  days: 86400,
  hours: 3600,
  minutes: 60,
};

export function getTimeInSeconds(amount: number, unit: keyof typeof units) {
  return amount * units[unit];
}
