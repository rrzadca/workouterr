import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { provideI18nForTests } from '../testing/provide-i18n-for-tests';
import { routes } from './app.routes';

describe('App routes', () => {
  it('shows the shell on the start page', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideI18nForTests()] });
    const harness = await RouterTestingHarness.create('/');
    const root = harness.fixture.nativeElement as HTMLElement;
    expect(root.querySelector('app-shell nav')).not.toBeNull();
  });
});
