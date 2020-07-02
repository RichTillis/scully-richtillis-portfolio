import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HighlightBlogComponent } from './highlight-blog.component';

describe('HighlightBlogComponent', () => {
  let component: HighlightBlogComponent;
  let fixture: ComponentFixture<HighlightBlogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HighlightBlogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HighlightBlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
