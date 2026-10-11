import { TestBed } from '@angular/core/testing';
import { provideI18nForTests } from '../testing/provide-i18n-for-tests';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideI18nForTests()],
    }).compileComponents();
  });

  it('shows the app name from the English translations', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent.trim()).toBe('Workouterr');
  });

  it('lists the muscle groups from the shared package', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = Array.from(compiled.querySelectorAll('li'), (item) => item.textContent.trim());
    expect(items).toContain('CHEST');
    expect(items).toHaveLength(6);
  });
});
