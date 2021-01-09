---
title: Angular User Authentication Using Auth0, Firebase, and AWS Lambda
description: Details the basic steps required to authenticate users into an Angular application using Auth0, AWS Lambda, and Firebase. 
publish: false
publishDate: 2021-01-05
latestRevision: 2021-01-05
authorName: Rich Tillis
authorTwitter: richtillis
featured: false
abstract: Within an Angular app, authenticate using Auth0, then use AWS Lambda via AWS API Gateway (Authorized using an Auth0 JWT) to mint a Firebase auth token, and authenticate into Firebase with that token. 
image: assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda.jpg
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

**This post describes one way to add user login to an Angular application using Auth0 and Firebase with the help of AWS Lambda.**

This example uses Auth0 to authenticate a user using the Auth0 Angular SDK. The app then uses the Auth0 library and user credentials to produce a JWT that authorizes access to an AWS API Gateway route. This route points to a Lambda that uses the Firebase Admin SDK along with a Firebase Admin key stored in AWS Parameter Store to mint a Firebase auth token which it returns to the Angular app. With this token the app can then authenticatie through Firebase Auth which will give it access to the Firestore data store.

This example shows a way to integrate all the services together. Although it is not a complete, polished, production-ready authentication solution, it will show you how to:

* Authenticate a user using Auth0.
* Use a JWT to authorize use of AWS API Gateway.
* Use AWS to store Firebase Admin keys and mint Firebase authentication tokens.
* Authenticate to Firebase using an auth token.

### Prerequisites

Accounts to Auth0, Amazon AWS, and Firebase will be required to use their services.

* Auth0 - a free account. You can sign up [here][2].
* Firebase - If you already have a Google account, then the Firebase service is already available to you. You can sign in [here][5].
* Amazon AWS - Information about how to sign up can be found [here][3]. The sign up process is more involved than either Auth0 or Firebase. It does require a credit card which, it you are like me, left me feeling a little uneasy. There are [ways][4] to setup billing alarms to warn you when you exceed a threshold you specify. The AWS Lambda use in this ttuorial will stay well within the free-tier limits on Lambda processing.

This project was developed using Angular 11 however there is nothing specific in this tutorial that relies on features released in this version.

Asynchronous programming, JavaScript Promises, RxJS Observables and Observers are used throughout this tutorial. Familiarity with these objects and concepts is probably necessary to understand how the component's data is being retrieved and changed.

### Takeaways

This tutorial will not provide you with a polished authentication architecture for your Angular app. It will however provide you with an example of how to bolt together major pieces of an authentication solution and you will learn how to:

* Learn how to integrate Auth0 into an Angular App
* Learn how to create a route in API Gateway and secure it with an Auth0 JWT
* Store (encrypt) and retrieve (decrypt) a Firebase Admin key in AWS Parameter Store
* Mint an Firebase auth token in an AWS Lambda
* Authenticate into Firebase using a custom minted token

Let's get started.
***

## Getting Started

I created a simple Angular starter shell project that contains placeholders for the integration that will be completed throughout this tutorial. To get started, clone the starter branch of the repository with the following command:

```bash
git clone -b starter --single-branch https://github.com/RichTillis/ng-auth0-lambda-firebase-demo.git
```

The next steps are to install all the dependencies and startup to review whats going on.

```bash
cd ng-auth0-lambda-firebase-demo/
npm install
npm start
```

This app uses Angular material, RXJS, and Observables *blah blahblah*

Stop the app with **ctrl c**
***

## Create an Auth0 Application

### Disclaimer and Credit

Most of the steps described here are throughly detailed [here][1] in an article by Dan Arias at Auth0. It describes Auth0 authentication in great detail. I **highly** recommend reading it.
***

## Integrate Auth0 into the Angular App

First thing we want to do is update the `tsconfig.json` file and add `"resolveJsonModule": true`. This file can be found at the root of the Angular app.  This property will allow  **TODO - blah blah balh - finish this**

```json
// tsconfig.json

/* To learn more about this file see: https://angular.io/config/tsconfig. */
{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "downlevelIteration": true,
    "experimentalDecorators": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "target": "es2015",
    "module": "es2020",
    "lib": [
      "es2018",
      "dom"
    ],
    "resolveJsonModule": true  // <-- Add this
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictInputAccessModifiers": true,
    "strictTemplates": true
  }
}
```

Create a file at the root of the Angular project and name it `auth0-config.json`. In this file you will use the Auth0 domain and client Id that was recorded during the Auth0 App setup.

```json
// auth0-config.json

{
  "domain": "dev-jihvthfb.auth0.com",
  "clientId": "2eGurTk447nI17TFG7ngy0aF5m8IW6Ig"
}
```

We can use that file's contents thanks to the `resolveJsonModule` flag we previously set. So update the `src/environments/environments.ts` file accordingly.

```ts
import { domain, clientId } from '../../auth0-config.json';

export const environment = {
  production: false,
  auth: {
    domain,
    clientId,
    redirectUri: window.location.origin,
  }
};
```

Now we will add the Auth0 SDK. We can do that using Angular schematics like this:

```bash
ng add @auth0/auth0-angular
```

With the Auth0 library now added to the project, we need to import it and initialize it in `src/app/app.module.ts'.

```ts
// app.module.ts

// ... All the existing imports are here...

// add these
import { AuthModule as Auth0Module } from '@auth0/auth0-angular';
import { environment as env } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent
    ],
  imports: [
      // ... All the existing imports are here ...

      // ... register (initialize?) the Auth0 module
      Auth0Module.forRoot({...env.auth})
      ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

Auth0 is now bootstrapped to the app. The next step is to use it. Here's the plan ... **TODO - add plan here :-)**

Update `src/app/services/auth.service.ts` with the following changes

```ts
// auth.service.ts

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// add this
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth0Authenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isAuth0Authenticate$ = this.auth0Authenticated$.asObservable();

  private awsLambdaAuthTokenGenerated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isAwsLambdaAuthTokenGenerated$ = this.awsLambdaAuthTokenGenerated$.asObservable();

  private firebaseAuthenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isFirebaseAuthenticated$ = this.firebaseAuthenticated$.asObservable();

  // update the constructor
  constructor(private auth0Service: Auth0Service) { }

  // Add this
  // TODO - what is the best way to do this???
  private isTest$ = this.auth0Service.isAuthenticated$.subscribe(authResult => {
    this.auth0Authenticated$.next(authResult);
  });

  // update this method
  loginToAuth0() {
    this.auth0Service.loginWithRedirect();
  }

  // add this method
  private logoutOfAuth0() {
    this.auth0Service.logout();
  }

  // update this method
  logout() {
    this.logoutOfAuth0();
    this.awsLambdaAuthTokenGenerated$.next(false);
    this.firebaseAuthenticated$.next(false);
  }

  getTokenFromLambda() {
    this.awsLambdaAuthTokenGenerated$.next(true);
  }

  loginToFirebase() {
    this.firebaseAuthenticated$.next(true);
  }
}
```

Restart the app  and try out the Auth0 implementation.

```bash
npm start
```

[1]: https://auth0.com/blog/complete-guide-to-angular-user-authentication/ "The Complete Guide to Angular User Authentication with Auth0"

[2]: https://auth0.com/signup "Try the world’s #1 authentication-as-a-service platform for free!"

[3]: https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/ "How do I create and activate a new AWS account?"

[4]: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html "Creating a Billing Alarm to Monitor Your Estimated AWS Charges"

[5]: https://firebase.google.com/ "Firebase Login"
