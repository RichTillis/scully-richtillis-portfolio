import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ROUTES } from '@angular/router';
import { ScullyRoutesService } from '@scullyio/ng-lib';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-highlight-blog',
  templateUrl: './highlight-blog.component.html',
  styleUrls: ['./highlight-blog.component.scss']
})
export class HighlightBlogComponent implements OnInit {

  constructor(private scully: ScullyRoutesService) { }

  ngOnInit() {
    // this.scully.available$.subscribe(routes => console.log(routes));
  }

  $blogPosts = this.scully.available$.pipe(
    map(routes =>
      routes.filter(
        route =>
          route.route.startsWith('/blog/') && route.sourceFile.endsWith('.md') && route.featured
      )
    )
  );
}
