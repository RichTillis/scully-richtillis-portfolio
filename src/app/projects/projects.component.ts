import { Component, OnInit } from "@angular/core";
import {
  faStackOverflow,
  faGithub,
  faLinkedin,
  faTwitter,
  faGooglePlay,
  faAppStoreIos,
  faAppStore,
  faChrome,
} from "@fortawesome/free-brands-svg-icons";

@Component({
  selector: "app-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
})
export class ProjectsComponent implements OnInit {
  faStackOverflow = faStackOverflow;
  faGithub = faGithub;
  faLinkedin = faLinkedin;
  faTwitter = faTwitter;
  faGooglePlay = faGooglePlay;
  faAppStoreIos = faAppStoreIos;
  faAppStore = faAppStore;
  faChrome = faChrome;

  constructor() {}

  ngOnInit(): void {}
}
