---
title: Piecing together my blog with Scully
description: This is a post description
publish: true
publishDate: 2020-06-15
latestRevision: 2020-06-15
authorName: Rich Tillis
authorTwitter: richtillis
featured: true
abstract: Working through the Scully fundamentals to put my blog together. No article this time. Think of this as just my Scully Hello World.
image: assets/images/blog/piecing-together-my-blog-with-scully.jpg
heroImgCreatorName: Xavi Cabrera
heroImgCreatorUrl: https://unsplash.com/@xavi_cabrera?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText
heroImgSource: Unsplash
heroImgSourceUrl: https://unsplash.com/s/photos/lego?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText
keywords:
  - angular
  - ionic
language: en

---

# Hello World!

This is my first Markdown file rendered by **Scully**. Hopefully someday I'll write about the steps I took to integrate Scully, specifically how I wired together this blog portion of my site...

Below is how the **prism.js** syntax highlighter works.

```ts
$blogPosts = this.scully.available$.pipe(
    map(routes =>
      routes.filter(
        route =>
          route.route.startsWith('/blog/') && route.sourceFile.endsWith('.md') && route.publish
      )
    )
  );
```
