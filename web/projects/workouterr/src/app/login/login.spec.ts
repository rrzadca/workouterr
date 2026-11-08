import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RadButtonHarness } from '@rrzadca/radinf-ui/button/testing';
import { RadFormFieldHarness } from '@rrzadca/radinf-ui/form-field/testing';
import { RadFormInputTextHarness } from '@rrzadca/radinf-ui/form-inputs/form-input-text/testing';
import { provideRadIcons } from '@rrzadca/radinf-ui/icon';
import { TranslocoTestingModule } from '@jsverse/transloco';
import english from '../../../public/i18n/en.json';
import { appIcons } from '../icons';
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
        provideRadIcons(appIcons),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  async function render() {
    await TestBed.inject(Router).navigateByUrl('/login');
    const fixture = TestBed.createComponent(Login);
    const element = fixture.nativeElement as HTMLElement;
    // Harnesses find radinf-ui's components the way a user would (by label or text), and wait for the page to settle
    // after every action.
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const emailField = await loader.getHarness(RadFormFieldHarness.with({ label: 'Email' }));
    const passwordField = await loader.getHarness(RadFormFieldHarness.with({ label: 'Password' }));
    const email = await emailField.getHarness(RadFormInputTextHarness);
    const password = await passwordField.getHarness(RadFormInputTextHarness);
    const submitButton = await loader.getHarness(RadButtonHarness.with({ text: 'Log in' }));

    // The submission's action runs over several promises after the response arrives.
    async function settle() {
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
    }

    const submit = () => submitButton.click();

    return { element, emailField, passwordField, email, password, submitButton, submit, settle };
  }

  it('shows each field with its icon and no errors at first', async () => {
    const { emailField, passwordField, email, password } = await render();

    expect(await email.getType()).toBe('email');
    expect(await email.getIcon()).toBe('mail');
    expect(await password.getType()).toBe('password');
    expect(await password.getIcon()).toBe('lock');
    expect(await emailField.hasErrors()).toBe(false);
    expect(await passwordField.hasErrors()).toBe(false);
  });

  it('asks for a field once it is left empty', async () => {
    const { emailField, passwordField, email } = await render();

    await email.blur();

    expect(await emailField.getErrors()).toEqual(['Enter your email.']);
    expect(await passwordField.hasErrors()).toBe(false);
  });

  it('asks for both fields before sending anything', async () => {
    const { emailField, passwordField, submit } = await render();

    await submit();

    expect(await emailField.getErrors()).toEqual(['Enter your email.']);
    expect(await passwordField.getErrors()).toEqual(['Enter your password.']);
    httpTesting.expectNone('/api/auth/login');
  });

  it('logs in with the typed credentials and goes home', async () => {
    const { email, password, submitButton, submit, settle } = await render();
    await email.setValue('me@example.com');
    await password.setValue('correct-horse-battery');

    await submit();
    expect(await submitButton.isLoading()).toBe(true);
    const request = httpTesting.expectOne('/api/auth/login');
    expect(request.request.body).toEqual({ email: 'me@example.com', password: 'correct-horse-battery' });
    request.flush({ id: '0b5f6c1e-6d3a-4f43-9c56-2f1c6f1d8e01', email: 'me@example.com' });
    await settle();

    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('says so when the email or password is wrong, until a field changes', async () => {
    const { element, email, password, submit, settle } = await render();
    await email.setValue('me@example.com');
    await password.setValue('wrong-password');

    await submit();
    httpTesting
      .expectOne('/api/auth/login')
      .flush({ title: 'Invalid email or password' }, { status: 401, statusText: 'Unauthorized' });
    await settle();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Wrong email or password.');

    await password.setValue('correct-horse-battery');

    expect(element.querySelector('[role="alert"]')).toBeNull();
  });

  // Submits valid credentials, answers the login request the given way and resolves with the shown error, if any.
  async function loginAnswering(answer: (request: ReturnType<typeof httpTesting.expectOne>) => void) {
    const { element, email, password, submit, settle } = await render();
    await email.setValue('me@example.com');
    await password.setValue('correct-horse-battery');

    await submit();
    answer(httpTesting.expectOne('/api/auth/login'));
    await settle();

    return element.querySelector('[role="alert"]')?.textContent ?? null;
  }

  it('blames the connection when the API never answers', async () => {
    expect(await loginAnswering((login) => login.error(new ProgressEvent('error')))).toContain('Check your connection');
  });

  it('blames the server, not the connection, when the API answers with an error', async () => {
    expect(
      await loginAnswering((login) => login.flush(null, { status: 503, statusText: 'Service Unavailable' })),
    ).toContain('Something went wrong on our side.');
  });

  it('blames the server when the answer breaks the contract', async () => {
    expect(await loginAnswering((login) => login.flush({ email: 'me@example.com' }))).toContain(
      'Something went wrong on our side.',
    );
  });

  it('shows no error for an outdated build: the "new version" dialog says it', async () => {
    expect(
      await loginAnswering((login) => login.flush(null, { status: 426, statusText: 'Upgrade Required' })),
    ).toBeNull();
  });
});
