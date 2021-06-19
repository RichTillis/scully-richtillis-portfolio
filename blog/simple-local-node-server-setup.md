---
title: Setting up a simple local HTTP server with Express
description: Setting up a simple local HTTP server with Express
publish: true
publishDate: 2021-06-12
latestRevision: 2021-06-19
authorName: Rich Tillis
authorTwitter: richtillis
featured: true
abstract: A guide to setup a simple local HTTP server with Express.
image: https://res.cloudinary.com/dq8wrsecq/image/upload/v1623525707/node-blog/local-node-blog-hero-squoosh_wqe618.jpg
imageThumbnail:  https://res.cloudinary.com/dq8wrsecq/image/upload/w_300,h_200/v1623525707/node-blog/local-node-blog-hero-squoosh_wqe618.jpg
heroImgCreatorName: Matthew Waring
heroImgCreatorUrl: https://unsplash.com/@matthewwaring?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText
heroImgSource: Unsplash
heroImgSourceUrl: https://unsplash.com/photos/MJAoiige14E?utm_source=unsplash&utm_medium=referral&utm_content=creditShareLink
  
keywords:
  - Node
  - Express
language: en
---

**This post is a guide to setup a simple local HTTP server with Express.**

### Overall Takeaways

Express is a [Fast, unopinionated, minimalist web framework for Node.js][1]. There are many problems that Express can solve. This guide addresses one of them: setting up a bare-bones HTTP server to run locally.

**TL;DR** - Grab the code from the **[repo][3]**.

### Prerequisites

* **Node** - You can follow the directions and install it **[here][2]**.

This should be a quick one. Let's get to it!

***

## Create a Node project

First thing to do is create a working directory. Navigate your file system and find a suitable place to create a Node project. Once found, create a folder that will contain the project and then `cd <projectFolder>` into the folder. Next, use NPM to create a `package.json` file.

```bash
npm init
```

you will be prompted with a series of configuration questions for your project. For this guide all of the defaults will suffice.

![Package.json creation><](https://res.cloudinary.com/dq8wrsecq/image/upload/v1623540132/node-blog/node-project-setup-squoosh_xdvawg.jpg "Package.json creation walk thru")

Next we need to add the **Express** and **CORS** packages to the project dependencies. CORS is not necessary but can help circumvent CORS-related problems while testing locally.

```bash
npm install express cors
```

The last step is to create a JavaScript file to define, create, and configure the Express app. Create a file named `index.js` (or whatever filename you chose as an 'entry point' filename if you did not use the defaults while creating the `package.json` file). Add the following code to `index.js`.

```js
// index.js
const express = require('express');
const cors = require('cors');

const app = express();

app.get('/', function (req, res) {
    res.send('Hello World. CORS-enabled web server listening on port 3000')
});

app.get('/json-example', function (req, res) {
    res.json({
        msg: 'Hello World. CORS-enabled web server listening on port 3000',
        fakeValue: '1234'
    })
});

app.use(cors());

app.use(function (req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist");
});

app.listen(3000);
```

Here is a quick overview of what is going on within `index.js`. The first 3 lines are importing the **express** and **cors** modules. The `const app = express();` creates the Express application. The 2 **app.get** functions are defining available routes that Express is listening for and declaring each function's callback contents. The 2 **app.use** functions set up the middleware to use the **cors** library and respond with a 404 response if an unrecognized route is requested. The last line sets the port that Express is going to listen to.

There are other functions Express can be used for. Check out the [express.com][1] for more detailed information and guides.

And that is it. Time to test it out.

```bash
node index.js
```

Open your brower to [http://localhost:3000][6]. You should see the message "Hello World. CORS-enabled web server listening on port 3000" which is declared in the `index.js` file. Similarly, [http://localhost:3000/json-example][7] will provide you with the json response in the other route defined.

***

## Wrap-up

This guide sets up a bare-bones local http server. It's a great tool to test client-side API requests, create and test behaviors of future serverless functions, and test those responses once they return to your app.

### References

* **[MDN Web Docs][4]**
* **[Geeks For Geeks][5]**

[1]: https://expressjs.com/ "Express JS home page"
[2]: https://nodejs.org/en/download/ "Node installation page"
[3]: https://github.com/RichTillis/my-express-server "Github repo containing Express server"
[4]: https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/Introduction "Express/Node introduction"
[5]: https://www.geeksforgeeks.org/express-js-app-use-function/ "Express.js app.use() Function"
[6]: http://localhost:3000 "http://localhost:3000"
[7]: http://localhost:3000/json-example "http://localhost:3000/json-example"
