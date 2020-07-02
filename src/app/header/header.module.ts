import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faAt } from '@fortawesome/free-solid-svg-icons';
import { faStackOverflow, faGithub, faLinkedin, faTwitter} from '@fortawesome/free-brands-svg-icons';


import { HeaderComponent } from './header.component';

@NgModule({
    declarations: [ HeaderComponent ],
    imports: [ CommonModule, FontAwesomeModule ],
    exports: [ HeaderComponent ]
})
export class HeaderModule {
    constructor(private library: FaIconLibrary) {
        library.addIcons(
          faStackOverflow, 
          faGithub, 
          faAt,
          faLinkedin,
          faGithub,
          faTwitter
          );
      }
 }
