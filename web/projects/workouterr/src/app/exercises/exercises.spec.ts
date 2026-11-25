import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting, TestRequest } from '@angular/common/http/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { RadButtonHarness } from '@rrzadca/radinf-ui/button/testing';
import { RadDialogHarness } from '@rrzadca/radinf-ui/dialog/testing';
import { RadFormFieldHarness } from '@rrzadca/radinf-ui/form-field/testing';
import { RadFormInputCheckboxHarness } from '@rrzadca/radinf-ui/form-inputs/form-input-checkbox/testing';
import { RadFormInputRadioGroupHarness } from '@rrzadca/radinf-ui/form-inputs/form-input-radio/testing';
import { RadFormInputTextHarness } from '@rrzadca/radinf-ui/form-inputs/form-input-text/testing';
import { provideRadIcons } from '@rrzadca/radinf-ui/icon';
import { RadToastHarness } from '@rrzadca/radinf-ui/toast/testing';
import type { ExerciseResponse } from '@workouterr/api-client';
import english from '../../../public/i18n/en.json';
import { appIcons } from '../shared/icons';
import { Exercises } from './exercises';

const benchPress: ExerciseResponse = {
  id: '1d0c7a52-0b8e-4a55-9b3e-5b1f8f0a1a01',
  name: 'Bench press',
  description: null,
  metrics: 'WEIGHT_REPS',
  weightStep: 2.5,
  timeStepSeconds: null,
  perSide: false,
  muscleGroups: ['CHEST', 'SHOULDERS', 'ARMS'],
  isArchived: false,
};
const plank: ExerciseResponse = {
  id: '1d0c7a52-0b8e-4a55-9b3e-5b1f8f0a1a02',
  name: 'Plank',
  description: null,
  metrics: 'TIME',
  weightStep: null,
  timeStepSeconds: 5,
  perSide: false,
  muscleGroups: ['CORE'],
  isArchived: false,
};
const lunge: ExerciseResponse = {
  id: '1d0c7a52-0b8e-4a55-9b3e-5b1f8f0a1a03',
  name: 'Walking lunge',
  description: null,
  metrics: 'REPS',
  weightStep: null,
  timeStepSeconds: null,
  perSide: true,
  muscleGroups: ['LEGS'],
  isArchived: false,
};

describe('Exercises', () => {
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
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRadIcons(appIcons)],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  function expectList(archived: boolean) {
    return httpTesting.expectOne(
      (request) => request.url === '/api/exercises' && request.params.get('archived') === String(archived),
    );
  }

  async function render(exercises: ExerciseResponse[] = [benchPress, plank, lunge]) {
    const fixture = TestBed.createComponent(Exercises);
    fixture.detectChanges();
    expectList(false).flush(exercises);
    await fixture.whenStable();
    return page(fixture);
  }

  function page(fixture: ComponentFixture<Exercises>) {
    const element = fixture.nativeElement as HTMLElement;
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const documentLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);

    // The requests' answers resolve over several promises.
    async function settle() {
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
    }

    function rowNames() {
      return [...element.querySelectorAll('li button')].map(
        (row) => row.querySelector('span span')?.textContent?.trim() ?? '',
      );
    }

    async function openRow(name: string) {
      const row = [...element.querySelectorAll<HTMLButtonElement>('li button')].find((button) =>
        button.textContent?.includes(name),
      );
      row!.click();
      await fixture.whenStable();
    }

    function editor(): Promise<HarnessLoader> {
      return loader.getChildLoader('app-exercise-editor');
    }

    async function field(label: string) {
      const formField = await (await editor()).getHarness(RadFormFieldHarness.with({ label }));
      return { formField, input: await formField.getHarness(RadFormInputTextHarness) };
    }

    async function clickButton(text: string) {
      await (await loader.getHarness(RadButtonHarness.with({ text }))).click();
    }

    return { fixture, element, loader, documentLoader, settle, rowNames, openRow, editor, field, clickButton };
  }

  it('lists the exercises with their groups, metrics and step', async () => {
    const { element, rowNames } = await render();

    expect(rowNames()).toEqual(['Bench press', 'Plank', 'Walking lunge']);
    // Each row's cells, a cell's parts (name and "per side", or the badges) joined with a space.
    const rows = [...element.querySelectorAll('li button')].map((row) =>
      [...row.children].map((cell) =>
        (cell.children.length ? [...cell.children] : [cell]).map((part) => part.textContent?.trim()).join(' '),
      ),
    );
    expect(rows).toEqual([
      ['Bench press', 'Chest Shoulders Arms', 'Weight + reps', '2.5 kg'],
      ['Plank', 'Core', 'Time', '5 s'],
      ['Walking lunge per side', 'Legs', 'Reps', '1 rep'],
    ]);
  });

  it('filters by muscle group and by name', async () => {
    const { loader, rowNames, fixture } = await render();
    const filters = await loader.getChildLoader('[role="group"]');

    await (await filters.getHarness(RadFormInputCheckboxHarness.with({ label: 'Core' }))).check();
    await (await filters.getHarness(RadFormInputCheckboxHarness.with({ label: 'Legs' }))).check();
    expect(rowNames()).toEqual(['Plank', 'Walking lunge']);

    await (await loader.getHarness(RadFormInputTextHarness.with({ selector: '[type="search"]' }))).setValue('PLA');
    await fixture.whenStable();
    expect(rowNames()).toEqual(['Plank']);
  });

  it('creates an exercise from the form, trimming the texts and sending only its step', async () => {
    const { editor, field, clickButton, settle, rowNames, documentLoader } = await render();

    await clickButton('New exercise');
    await (await field('Name')).input.setValue('  Incline press ');
    await (await field('Weight step (kg)')).input.setValue('1,25');
    await (await (await editor()).getHarness(RadFormInputCheckboxHarness.with({ label: 'Chest' }))).check();
    await clickButton('Save');

    const create = httpTesting.expectOne({ method: 'POST', url: '/api/exercises' });
    expect(create.request.body).toEqual({
      name: 'Incline press',
      description: null,
      metrics: 'WEIGHT_REPS',
      weightStep: 1.25,
      timeStepSeconds: null,
      perSide: false,
      muscleGroups: ['CHEST'],
    });
    create.flush({
      ...benchPress,
      id: '1d0c7a52-0b8e-4a55-9b3e-5b1f8f0a1a04',
      name: 'Incline press',
      weightStep: 1.25,
    });
    await settle();

    expect(rowNames()).toEqual(['Bench press', 'Incline press', 'Plank', 'Walking lunge']);
    const toast = await documentLoader.getHarness(RadToastHarness);
    expect(await toast.getMessage()).toBe('Exercise saved');
  });

  it('sends the time step of a timed exercise', async () => {
    const { editor, field, clickButton } = await render();

    await clickButton('New exercise');
    await (await field('Name')).input.setValue('Side plank');
    await (await (await editor()).getHarness(RadFormInputRadioGroupHarness)).checkRadio({ label: 'Time' });
    await (await field('Time step (seconds)')).input.setValue('10');
    await (await (await editor()).getHarness(RadFormInputCheckboxHarness.with({ label: 'Core' }))).check();
    await clickButton('Save');

    const create = httpTesting.expectOne({ method: 'POST', url: '/api/exercises' });
    expect(create.request.body).toMatchObject({ metrics: 'TIME', weightStep: null, timeStepSeconds: 10 });
  });

  it('refuses what the API would refuse, without sending it', async () => {
    const { element, field, clickButton } = await render();

    await clickButton('New exercise');
    await (await field('Name')).input.setValue('   ');
    await (await field('Weight step (kg)')).input.setValue('1.255');
    await clickButton('Save');

    expect(await (await field('Name')).formField.getErrors()).toEqual(['Enter a name.']);
    expect(await (await field('Weight step (kg)')).formField.getErrors()).toEqual([
      'Enter a step from 0.01 to 100 kg, with at most 2 decimals.',
    ]);
    expect(element.querySelector('#muscle-groups-error')?.textContent?.trim()).toBe('Pick at least one muscle group.');
  });

  it('accepts a weight step that floating point would get wrong', async () => {
    const { editor, field, clickButton } = await render();

    await clickButton('New exercise');
    await (await field('Name')).input.setValue('Cable fly');
    await (await field('Weight step (kg)')).input.setValue('1.15');
    await (await (await editor()).getHarness(RadFormInputCheckboxHarness.with({ label: 'Chest' }))).check();
    await clickButton('Save');

    expect(httpTesting.expectOne({ method: 'POST', url: '/api/exercises' }).request.body.weightStep).toBe(1.15);
  });

  it('edits the selected exercise', async () => {
    const { openRow, field, clickButton, settle, element } = await render();

    await openRow('Bench press');
    expect(await (await field('Name')).input.getValue()).toBe('Bench press');
    expect(await (await field('Weight step (kg)')).input.getValue()).toBe('2.5');
    await (await field('Name')).input.setValue('Flat bench press');
    await clickButton('Save');

    const update = httpTesting.expectOne({ method: 'PUT', url: `/api/exercises/${benchPress.id}` });
    expect(update.request.body).toMatchObject({ name: 'Flat bench press', weightStep: 2.5 });
    update.flush({ ...benchPress, name: 'Flat bench press' });
    await settle();

    expect(element.querySelector('app-exercise-editor h2')?.textContent?.trim()).toBe('Flat bench press');
  });

  it('archives an exercise, which leaves the active list', async () => {
    const { openRow, clickButton, settle, rowNames, element } = await render();

    await openRow('Plank');
    await clickButton('Archive');
    httpTesting
      .expectOne({ method: 'POST', url: `/api/exercises/${plank.id}/archive` })
      .flush({ ...plank, isArchived: true });
    await settle();

    expect(rowNames()).toEqual(['Bench press', 'Walking lunge']);
    expect(element.querySelector('app-exercise-editor')).toBeNull();
  });

  it('lists the routines that stop an exercise being archived', async () => {
    const { openRow, clickButton, settle, documentLoader, rowNames } = await render();

    await openRow('Bench press');
    await clickButton('Archive');
    respondInRoutines(httpTesting.expectOne({ method: 'POST', url: `/api/exercises/${benchPress.id}/archive` }));
    await settle();

    const dialog = await documentLoader.getHarness(RadDialogHarness);
    expect(await dialog.getTitleText()).toBe("Can't archive this exercise");
    expect(await dialog.getText()).toContain('“Bench press” is in these routines. Remove it from them first:');
    expect(await dialog.getText()).toContain('Push day');
    expect(await dialog.getText()).toContain('Full body');
    expect(rowNames()).toContain('Bench press');
  });

  it('shows the archive and restores from it', async () => {
    const { fixture, element, openRow, clickButton, settle, rowNames } = await render();

    // Clicked directly: a harness waits for the page to be stable, which it isn't until the list request is answered.
    const archivedRadio = [...element.querySelectorAll('rad-form-input-radio')].find((radio) =>
      radio.textContent?.includes('Archived'),
    );
    archivedRadio!.querySelector('input')!.click();
    fixture.detectChanges();
    expectList(true).flush([{ ...plank, isArchived: true }]);
    await settle();
    expect(rowNames()).toEqual(['Plank']);

    await openRow('Plank');
    await clickButton('Restore');
    httpTesting.expectOne({ method: 'POST', url: `/api/exercises/${plank.id}/restore` }).flush(plank);
    await settle();

    expect(rowNames()).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('The archive is empty.');
  });

  it('says so when a save could not reach the API', async () => {
    const { openRow, clickButton, settle, element } = await render();

    await openRow('Plank');
    await clickButton('Save');
    httpTesting
      .expectOne({ method: 'PUT', url: `/api/exercises/${plank.id}` })
      .flush(null, { status: 0, statusText: 'Unknown Error' });
    await settle();

    expect(element.querySelector('app-exercise-editor [role="alert"]')?.textContent).toContain(
      "Couldn't reach Workouterr",
    );
  });
});

function respondInRoutines(request: TestRequest) {
  request.flush(
    {
      type: 'https://tools.ietf.org/html/rfc9110#section-15.5.10',
      title: 'The exercise is in routines.',
      status: 409,
      routines: [
        { id: '7a1c2b3d-0000-4000-8000-000000000001', name: 'Push day' },
        { id: '7a1c2b3d-0000-4000-8000-000000000002', name: 'Full body' },
      ],
    },
    { status: 409, statusText: 'Conflict' },
  );
}
