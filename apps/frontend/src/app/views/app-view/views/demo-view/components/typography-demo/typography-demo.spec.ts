import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypographyDemo } from './typography-demo';

describe('TypographyDemo', () => {
  let component: TypographyDemo;
  let fixture: ComponentFixture<TypographyDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypographyDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypographyDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
