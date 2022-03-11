import { Component, OnInit } from '@angular/core';
import { faAt } from '@fortawesome/free-solid-svg-icons';
import { faStackOverflow, faGithub, faLinkedin, faTwitter} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  faAt = faAt;
  faStackOverflow = faStackOverflow;
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;

  constructor() { }

  ngOnInit(): void {
  }

}
