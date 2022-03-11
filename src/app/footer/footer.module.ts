import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faAt } from '@fortawesome/free-solid-svg-icons';
import { faStackOverflow, faGithub, faLinkedin, faTwitter } from '@fortawesome/free-brands-svg-icons';

import { FooterRoutingModule } from './footer-routing.module';
import { FooterComponent } from './footer.component';


@NgModule({
  declarations: [FooterComponent],
  imports: [
    CommonModule,
    FooterRoutingModule,
    FontAwesomeModule
  ],
  exports: [FooterComponent]
})
export class FooterModule {
  constructor() {
    // library.addIcons(
    //   faStackOverflow,
    //   faGithub,
    //   faAt,
    //   faLinkedin,
    //   faGithub,
    //   faTwitter
    // );
  }
}
