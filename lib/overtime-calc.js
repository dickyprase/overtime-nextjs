// ============ OVERTIME CALCULATION - EXACT COPY FROM server.js ============

// Weekday rate map
const weekdayRateMap = { 1: 1.5, 1.5: 2.5, 2: 3.5, 2.5: 4.5, 3: 5.5 };

export function calculateOvertime(salary, mealAllowance, dayName, hours, isHoliday = false) {
  if (hours === -1) return 0;
  const isWeekend = ['sabtu', 'minggu', 'saturday', 'sunday'].includes(dayName.toLowerCase());
  if (hours === 0) {
    if (isWeekend || isHoliday) return 0;
    return mealAllowance;
  }
  const hourlyRate = salary / 173;
  if (isWeekend || isHoliday) return Math.round((hourlyRate * 2) * hours + mealAllowance);
  const rate = weekdayRateMap[hours] || hours * 1.5;
  return Math.round((hourlyRate * rate) + mealAllowance);
}

export function roundToThousand(v) {
  const r = v % 1000;
  return r < 500 ? v - r : v + (1000 - r);
}

// Get week period (Thursday to Wednesday) for a given date
export function getWeekPeriod(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDay();
  let daysToThursday;
  if (day >= 4) {
    daysToThursday = day - 4;
  } else {
    daysToThursday = day + 3;
  }
  const thursday = new Date(date);
  thursday.setDate(date.getDate() - daysToThursday);
  const wednesday = new Date(thursday);
  wednesday.setDate(thursday.getDate() + 6);
  return {
    start: thursday.toISOString().split('T')[0],
    end: wednesday.toISOString().split('T')[0]
  };
}

// Calculate payment date (Friday after period ends)
export function calculatePaymentDate(periodEnd) {
  const end = new Date(periodEnd);
  end.setDate(end.getDate() + 9);
  return end.toISOString().split('T')[0];
}

export function formatRupiah(n) {
  return 'Rp ' + (n || 0).toLocaleString('id-ID');
}

const monthNamesID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export function formatDateID(dateStr) {
  const d = new Date(dateStr);
  return `${d.getDate()} ${monthNamesID[d.getMonth()]} ${d.getFullYear()}`;
}

export function getDayName(dateStr) {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  return days[new Date(dateStr).getDay()];
}

// ============ SECURITY / VALIDATION - EXACT COPY FROM server.js ============

export function sanitizeString(str, maxLen = 255) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
    .substring(0, maxLen);
}

export function sanitizeNumber(val, min = -999999999, max = 999999999) {
  const num = parseFloat(val);
  if (isNaN(num)) return 0;
  return Math.max(min, Math.min(max, num));
}

export function validateDate(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const d = new Date(dateStr);
  return d instanceof Date && !isNaN(d);
}

export function validateUsername(username) {
  if (typeof username !== 'string') return false;
  return /^[a-zA-Z0-9_-]{3,50}$/.test(username);
}

export function validatePassword(password) {
  if (typeof password !== 'string') return false;
  return password.length >= 3 && password.length <= 100;
}

export { monthNamesID };
