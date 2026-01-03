import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconsDemo } from './icons-demo';

describe('IconsDemo', () => {
  let component: IconsDemo;
  let fixture: ComponentFixture<IconsDemo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconsDemo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconsDemo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
