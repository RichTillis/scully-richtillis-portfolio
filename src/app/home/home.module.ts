import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

import { HeaderModule } from '../header/header.module';
import { HighlightBlogModule } from './highlight-blog/highlight-blog.module';
import { HighlightProfileModule } from './highlight-profile/highlight-profile.module';
import { HighlightProjectsModule } from './highlight-projects/highlight-projects.module';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    HeaderModule,
    HighlightBlogModule,
    HighlightProfileModule,
    HighlightProjectsModule
  ]
})
export class HomeModule { }
