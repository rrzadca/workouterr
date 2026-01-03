import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppView } from './app-view';

describe('AppView', () => {
  let component: AppView;
  let fixture: ComponentFixture<AppView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
