// Pure timezone logic for the World Time window. No DOM, no Electron — just
// the built-in Intl API, which already knows every IANA timezone and handles
// DST correctly, so there's no bundled city database or offset math to get
// wrong by hand.

const FALLBACK_ZONES = [
  'UTC',
  'America/New_York',
  'America/Los_Angeles',
  'America/Chicago',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Paris',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Kathmandu',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland',
];

// A solid starter spread of pinned cities for a first-ever open of the
// window (separate from the always-present Local Time card).
export const DEFAULT_CITIES = [
  'Asia/Kathmandu',
  'America/New_York',
  'Europe/London',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney',
];

// Intl.supportedValuesOf('timeZone') only lists ONE canonical spelling per
// zone, and which spelling that is varies by ICU version — e.g. some builds
// report "Asia/Katmandu" and "Asia/Calcutta" instead of the modern "Asia/
// Kathmandu" / "Asia/Kolkata", even though the modern IDs still resolve fine
// via Intl.DateTimeFormat. Explicitly folding these in keeps search matching
// what people actually type, regardless of the runtime's ICU vintage.
const EXTRA_ZONE_NAMES = [
  'Asia/Kathmandu',
  'Asia/Kolkata',
  'Europe/Kyiv',
  'Asia/Yangon',
  'Asia/Ho_Chi_Minh',
];

function isValidTimeZone(tz) {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

let cachedZones = null;

export function getAllTimezones() {
  if (cachedZones) return cachedZones;

  let base = null;
  if (typeof Intl.supportedValuesOf === 'function') {
    try {
      const zones = Intl.supportedValuesOf('timeZone');
      if (Array.isArray(zones) && zones.length) base = zones;
    } catch {
      // fall through to fallback list
    }
  }
  if (!base) base = FALLBACK_ZONES;

  const known = new Set(base);
  const extras = EXTRA_ZONE_NAMES.filter((z) => !known.has(z) && isValidTimeZone(z));
  cachedZones = [...base, ...extras];
  return cachedZones;
}

export function getLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function friendlyName(timeZoneId) {
  const parts = String(timeZoneId).split('/');
  return parts[parts.length - 1].replace(/_/g, ' ');
}

// e.g. "Asia/Kathmandu" -> "Asia" (used as a small subtitle/region hint)
export function regionOf(timeZoneId) {
  const parts = String(timeZoneId).split('/');
  return parts.length > 1 ? parts[0].replace(/_/g, ' ') : '';
}

export function offsetMinutesFor(timeZone, date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'shortOffset',
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT';
    const match = tzPart.match(/GMT([+-]\d{1,2})(?::(\d{2}))?/);
    if (!match) return 0;
    const hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const sign = hours < 0 ? -1 : 1;
    return hours * 60 + sign * minutes;
  } catch {
    return 0;
  }
}

export function formatOffsetLabel(offsetMinutes) {
  const sign = offsetMinutes < 0 ? '-' : '+';
  const abs = Math.abs(offsetMinutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}

export function formatDiffFromLocal(targetOffsetMinutes, localOffsetMinutes) {
  const diff = targetOffsetMinutes - localOffsetMinutes;
  if (diff === 0) return 'Same as local';
  const sign = diff > 0 ? '+' : '-';
  const abs = Math.abs(diff);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const bits = [];
  if (h) bits.push(`${h}h`);
  if (m) bits.push(`${m}m`);
  return `${sign}${bits.join(' ')} ${diff > 0 ? 'ahead' : 'behind'}`;
}

export function isDaytime(hour24) {
  return hour24 >= 6 && hour24 < 18;
}

export function getTimeInfo(timeZone, now = new Date(), use24Hour = false) {
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24Hour,
  });
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const hourFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    hourCycle: 'h23',
  });

  const hour24 = parseInt(hourFormatter.format(now), 10) % 24;
  const offsetMinutes = offsetMinutesFor(timeZone, now);

  return {
    timeZone,
    time: timeFormatter.format(now),
    date: dateFormatter.format(now),
    hour24,
    isDaytime: isDaytime(hour24),
    offsetMinutes,
    offsetLabel: formatOffsetLabel(offsetMinutes),
  };
}

export function searchTimezones(query, allTimezones, limit = 20) {
  const q = String(query).trim().toLowerCase();
  if (!q) return [];
  return allTimezones
    .filter(
      (tz) =>
        tz.toLowerCase().includes(q) ||
        friendlyName(tz).toLowerCase().includes(q) ||
        regionOf(tz).toLowerCase().includes(q)
    )
    .slice(0, limit);
}

