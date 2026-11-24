// Live open/closed status computed from site.json (single source for opening hours).
// Pure logic: the date is injected, the clock is read in Europe/Paris.
import site from '../data/site.json';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const parisClock = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Paris',
  weekday: 'long',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const toMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/** "14:00" -> "14h", "18:30" -> "18h30". */
export function formatTime(time) {
  const [hours, minutes] = time.split(':');
  return minutes === '00' ? `${Number(hours)}h` : `${Number(hours)}h${minutes}`;
}

function rangesForDay(day, specs) {
  return specs
    .filter((spec) => spec.days.includes(day))
    .map(({ opens, closes }) => ({ opens, closes }))
    .sort((a, b) => toMinutes(a.opens) - toMinutes(b.opens));
}

function dayLabel(offset, dayIndex) {
  if (offset === 0) return "aujourd'hui";
  if (offset === 1) return 'demain';
  return DAYS_FR[dayIndex];
}

/**
 * @param {Date} now
 * @param {{days: string[], opens: string, closes: string}[]} [specs]
 * @returns {{isOpen: boolean, label: string, nextOpening?: string}}
 */
export function getOpenStatus(now, specs = site.openingHoursSpec) {
  const parts = parisClock.formatToParts(now);
  const weekday = parts.find((part) => part.type === 'weekday').value;
  const hour = Number(parts.find((part) => part.type === 'hour').value);
  const minute = Number(parts.find((part) => part.type === 'minute').value);
  const minutesNow = hour * 60 + minute;
  const todayIndex = DAYS.indexOf(weekday);

  const current = rangesForDay(weekday, specs).find(
    (range) => toMinutes(range.opens) <= minutesNow && minutesNow < toMinutes(range.closes),
  );
  if (current) return { isOpen: true, label: `Ouvert jusqu'à ${formatTime(current.closes)}` };

  for (let offset = 0; offset <= 7; offset += 1) {
    const dayIndex = (todayIndex + offset) % 7;
    const next = rangesForDay(DAYS[dayIndex], specs).find(
      (range) => offset > 0 || toMinutes(range.opens) > minutesNow,
    );
    if (next) {
      const nextOpening = `${dayLabel(offset, dayIndex)} à ${formatTime(next.opens)}`;
      return { isOpen: false, label: `Fermé, rouvre ${nextOpening}`, nextOpening };
    }
  }
  return { isOpen: false, label: 'Fermé' };
}
