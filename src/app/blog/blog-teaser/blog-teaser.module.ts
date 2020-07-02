import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BlogTeaserComponent } from './blog-teaser.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    { path: "", component: BlogTeaserComponent }
];

@NgModule({
    declarations: [BlogTeaserComponent],
    imports: [CommonModule, RouterModule.forChild(routes)],
    exports: [BlogTeaserComponent]
})
export class BlogTeaserModule { }
