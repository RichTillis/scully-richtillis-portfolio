import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faStackOverflow, faGithub, faLinkedin, faTwitter, faGooglePlay, faAppStoreIos, faAppStore } from '@fortawesome/free-brands-svg-icons';

import { HighlightProjectsComponent } from './highlight-projects.component';

@NgModule({
    declarations: [HighlightProjectsComponent],
    imports: [CommonModule, FontAwesomeModule],
    exports: [HighlightProjectsComponent]
})
export class HighlightProjectsModule {
    constructor() {

    }
}
