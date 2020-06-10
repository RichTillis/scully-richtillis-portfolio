import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogTeaserComponent } from './blog-teaser.component';

describe('BlogTeaserComponent', () => {
  let component: BlogTeaserComponent;
  let fixture: ComponentFixture<BlogTeaserComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BlogTeaserComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BlogTeaserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
