import { Component, OnInit } from '@angular/core';
import { faStackOverflow, faGithub, faLinkedin, faTwitter, faChrome, faGooglePlay, faApple, faAppStoreIos} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-highlight-projects',
  templateUrl: './highlight-projects.component.html',
  styleUrls: ['./highlight-projects.component.scss']
})
export class HighlightProjectsComponent implements OnInit {
  faGithub = faGithub;
  faChrome = faChrome;
  faGooglePlay = faGooglePlay;
  faApple = faApple;
  faAppStoreIos = faAppStoreIos;
  
  constructor() { }

  ngOnInit(): void {
  }

}
