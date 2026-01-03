import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExercisesView } from './exercises-view';

describe('ExercisesView', () => {
  let component: ExercisesView;
  let fixture: ComponentFixture<ExercisesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExercisesView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExercisesView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
