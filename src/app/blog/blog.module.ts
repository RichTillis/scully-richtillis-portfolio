import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScullyLibModule } from '@scullyio/ng-lib';
import { BlogTeaserModule } from './blog-teaser/blog-teaser.module';
import { BlogRoutingModule } from './blog-routing.module';

import { BlogComponent } from './blog.component';
import { BlogPostComponent } from './blog-post/blog-post.component';

import { DisqusModule } from "ngx-disqus";

@NgModule({
  declarations: [BlogComponent, BlogPostComponent],
  imports: [
    CommonModule,
    BlogRoutingModule,
    ScullyLibModule,
    BlogTeaserModule,
    DisqusModule
  ]
})
export class BlogModule { }
