import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import english from '../../../public/i18n/en.json';
import { Unreachable } from './unreachable';

@Component({ template: '' })
class EmptyPage {}

describe('Unreachable', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: english },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          preloadLangs: true,
        }),
      ],
      providers: [
        provideRouter([
          { path: '', component: EmptyPage },
          { path: 'unreachable', component: Unreachable },
        ]),
      ],
    });
  });

  it('says the API is out of reach and starts over from home on "Try again"', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(Unreachable);
    await fixture.whenStable();
    const page = fixture.nativeElement as HTMLElement;

    expect(page.querySelector('h1')?.textContent).toContain("Can't reach Workouterr");

    page.querySelector('button')?.click();
    await fixture.whenStable();

    expect(router.url).toBe('/');
  });
});
