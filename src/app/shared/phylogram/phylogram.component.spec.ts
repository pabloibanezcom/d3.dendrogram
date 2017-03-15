import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PhylogramComponent } from './phylogram.component';

describe('PhylogramComponent', () => {
  let component: PhylogramComponent;
  let fixture: ComponentFixture<PhylogramComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PhylogramComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PhylogramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
