import { TestBed } from '@angular/core/testing';
import { TranslocoService } from '@jsverse/transloco';
import { provideI18nForTests } from '../../testing/provide-i18n-for-tests';
import { Formatter } from './formatter';

// Noon local time, so no time zone moves it to another day
const sunday = new Date(2026, 9, 11, 12, 0);

describe('Formatter', () => {
  let formatter: Formatter;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideI18nForTests()] });
    formatter = TestBed.inject(Formatter);
  });

  it('formats measured values with up to two decimals and grouped thousands', () => {
    expect(formatter.formatNumber(102.5)).toBe('102.5');
    expect(formatter.formatNumber(1250)).toBe('1,250');
    expect(formatter.formatNumber(2.125)).toBe('2.13');
  });

  it('formats counts as whole numbers', () => {
    expect(formatter.formatNumber(12, 'integer')).toBe('12');
  });

  it('formats dates in the named formats', () => {
    expect(formatter.formatDate(sunday, 'long')).toBe('Sunday, 11 October 2026');
    expect(formatter.formatDate(sunday, 'short')).toBe('Sun 11 Oct');
    expect(formatter.formatDate(sunday, 'medium')).toBe('11 Oct 2026');
    expect(formatter.formatDate(sunday, 'time')).toBe('12:00');
  });

  it('accepts the ISO strings the API sends', () => {
    expect(formatter.formatDate('2026-10-11T12:00:00', 'medium')).toBe('11 Oct 2026');
  });

  it('falls back to the default language when the active one has no formats', () => {
    TestBed.inject(TranslocoService).setActiveLang('xx');
    expect(formatter.formatNumber(1250)).toBe('1,250');
  });
});
