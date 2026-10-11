import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideI18nForTests } from '../../testing/provide-i18n-for-tests';
import { FormatDatePipe } from './format-date.pipe';
import { FormatNumberPipe } from './format-number.pipe';

@Component({
  imports: [FormatNumberPipe, FormatDatePipe],
  template: `
    <span id="weight">{{ weight | formatNumber }}</span>
    <span id="sets">{{ sets | formatNumber: 'integer' }}</span>
    <span id="day">{{ day | formatDate: 'long' }}</span>
    <span id="missing">{{ missing | formatNumber }}</span>
  `,
})
class FormatPipesHost {
  readonly weight = 1250.5;
  readonly sets = 4;
  readonly day = new Date(2026, 9, 11, 12, 0);
  readonly missing = null;
}

describe('formatNumber and formatDate pipes', () => {
  it('format values in the template, and show nothing for a missing value', async () => {
    TestBed.configureTestingModule({ providers: [provideI18nForTests()] });
    const fixture = TestBed.createComponent(FormatPipesHost);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const textOf = (id: string) => compiled.querySelector(`#${id}`)?.textContent;
    expect(textOf('weight')).toBe('1,250.5');
    expect(textOf('sets')).toBe('4');
    expect(textOf('day')).toBe('Sunday, 11 October 2026');
    expect(textOf('missing')).toBe('');
  });
});
