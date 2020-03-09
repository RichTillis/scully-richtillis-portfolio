import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HighlightBlogComponent } from './highlight-blog.component';

@NgModule({
    declarations: [HighlightBlogComponent],
    imports: [CommonModule],
    exports: [HighlightBlogComponent]
})
export class HighlightBlogModule { }
