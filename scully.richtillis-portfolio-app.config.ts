import { ScullyConfig } from '@scullyio/scully';

export const config: ScullyConfig = {
  projectRoot: "./src",
  projectName: "richtillis-portfolio-app",
  outDir: './dist/static',
  routes: {
    '/blog/:postId': {
      type: 'contentFolder',
      postId: {
        folder: "./blog"
      }
    },
  }
};