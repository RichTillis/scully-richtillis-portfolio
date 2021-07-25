import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ROUTES } from '@angular/router';
import { ScullyRoute, ScullyRoutesService } from '@scullyio/ng-lib';
import { map, tap } from 'rxjs/operators';

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
    map((routes: ScullyRoute[]) =>
      routes.filter(
        route =>
          route.route.startsWith('/blog/') && route.sourceFile.endsWith('.md') && route.featured
      )
    ),
    //Sort the array of filtered routes in descending order *before* passing it to the
    //async pipe in the html code
    map((filteredRoutes: ScullyRoute[]) => {
      return filteredRoutes.sort((postA: ScullyRoute, postB: ScullyRoute) => {
        return ((+new Date(postB['publishDate'])) - (+new Date(postA['publishDate'])));
      });
    }),
  );
}
