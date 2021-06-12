---
title: Angular User Auth Using Auth0, Firebase, & AWS Lambda (Part 2)
description: Details the basic steps required to authenticate users into an Angular application using Auth0, AWS Lambda, and Firebase. 
publish: false
publishDate: 2021-04-13
latestRevision: 2021-06-06
authorName: Rich Tillis
authorTwitter: richtillis
featured: false
abstract: (Part 2) Authenticate using Auth0 from an Angular App. Then utilize AWS Lambda via AWS API Gateway (Authorized using an Auth0 JWT) to mint a Firebase auth token and authenticate into Firebase. 
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

### Guide Overview

* **Part 1** - Setup of the Angular App and setup & integrate Auth0 into it.
* **Part 2** - **(YOU ARE HERE)** Setup & integration of Firebase into the App.
* **Part 3** - Setup of AWS API Gateway & Lambda to use by the app.

### Prerequisites

This is a continuation guide so **[Part 1][1]** needs to be completed before getting started with this guide. If you want to skip the part 1 guide, below is a branch to clone that will get you almost all the way caught up.

```bash
git clone -b part2 --single-branch https://github.com/RichTillis/ng-auth0-lambda-firebase-demo.git
```

```bash
cd ng-auth0-lambda-firebase-demo/
```

The `auth0-config.json` will need to be updated with your Auth0 application domain and clientid.

```json
// auth0-config.json
{
  "domain": "#####-######.auth0.com",  // <-- Change this
  "clientId": "1234567890aBcDeFgHiJkLmNoPqRsTuV" // <-- Change this
}
```

Next, install all the dependencies and startup the app so we can take a look at what's going on.

```bash
npm install && ng serve -o
```

![Angular starter app layout><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/angular-app-main-content.jpg "Angular starter app layout")

This guide focuses on the integration of external services so we will keep the UI simple and use this basic three-button Angular app. The idea beind the UI is that each button becomes enabled once the prior step in the authentication process is successfully completed.

1. **Login to Auth0** button: Authenticate using Auth0
2. **AWS Lambda (get key)** button: Call the AWS Lambda and generate the Firebase auth token
3. **Login to Firebase** button: Login to Firebase with the auth token to complete the authentication process

`src/app/services/auth.service.ts` maintains the state of the authentication progress and includes the auth0-angular sdk. `app.component.ts` has the Auth service injected and references the Observables which stream any of change of state to their subscribers. The app template, `app.component.html`, subscribes to these and updates the view via the `| async` as the authentication state changes.

If everything went as planned, once you click on the **Login to Auth0** button, an Auth0 modal will pop-up requesting login.

![Auth0 Login Screen ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-login-screenshot.jpg "Auth0 Login Screen")

Finally, once you have authenticated using Auth0, your Auth0 user name will be displayed under the **Logout of Auth0** button.

![Auth0 Successful login ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-login-success.jpg "Auth0 Successful login")

We are now ready to integrate Firebase into the app. Let's get started!

***

## Firebase Project Setup & Integration into the Angular App

### Create the Firebase Project

Firebase is a service provided by Google so any gmail account will include Firebase. Log into **[Firebase][2]**. Once logged in, you will arrive at the Firebase Console. From your console, click on **Add Project**.

![Firebase Add new project ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/firebase-new-project.jpg "Firebase Add new project")

Then you will be prompted to name your project. It can be anything. For this guide, I called the project angular-auth0-lambda-project.

![Firebase name new project ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/firebase-project-name.jpg "Firebase name new project")

In the next step you will be asked about additional Firebase features related to Google Analytics. These are outside the scope of this guide so **disable** the **Enable Google Analytics for this Project** toggle button. Then click the **Create project** button.

![Firebase disable analytics ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/disable-analytics.jpg "Firebase disable analytics")

Once the project is created, we need to create an app within it to create a connection to the project from the outside. There are options to create iOS, Android, Web, or Unity apps. We want to create a Web app so click on the `</>` icon.

![Firebase create app ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/firebase-create-app.jpg "Firebase create app")

Next you will be prompted to add a nickname to your app. This is an internal name within your Firebase project, and you can name it whatever you want. After you name it, click the **Register app** button.

![Firebase add app ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/firebase-add-app.jpg "Firebase add app")

Once registered, a set of scripts will be presented. We only need part of these scripts. Copy the `firebaseConfig` object and save it locally as we will need it shortly. Once copied, click the **Continue to console** button.

![Firebase api config ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/firebase-api-config.jpg "Firebase api config")

The Firebase project and app are set up. That is all we need from Firebase for now.

### Integrate Firebase into the Angular App

First thing we need to do is add the firebase config to the `environment.ts` file. Open `src\environments\environment.ts` and add the firebase config.

```ts
// environments.ts
import { domain, clientId } from '../../auth0-config.json';

export const environment = {
  production: false,
  auth: {
    domain,
    clientId,
    redirectUri: window.location.origin,
  },
  firebaseConfig : {
    apiKey: "AIzaSyAfPSIIC5wcW-qTGERikwM3NnJ0iBn1-nc",
    authDomain: "angular-auth0-lambda-project.firebaseapp.com",
    projectId: "angular-auth0-lambda-project",
    storageBucket: "angular-auth0-lambda-project.appspot.com",
    messagingSenderId: "868144339097",
    appId: "1:868144339097:web:b8333acd2bb1f3ac298008",
    measurementId: "G-XPKTJCRM0S"
  }
};
```

Now we need to install and import firebase-focused libraries. We will install AngularFire & Firebase into our app’s dependencies. The AngularFire install includes the Firebase library and can be installed using Angular Schematics.

```bash
ng add @angular/fire
```

During the install of Firebase you will be prompted by Google to sign in and authorize an account to connect the Firebase CLI to. Once logged in you will be provided a code that you need to paste into the terminal.

![Google Authorization of Firebase CLI ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/google-authorization.jpg "Google Authorization of Firebase CLI")

Next you will be provided a list of Firebase projects and propted to select one to connect your app to. These steps will complete the AngularFire & Firebase CLI install.

![Firebase CLI Login ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/firebase-cli-login.jpg "Firebase CLI Login")

Now that we have AngularFire and Firebase available, we need to import and initialize them into the app. Open `app.module.ts` and update it.

```ts
// app.module.ts
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { IconLogoComponent } from './icon-logo/icon-logo.component'

import { AuthModule as Auth0Module } from '@auth0/auth0-angular';
import { environment as env } from '../environments/environment';

//add these imports
import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';

@NgModule({
  declarations: [
    AppComponent,
    IconLogoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    Auth0Module.forRoot({ ...env.auth }),
    AngularFireModule.initializeApp(env.firebaseConfig), //add this
    AngularFireAuthModule //add this
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

That is it. Firebase is integrated into the app. So how do we test it and make sure we can successfully authenticate to Firebase? We will address that in the next section.

[1]: https://www.richtillis.com/blog/angular-user-auth-using-auth0-firebase-and-aws-lambda-part-1 "Angular User Auth Using Auth0, Firebase, & AWS Lambda (Part 1)"

[2]: https://firebase.google.com/ "Firebase Console"
