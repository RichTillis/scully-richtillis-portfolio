import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, ROUTES } from '@angular/router';
import { ScullyRoute, ScullyRoutesService } from '@scullyio/ng-lib';
import { map } from 'rxjs/operators';

declare var ng: any;

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss'],
})
export class BlogComponent implements OnInit {
  ngOnInit() {
    // this.scully.available$.subscribe(routes => console.log(routes));
  }

  constructor(private scully: ScullyRoutesService) {
  }

  $blogPosts = this.scully.available$.pipe(
    map(routes =>
      routes.filter(
        route =>
          route.route.startsWith('/blog/') && route.sourceFile.endsWith('.md') && route.publish
      )
    ),
    //Sort the array of filtered routes in descending order *before* passing it to the
    //async pipe in the html code
    map((filteredRoutes: ScullyRoute[]) => {
      return filteredRoutes.sort((postA: ScullyRoute, postB: ScullyRoute) => {
        return ((+new Date(postB['latestRevision'])) - (+new Date(postA['latestRevision'])));
      });
    }),
  );
}
