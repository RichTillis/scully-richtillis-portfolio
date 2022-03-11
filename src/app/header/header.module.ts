import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  FontAwesomeModule,
  FaIconLibrary,
} from "@fortawesome/angular-fontawesome";

import { HeaderComponent } from "./header.component";

@NgModule({
  declarations: [HeaderComponent],
  imports: [CommonModule, FontAwesomeModule],
  exports: [HeaderComponent],
})
export class HeaderModule {
  constructor() {}
}
