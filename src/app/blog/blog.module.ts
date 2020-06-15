import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScullyLibModule } from '@scullyio/ng-lib';
import { BlogTeaserModule } from '../components/blog-teaser/blog-teaser.module';
import { BlogRoutingModule } from './blog-routing.module';

import { BlogComponent } from './blog.component';
import { BlogPostComponent } from './blog-post/blog-post.component';


@NgModule({
  declarations: [BlogComponent, BlogPostComponent],
  imports: [
    CommonModule,
    BlogRoutingModule,
    ScullyLibModule,
    BlogTeaserModule
  ]
})
export class BlogModule { }
