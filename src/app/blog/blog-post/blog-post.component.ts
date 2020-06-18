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
  backgroundImage: string;

  constructor(private activatedRoute: ActivatedRoute,
    private scully: ScullyRoutesService,
    private highlightService: HighlightService) { }

  ngOnInit() {
    this.postId = this.activatedRoute.snapshot.paramMap.get('postId');
    this.$blogPostMetadata.subscribe(post => {
      this.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.15)),url("` + post.image + `")`;
      // console.log(post);
    }
    );
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
