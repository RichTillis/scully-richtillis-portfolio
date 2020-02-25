exports.config = {
  projectRoot: "./src",
  projectName: "richtillis-portfolio-app",
  outDir: './dist/static',
  routes: {
    '/blog/:slug': {
      type: 'contentFolder',
      slug: {
        folder: "./blog"
      }
    },
  }
};