import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectsComponent } from './projects.component';
import { ProjectsRoutingModule } from './projects-routing.module';

import { HeaderModule } from '../header/header.module'
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faStackOverflow, faGithub, faLinkedin, faTwitter, faGooglePlay, faAppStoreIos, faAppStore } from '@fortawesome/free-brands-svg-icons';

@NgModule({
  declarations: [ProjectsComponent],
  imports: [
    CommonModule,
    ProjectsRoutingModule,
    HeaderModule,
    FontAwesomeModule
  ]
})
export class ProjectsModule {
  constructor() {

  }
}
