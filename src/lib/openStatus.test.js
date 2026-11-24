import { describe, it, expect } from 'vitest';
import { getOpenStatus, formatTime } from './openStatus.js';

// Winter dates are UTC+1, summer UTC+2 (Europe/Paris). 2026-11-24 is a Tuesday.
const at = (iso) => new Date(iso);

describe('formatTime', () => {
  it('drops the minutes when they are zero', () => {
    expect(formatTime('14:00')).toBe('14h');
    expect(formatTime('18:30')).toBe('18h30');
  });
});

describe('getOpenStatus', () => {
  it('is open at lunch and says when it closes', () => {
    const status = getOpenStatus(at('2026-11-24T12:30:00+01:00'));
    expect(status).toMatchObject({ isOpen: true, label: "Ouvert jusqu'à 14h" });
  });

  it('is open in the evening', () => {
    expect(getOpenStatus(at('2026-11-24T19:00:00+01:00')).label).toBe("Ouvert jusqu'à 22h");
  });

  it('counts the closing minute as closed and points to the evening', () => {
    const status = getOpenStatus(at('2026-11-24T14:00:00+01:00'));
    expect(status.isOpen).toBe(false);
    expect(status.nextOpening).toBe("aujourd'hui à 18h30");
    expect(status.label).toBe("Fermé, rouvre aujourd'hui à 18h30");
  });

  it('is closed on Monday and reopens tomorrow at noon', () => {
    const status = getOpenStatus(at('2026-11-23T12:30:00+01:00'));
    expect(status).toMatchObject({ isOpen: false, nextOpening: 'demain à 12h' });
  });

  it('has no lunch service on Sunday', () => {
    const status = getOpenStatus(at('2026-11-22T12:30:00+01:00'));
    expect(status).toMatchObject({ isOpen: false, nextOpening: "aujourd'hui à 18h30" });
  });

  it('after Sunday night, skips Monday and names the day', () => {
    const status = getOpenStatus(at('2026-11-22T23:00:00+01:00'));
    expect(status.nextOpening).toBe('mardi à 12h');
  });

  it('follows Paris time in summer whatever the machine timezone', () => {
    // 10:30 UTC = 12:30 in Paris (UTC+2): open.
    expect(getOpenStatus(at('2026-07-14T10:30:00Z')).isOpen).toBe(true);
    // 12:30 UTC = 14:30 in Paris: closed until the evening.
    expect(getOpenStatus(at('2026-07-14T12:30:00Z')).nextOpening).toBe("aujourd'hui à 18h30");
  });

  it('accepts custom specs', () => {
    const specs = [{ days: ['Tuesday'], opens: '09:00', closes: '10:00' }];
    expect(getOpenStatus(at('2026-11-24T09:30:00+01:00'), specs).label).toBe("Ouvert jusqu'à 10h");
  });
});
