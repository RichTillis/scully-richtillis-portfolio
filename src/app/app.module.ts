import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ScullyLibModule } from '@scullyio/ng-lib';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSquare, faCheckSquare, faAt } from '@fortawesome/free-solid-svg-icons';
import { faSquare as farSquare, faCheckSquare as farCheckSquare } from '@fortawesome/free-regular-svg-icons';
import { faStackOverflow, faGithub, faMedium, faLinkedin, faTwitter, faGooglePlay, faAppStoreIos } from '@fortawesome/free-brands-svg-icons';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ScullyLibModule,
    FontAwesomeModule    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private library: FaIconLibrary) {
    library.addIcons(
      faSquare, 
      faCheckSquare, 
      farSquare, 
      farCheckSquare, 
      faStackOverflow, 
      faGithub, 
      faMedium,
      faAt,
      faLinkedin,
      faGithub,
      faTwitter,
      faGooglePlay,
      faAppStoreIos
      );
  }
 }
