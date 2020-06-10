import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-blog-teaser',
  templateUrl: './blog-teaser.component.html',
  styleUrls: ['./blog-teaser.component.scss']
})
export class BlogTeaserComponent implements OnInit {
  @Input() blog: any;
  
  constructor() { }

  ngOnInit(): void {
  }

}
