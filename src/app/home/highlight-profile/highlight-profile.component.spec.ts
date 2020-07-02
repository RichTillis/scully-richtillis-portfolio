import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightProfileComponent } from './highlight-profile.component';

describe('HighlightProfileComponent', () => {
  let component: HighlightProfileComponent;
  let fixture: ComponentFixture<HighlightProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighlightProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
