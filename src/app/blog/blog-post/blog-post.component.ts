import { Component, AfterViewChecked, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScullyRoutesService } from '@scullyio/ng-lib';
import { combineLatest } from 'rxjs';
import { map, pluck } from 'rxjs/operators';

import { HighlightService } from '../../highlight.service';

@Component({
  selector: 'app-blog-post',
  templateUrl: './blog-post.component.html',
  styleUrls: ['./blog-post.component.scss']
})
export class BlogPostComponent implements OnInit, AfterViewChecked {
  postId: string;

  constructor(private activatedRoute: ActivatedRoute,
    private scully: ScullyRoutesService,
    private highlightService: HighlightService) { }

  ngOnInit() {
    this.postId = this.activatedRoute.snapshot.paramMap.get('postId');
  }

  ngAfterViewChecked() {
    this.highlightService.highlightAll();
  }

  $blogPostMetadata = combineLatest([
    this.activatedRoute.params.pipe(pluck('postId')),
    this.scully.available$
  ]).pipe(
    map(([postId, routes]) =>
      routes.find(route => route.route === `/blog/${postId}`)
    )
  );

}
