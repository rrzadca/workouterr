import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemoView } from './demo-view';

describe('DemoView', () => {
  let component: DemoView;
  let fixture: ComponentFixture<DemoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemoView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
