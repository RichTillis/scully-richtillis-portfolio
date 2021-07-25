---
title: Angular User Auth using Auth0, Firebase, & AWS Lambda
description: Details the basic steps required to authenticate users into an Angular application using Auth0, AWS Lambda, and Firebase. 
publish: true
publishDate: 2021-07-09
latestRevision: 2021-07-09
authorName: Rich Tillis
authorTwitter: richtillis
featured: true
abstract: Authenticate using Auth0. Mint a token with AWS Lambda, via AWS API Gateway (using an Auth0 JWT), and use it to login to Firebase.
image: https://res.cloudinary.com/dq8wrsecq/image/upload/v1613866571/angular-user-authentication-using-auth0-firebase-and-aws-lambda_x9zmhn.jpg
imageThumbnail: https://res.cloudinary.com/dq8wrsecq/image/upload/w_300,h_200/v1613866571/angular-user-authentication-using-auth0-firebase-and-aws-lambda_x9zmhn.jpg
heroImgCreatorName: Silvio Kundt
heroImgCreatorUrl: https://unsplash.com/@eskandthewood?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText
heroImgSource: Unsplash
heroImgSourceUrl: https://unsplash.com/s/photos/pattern?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText

keywords:
  - Angular
  - Firebase
  - AWS Lambda
  - Auth0
  - AWS API Gateway
language: en
---

**This series of posts describes one way to add user authentication to an Angular application using Auth0 and Firebase with the help of AWS Lambda.**

### Overall Takeaways

This guide shows one way to integrate Auth0, AWS Lambda, and Google Firebase together into the authentication of an Angular app. It is not a complete, polished, production-ready authentication solution, however **you will learn a way to:**

* Integrate Auth0 into an Angular App
* Create a route in API Gateway and secure it with a JWT
* Store (encrypt) and retrieve (decrypt) a Firebase Admin key in the AWS Parameter Store
* Mint a Firebase auth token in an AWS Lambda
* Authenticate into Firebase using a custom minted token

### Prerequisites

* **Auth0 Account** - You can sign up **[here][2]**.
* **Firebase Account** - You can sign up **[here][5]**.
* **Amazon AWS Account** - Information about how to sign up can be found **[here][3]**. The sign up process is more involved than either Auth0 or Firebase. It does require a credit card which, if you are like me, left me feeling a little uneasy that I might mess something up and run up a huge AWS bill. You are not alone. There are **[ways][4]** to setup billing alarms to warn you when you exceed a threshold you specify. **This tutorial will stay well within the AWS free-tier.**
* **Asynchronous programming**, JavaScript **Promises**, RxJS **Observables** and **Observers** are used throughout this tutorial. Familiarity with these objects and concepts will help you understand how component data is being managed.

### Guide Overview

* **[Part 1][1]** - Setup of the Angular App and setup & integrate Auth0 into it.
* **[Part 2][2]** - Setup & integration of Firebase into the App.
* **Part 3 - (Coming Soon!)** Setup of AWS API Gateway & Lambda to use by the app.

[1]: https://www.richtillis.com/blog/auth0-firebase-aws-lambda-user-auth-part-1 "Auth0, Firebase, & AWS Lambda User Auth (Part 1)"

[2]: https://www.richtillis.com/blog/auth0-firebase-aws-lambda-user-auth-part-2 "Auth0, Firebase, & AWS Lambda User Auth (Part 2)"

<!-- [3]: https://www.richtillis.com/blog/auth0-firebase-aws-lambda-user-auth-part-3 "Auth0, Firebase, & AWS Lambda User Auth (Part 3)" -->
