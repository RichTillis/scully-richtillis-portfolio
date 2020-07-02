import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighlightBlogComponent } from './highlight-blog.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: "", component: HighlightBlogComponent }
];

@NgModule({
  declarations: [HighlightBlogComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [HighlightBlogComponent]
})
export class HighlightBlogModule { }
