import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  menuOpen: boolean = false;

  socialLinks = [
    {
      href: 'https://www.linkedin.com/in/richtillis/',
      icon: "['fab', 'linkedin']"
      // icon: 'fa fa-linkedin'
    },
    {
      href: 'mailto:rich@richtillis.com',
      icon: "['fas', 'at']"
      // icon: 'fa fa-envelope-o'
    },
    {
      href: 'https://github.com/richtillis/',
      icon: "['fab', 'github']"
      // icon: 'fa fa-github'
    },
    {
      href: 'https://github.com/richtillis/',
      icon: "['fab', 'twitter']"
      // icon: 'fa fa-twitter'
    },
    {
      href: 'https://www.stackoverflow.com/users/4577397/richtillis/',
      icon: "['fab', 'stack-overflow']"
      // icon: 'fa fa-stack-overflow'      
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

  toggleHamburgerMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
