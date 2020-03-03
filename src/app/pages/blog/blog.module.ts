import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogComponent } from './blog.component';
import { BlogRoutingModule } from './blog-routing.module';

import { HeaderModule } from '../../components/header/header.module'

@NgModule({
  declarations: [BlogComponent],
  imports: [
    CommonModule,
    BlogRoutingModule,
    HeaderModule
  ]
})
export class BlogModule { }
