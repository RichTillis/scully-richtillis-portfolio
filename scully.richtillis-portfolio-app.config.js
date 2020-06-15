// exports.config = {
//   projectRoot: "./src",
//   projectName: "richtillis-portfolio-app",
//   outDir: './dist/static',
//   routes: {
//     '/blog/:postId': {
//       type: 'contentFolder',
//       postId: {
//         folder: "./blog"
//       }
//     },
//   }
// };


"use strict";
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.config = {
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
