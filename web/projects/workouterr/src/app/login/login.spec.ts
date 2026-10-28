import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import english from '../../../public/i18n/en.json';
import { Login } from './login';

@Component({ template: '' })
class EmptyPage {}

describe('Login', () => {
  let httpTesting: HttpTestingController;

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
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: '', component: EmptyPage },
          { path: 'login', component: EmptyPage },
        ]),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  async function render() {
    await TestBed.inject(Router).navigateByUrl('/login');
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const [email, password] = Array.from(element.querySelectorAll('input'));

    async function type(input: HTMLInputElement, value: string) {
      input.value = value;
      input.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    }

    // The submission's action runs over several promises after the response arrives.
    async function settle() {
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
    }

    async function submit() {
      (element.querySelector('button[type="submit"]') as HTMLButtonElement).click();
      await fixture.whenStable();
    }

    return { element, email, password, type, submit, settle };
  }

  it('asks for both fields before sending anything', async () => {
    const { element, submit } = await render();

    await submit();

    expect(element.textContent).toContain('Enter your email.');
    expect(element.textContent).toContain('Enter your password.');
    httpTesting.expectNone('/api/auth/login');
  });

  it('logs in with the typed credentials and goes home', async () => {
    const { email, password, type, submit, settle } = await render();
    await type(email, 'me@example.com');
    await type(password, 'correct-horse-battery');

    await submit();
    const request = httpTesting.expectOne('/api/auth/login');
    expect(request.request.body).toEqual({ email: 'me@example.com', password: 'correct-horse-battery' });
    request.flush({ id: '0b5f6c1e-6d3a-4f43-9c56-2f1c6f1d8e01', email: 'me@example.com' });
    await settle();

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('says so when the email or password is wrong, until a field changes', async () => {
    const { element, email, password, type, submit, settle } = await render();
    await type(email, 'me@example.com');
    await type(password, 'wrong-password');

    await submit();
    httpTesting
      .expectOne('/api/auth/login')
      .flush({ title: 'Invalid email or password' }, { status: 401, statusText: 'Unauthorized' });
    await settle();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Wrong email or password.');

    await type(password, 'correct-horse-battery');

    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  it('tells a connection problem apart from wrong credentials', async () => {
    const { element, email, password, type, submit, settle } = await render();
    await type(email, 'me@example.com');
    await type(password, 'correct-horse-battery');

    await submit();
    httpTesting.expectOne('/api/auth/login').error(new ProgressEvent('error'));
    await settle();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain("Couldn't log in.");
  });
});
