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
      icon: 'fa fa-linkedin'
    },
    {
      href: 'mailto:rich@richtillis.com',
      icon: 'fa fa-envelope-o'
    },
    {
      href: 'https://github.com/richtillis/',
      icon: 'fa fa-github'
    },
    {
      href: 'https://twitter.com/richtillis/',
      icon: 'fa fa-twitter'
    },
    {
      href: 'https://www.stackoverflow.com/users/4577397/richtillis/',
      icon: 'fa fa-stack-overflow'
    }
  ]

  constructor() { }

  ngOnInit(): void {
  }

  toggleHamburgerMenu() {
    this.menuOpen = !this.menuOpen;
  }

}
