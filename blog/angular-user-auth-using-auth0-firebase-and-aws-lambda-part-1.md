---
title: Angular User Auth Using Auth0, Firebase, & AWS Lambda (Part 1)
description: Details the basic steps required to authenticate users into an Angular application using Auth0, AWS Lambda, and Firebase. 
publish: true
publishDate: 2021-04-13
latestRevision: 2021-05-18
authorName: Rich Tillis
authorTwitter: richtillis
featured: true
abstract: (Part 1) Authenticate using Auth0 from an Angular App. Then utilize AWS Lambda via AWS API Gateway (Authorized using an Auth0 JWT) to mint a Firebase auth token and authenticate into Firebase. 
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

* **Part 1** - **(YOU ARE HERE)** Setup of the Angular App and setup & integrate Auth0 into it.
* **Part 2** - Setup & integration of Firebase into the App.
* **Part 3** - Setup of AWS API Gateway & Lambda to use by the app.

Let's get started!

***

## Angular App Setup

I created a repo for a simple Angular starter app that contains placeholders for the integrations that we will be completing throughout this guide. To get started, clone the `starter` branch of the repository:

```bash
git clone -b starter --single-branch https://github.com/RichTillis/ng-auth0-lambda-firebase-demo.git
```

```bash
cd ng-auth0-lambda-firebase-demo/
```

Next, install all the dependencies and startup the app to take a look at what's going on.

```bash
npm install && ng serve -o
```

![Angular starter app layout><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/angular-app-main-content.jpg "Angular starter app layout")

This guide focuses on the integration of external services so we will keep the UI simple and use this basic three-button Angular app. The idea beind the UI is that each button becomes enabled once the prior step in the authentication process is successfully completed.

1. **Login to Auth0** button: Authenticate using Auth0
2. **AWS Lambda (get key)** button: Call the AWS Lambda and generate the Firebase auth token
3. **Login to Firebase** button: Login to Firebase with the auth token to complete the authentication process

These behaviors are mocked out in the app so try it out. `src/app/services/auth.service.ts` maintains the state of the authentication progress.  `app.component.ts` has the Auth service injected and references the Observables which stream any of change of state to their subscribers. The app template, `app.component.html`, subscribes to these and updates via the `| async` as the authentication state changes.

Use `ctrl`+`c` keys to stop the app.
***

## Auth0 App Setup & Integration into the Angular App

> Dan Arias of Auth0 wrote **[The Complete Guide to Angular User Authentication with Auth0][1]** that really is the complete Auth0 guide. I learned a great deal from it and much of this section comes from Dan's writing. All credit to Dan.
>
>**Additionally**, NG-Conf & the Auth0 Dev Rel team posted has a great walkthrough guide called [Authentication & Authorization in Angular with Auth0][10] on YouTube

### Create the Auth0 App

Log into **[Auth0][6]**. Once logged in, you will arrive at your account dashboard. From your dashboard, click on the **Applications** sub menu item in the left-hand navigation menu.

![Auth0 application navigation menu ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-app-menu.jpg "Auth0 application navigation menu")

The main content will display all of your existing appliations if you have any. Click on the **Create Application** button.

![Auth0 create application page menu ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-create-application.jpg "Auth0 create application page")

In the subsequent **Create application** modal, name your app and select the **Single Page Web Applications** application type. For this tutorial I will name the app `ng-aws-firebase-auth-app`. Click the **Create** button to create the app.

![Auth0 application settings ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-create-app.jpg "Auth0 application settings")

Once the app is created you will be routed to that application. Click on the **Settings** tab. In the **Basic Information** section, copy down the **Domain** and the **Client ID** and keep them somewhere close by. We will need them shortly.

![Auth0 app settings - basic information section><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-app-settings.jpg "Auth0 app settings page. Basic information section")

In the **Application URIs** section, update **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins** with **http://localhost:4200**. Be aware that localhost:4200 is only being used for development. When you app make it to a production environment you will need to add the location (IP address) and port where your app is being hosted. Click the **Save Changes** button at the bottom of the page.

All done setting up the Auth0 app.

### Integrate Auth0 into the Angular App

Open the Angular app. First thing we want to do is update the `src/tsconfig.json` file and add `"resolveJsonModule": true`. This setting will allow us to import `.json` files into the app's TypeScript modules.

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

Create a file at the root of the Angular project and name it `auth0-config.json`. In this file you will use the Auth0 domain and client Id that we copied during the Auth0 app setup.

```json
// auth0-config.json

{
  "domain": "#####-######.auth0.com",  // <-- Change this
  "clientId": "1234567890aBcDeFgHiJkLmNoPqRsTuV" // <-- Change this
}
```

We can use that file's contents thanks to the `resolveJsonModule` flag we previously set. So update the `src/environments/environments.ts` file accordingly.

```ts
// environments.ts
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

Now we will add the Auth0 SDK. From the terminal we can do that using Angular schematics:

```bash
ng add @auth0/auth0-angular
```

With the Auth0 library now available to the project, we need to import it and load the module in `src/app/app.module.ts`.

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

      // ... load the Auth0 module
      Auth0Module.forRoot({...env.auth})
      ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

Auth0 is now bootstrapped to the app. The next step is to use it. The Auth0 SDK is going to perform all the Auth0 specific authentication activities and report back to the Angular app with the results of the authentication attempt. We to want wrap this library into the app's existing `Auth service`.

Update `src/app/services/auth.service.ts` with the following changes

```ts
// auth.service.ts

import { Injectable, Inject } from '@angular/core';
//add this import
import { DOCUMENT } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

// add this
import { AuthService as Auth0Service } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  //replace isAuth0Authenticated$ assignment
  readonly isAuth0Authenticated$: Observable<boolean> = this.auth0Service.isAuthenticated$;

  //add this
  readonly auth0User$ = this.auth0Service.user$;

  private awsLambdaAuthTokenGenerated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly isAwsLambdaAuthTokenGenerated$: Observable<boolean> = this.awsLambdaAuthTokenGenerated$.asObservable();

  private firebaseAuthenticated$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  readonly isFirebaseAuthenticated$: Observable<boolean> = this.firebaseAuthenticated$.asObservable();

  // update the constructor
  constructor(private auth0Service: Auth0Service, @Inject(DOCUMENT) private doc: Document) { }

  // update this method
  loginToAuth0(): Observable<void> {
    return this.auth0Service.loginWithRedirect();
  }

  // add this method
  private logoutOfAuth0() {
    this.auth0Service.logout({ returnTo: this.doc.location.origin });
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

That's it. Auth0 should be wired in. Next let's add something to the `app.component` to help visually see when Auth0 login/logout is successful.

Update `src/app/app.component.ts` and add an auth0User$ property to bind to the Auth service property so we can use it in the app template:

```ts
// app.component.ts

// All the above imports and decorator details remain unchanged
export class AppComponent {
  // Add this
  auth0User$: Observable<any> = this.authService.auth0User$;
  // All the component details remain unchanged
```

Lastly we want to add a component to display the Auth0 user name.

```html
<!-- app.component.html -->
<div class="content" role="main">
  <app-icon-logo></app-icon-logo>
  <div class="icon-container">
    <mat-grid-list cols="3" rowHeight="4:1">

      <mat-grid-tile>
        <mat-card>
          <mat-card-content>

            <button
              mat-raised-button
              (click)="loginToAuth0()"
              class="auth0-color"
              *ngIf="!(isLoggedintoAuth0$ | async)">Login to Auth0
            </button>

            <button
              mat-raised-button
              (click)="logoutOfAuth0()"
              class="auth0-color"
              *ngIf="(isLoggedintoAuth0$ | async)">Logout of Auth0
            </button>
          </mat-card-content>
        </mat-card>
      </mat-grid-tile>

      <mat-grid-tile>
        <mat-card>
          <mat-card-content>

            <button
              mat-raised-button
              (click)="getTokenFromLambda()"
              class="lambda-color"
              [disabled]="!(isLoggedintoAuth0$ | async)">AWS Lambda (get key)
            </button>

          </mat-card-content>
        </mat-card>
      </mat-grid-tile>

      <mat-grid-tile>
        <mat-card>
          <mat-card-content>

            <button
              mat-raised-button
              class="firebase-color" (click)="loginToFirebase()"
              [disabled]="!(isTokenGenerated$ | async)"
              *ngIf="!(isLoggedintoFirebase$ | async)">Login to Firebase
            </button>

            <button
              mat-raised-button
              class="firebase-color"
              (click)="logoutOfFirebase()"
              *ngIf="(isLoggedintoFirebase$ | async)">Logout of Firebase
            </button>

          </mat-card-content>
        </mat-card>
      </mat-grid-tile>

    </mat-grid-list>

    <!-- Add This -->
    <mat-grid-list cols="3" rowHeight="4:1">

      <mat-grid-tile *ngIf="auth0User$ | async as user">
        <mat-card>
          <mat-card-content>
            <div >
              Auth0 User Name:<br/>
              {{ user.name }}
            </div>
          </mat-card-content>
        </mat-card>
      </mat-grid-tile>

    </mat-grid-list>
  </div>
</div>

<router-outlet></router-outlet>
```

Moment of truth. Start up the app and login/signup to Auth0.

```bash
ng serve -o
```

If everything went as planned, once you click on the **Login to Auth0** button, an Auth0 modal will pop-up requesting login.

![Auth0 Login Screen ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-login-screenshot.jpg "Auth0 Login Screen")

Finally, once you have authenticated using Auth0, your Auth0 user name will be displayed under the **Logout of Auth0** button.

![Auth0 Successful login ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-login-success.jpg "Auth0 Successful login")

**Congrats - Part 1 is complete!!**

***

## Wrap-up

In this post, we setup our Angular app, as well as an Auth0 application, and integrated Auth0 authentication into the Angular app. In part 2 of this guide we will setup a Google Firebase project and integrate it into the Angular app. Stay Tuned!

[1]: https://auth0.com/blog/complete-guide-to-angular-user-authentication/ "The Complete Guide to Angular User Authentication with Auth0"

[2]: https://auth0.com/signup "Try the world’s #1 authentication-as-a-service platform for free!"

[3]: https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/ "How do I create and activate a new AWS account?"

[4]: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html "Creating a Billing Alarm to Monitor Your Estimated AWS Charges"

[5]: https://firebase.google.com/ "Firebase Login"

[6]: https://auth0.com/ "Auth0"

[7]: https://console.aws.amazon.com "AWS console"

[9]: https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html "AWS Parameter Store Documentation"

[10]: https://www.youtube.com/watch?v=laLIsXg2OxM "Authentication & Authorization in Angular with Auth0"
