import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';

import { HeaderModule } from '../../components/header/header.module';
import { HighlightBlogModule } from '../../components/highlight-blog/highlight-blog.module';
import { HighlightProfileModule } from '../../components/highlight-profile/highlight-profile.module';
import { HighlightProjectsModule } from '../../components/highlight-projects/highlight-projects.module';

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
