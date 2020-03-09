import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightProjectsComponent } from './highlight-projects.component';

describe('HighlightProjectsComponent', () => {
  let component: HighlightProjectsComponent;
  let fixture: ComponentFixture<HighlightProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighlightProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
