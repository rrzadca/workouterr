import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OthersDemo } from './others-demo';

describe('OthersDemo', () => {
  let component: OthersDemo;
  let fixture: ComponentFixture<OthersDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OthersDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OthersDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
