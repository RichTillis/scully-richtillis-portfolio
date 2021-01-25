---
title: Angular User Authentication Using Auth0, Firebase, and AWS Lambda (Part 1 of 2)
description: Details the basic steps required to authenticate users into an Angular application using Auth0, AWS Lambda, and Firebase. 
publish: false
publishDate: 2021-01-05
latestRevision: 2021-01-05
authorName: Rich Tillis
authorTwitter: richtillis
featured: false
abstract: Within an Angular app, authenticate using Auth0, then use AWS Lambda via AWS API Gateway (Authorized using an Auth0 JWT) to mint a Firebase auth token, and authenticate into Firebase. 
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

This example uses Auth0 to authenticate a user using the Auth0 Angular SDK. Once authenticated, the app will use the Auth0 Angular SDK and user credentials to produce a JWT that will authorize access to an AWS API Gateway route. This route accesses a Lambda that contains the Firebase Admin SDK, along with a Firebase Admin key (stored encrypted) from the AWS Parameter Store, to mint a Firebase auth token which it returns to the Angular app. With this token the app can then authenticate to Firebase Auth which will give it access to the Firestore data store.

## Takeaways

This example shows a way to integrate Auth0, AWS Lambda, and Google Firebase together into the authentication of an Angular app. It is not a complete, polished, production-ready authentication solution, however you will learn a way to:

* Integrate Auth0 into an Angular App
* Create a route in API Gateway and secure it with a JWT
* Store (encrypt) and retrieve (decrypt) a Firebase Admin key in AWS Parameter Store
* Mint a Firebase auth token in an AWS Lambda
* Authenticate into Firebase using a custom minted token

**There are prerequisites before getting started.** 

* Accounts to **Auth0**, **Amazon AWS**, and **Google Firebase** will be required to use their services
  * **Auth0** - a free account. You can sign up **[here][2]**.
  * **Firebase** - If you already have a Google account, then the Firebase service is already available to you. You can sign in **[here][5]**.
  * **Amazon AWS** - Information about how to sign up can be found **[here][3]**. The sign up process is more involved than either Auth0 or Firebase. It does require a credit card which, if you are like me, left me feeling a little uneasy that I might mess something up and run up a huge AWS bill. You are not alone. There are **[ways][4]** to setup billing alarms to warn you when you exceed a threshold you specify. **The AWS Lambda use in this tutorial will stay well within the free-tier on Lambda processing limits.**
* This project was developed using Angular 11 however there is nothing I am aware of that is specific in this tutorial that relies on features released in this version.
* Asynchronous programming, JavaScript Promises, RxJS Observables and Observers are used throughout this tutorial. Familiarity with these objects and concepts is probably necessary to understand how the component's data is being retrieved and changed.

So ... lets get started.
***

## Getting Started

I created a simple Angular starter shell project that contains placeholders for the integration that will be completed throughout this tutorial. To get started, clone the starter branch of the repository with the following command from the terminal:

```bash
git clone -b starter --single-branch https://github.com/RichTillis/ng-auth0-lambda-firebase-demo.git
```

Next, install all the dependencies and startup the app to take a look at whats going on.

```bash
cd ng-auth0-lambda-firebase-demo/
```

```bash
npm install
```

```bash
npm start
```

![Angular starter app layout><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda-part-1-of-2/angular-app-main-content.jpg "Angular starter app layout")

This tutorial's focus is on the integration of external services into the app. No consideration was given to creating login or registration pages. Instead all this app has a single page that uses Angular Material components to create a basic 3-button layout. Here's the idea behind the flow... The app loads and renders this one page. There are 3 basic steps to this process.

1. Login using Auth0. Once the user has successfully authenticated with Auth0, the AWS Lambda button will become enabled.
2. Once Auth0 login is successful, click the AWS Lambda button to make a call to AWS Lambda to generate an auth token. Once the token is returned from AWS, the Login to Firebase button will be enabled.
3. Once the auth token is available, click the Login to Firebase to complete the authentication process.
4. Lastly, logout buttons replace the login buttons for Auth0 and Firebase. Auth0 logout will logout the user from both Auth0 and Firebase. The Firebase logout will only logout the user from Firebase.

The behavior in these steps has been mocked out in the app. In the app there is an auth service, `src/app/services/auth.service.ts`, has the functions stubbed out. It uses RxJS BehaviorSubjects to share the state of buttons.

Stop the app with **Ctrl c** or **Control c** (depending on the machine you are using).
***

## Create an Auth0 Application

> Credit to Dan Arian at Auth0.
> Most of the steps described here are throughly detailed **[here][1]** in an article by Dan Arias at Auth0. It describes Auth0 user authentication in an Angular app in great detail. I **highly** recommend reading it.

Log into **[Auth0][6]**. After you are logged in you will land on your account dashboard. From your dashboard, you will see a left-hand navigation menu. Click on the **Applications** menu item and then click on the **Applications** sub menu item.

![Auth0 application navigation menu ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda-part-1-of-2/auth0-app-menu.jpg "Auth0 application navigation menu")

The main content will display all of your existing appliations if you have any. Click on the **Create Application** button.

![Auth0 create application page menu ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda-part-1-of-2/auth0-create-application.jpg "Auth0 create application page")

In the subsequent **Create application** modal, name your app and select the **Single Page Web Applications** application type. For this tutorial I will name the app **ng-aws-firebase-auth-app**. 

Click the **Create** button to create the app.

![Auth0 application settings ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda-part-1-of-2/auth0-create-app.jpg "Auth0 application settings")

Once the app is created you will be routed to that application. Click on the **Settings** tab. In the **Basic Information** section, copy down the **Domain** and the **Client ID** and keep them somewhere close by. You will need them shortly.

![Auth0 app settings - basic information section><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda-part-1-of-2/auth0-app-settings.jpg "Auth0 app settings page. Basic information section")

The last configuration update for the Auth0 app is in the **Application URIs** section (still within the application settings). Update **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins** with **<http://localhost:4200>**. Be aware that localhost:4200 is only being used for development. When you app make it to a production environment you will need to add the location (IP address) and port where your app is being hosted.

We are done setting up the Auth0 app.
***

## Integrate Auth0 into the Angular App

Open the Angular app. First thing we want to do is update the `src/tsconfig.json` file and add `"resolveJsonModule": true`. This property will allow us to import `.json` files into TypeScript modules.

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

Create a file at the root of the Angular project and name it `auth0-config.json`. In this file you will use the Auth0 domain and client Id that was recorded during the Auth0 app setup.

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

Now we will add the Auth0 SDK. From the terminal we can do that using Angular schematics like this:

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

      // ... eager load the Auth0 module
      Auth0Module.forRoot({...env.auth})
      ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

```

Auth0 is now bootstrapped to the app. The next step is to use it. The Auth0 SDK is going to perform all the authentication activities and report back to the Angular app with the results of the authentication attempt. We need to wire in the Auth0 library into the app's existing auth service.

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

### Santity Check

Restart the app and try out the Auth0 implementation.

```bash
npm start
```

## Section 2

## Integrate the Auth Lambda into the Angular app

### Section Overview

The process of creating an AWS lambda and making it available with API Gateway is well documented by AWS and can be completed in just a few clicks in the AWS console. This proess becomes more involved when we add in API authorization, an SDK, a private key, and CORS management. We will be addressing all of these pieces in this section. Here are the steps we are going to work through:

1. Create a Firebase project
2. Get the Admin key & URL from the project
3. Store the key (encrypted) in the AWS Parameter Store
4. Create the Node project locally
5. Create the AWS Lambda and import the Node project
6. Create the API Gateway API with an Authorizer and CORS management
7. Add the Auth0 auth inteceptor and api call to the lambda

As you can see there are a few pieces needed to get this piece put together. Hang with me - we can get it done.

### Create the Firebase Project

We need to create a Firebase project so that we can grab the project's key which will be used by the lambda. Log into [8]console.firebase.google.com. To get started with Firebase, login into console.firebase.google.com. From the main dashboard, click on **Add project**. You will be asked for a project name. After typing a name, like **angular-auth0-lambda-project**, click **continue**. The following prompt will ask you about analytics. We are not interested in analytics so toggle the radio button near the bottom and **Disable Google Analytics**. Then click **Create project**.

Once the project is created you will be routed to the project's dashboard. We need to geneate a private key for this project. From the navigation menu on the left, click the gears next to **Project Overview** and select **Project Settings**. In the Settings page, click the **Service Accounts** tab. Near the bottom of this page click the **Generate new private key**. Firebase will provide you with a confirmation prompt. Click **Generate Key**. Save the json file somewhere safe. We will need it later. The key contents will look somthing like this:

![Firebase private key example><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda-part-1-of-2/firebase-admin-private-key.jpg "Firebase private key example")

We are done with Firebase for now.

### Store the Firebase Private Key in AWS Parameter Store

TODO **about safely securing the key and this is not the only way and there are trade offs to consider**

We want to store the key somewhere that is safe and easily accessible for the lambda. AWS has a feature called Parameter Store that will do what we need. Log in to console.aws.amazon.com. Once logged in, use the search bar at the top of dashboard and type **Parameter Store**. You should see the Parameter Store in the results under Features. Click the Parameter Store link. You will be routed to the Parameter Store dashboard. Click the **Create parameter** button. In the Create Parameter form take a look at the Name, Tier, Type, and Value portions of the form. Add a name, such as firebase-key, select the Standard tier, and select the SecureString type. In the Value field, find the firebase from wherever you saved it, and copy the entire contents and paste it all into the Value field. Then click Create Parameter.

We are done with the Parameter Store.

### Creating the Lambda code

AWS gives you a few different ways to create a lambda. We will be using the AWS Lambda UI and importing the code from a local instance of the code. We will be creating a Node project and adding the Firebase-Admin-SDK along with the JavaScript code necessary to generate the auth key. I will be using VS Code but any code editor that can run NPM commmands should work fine.

To get started, create a project folder locally. Change directory into that folder. From there initialize a new project with npm with `npm init`. You will be asked detail questions about the project. All of the default answers are fine to keep. This will create a `package.json` file.

```BASH
npm init
```

Next we want to add the Firebase Admin SDK to the project with the following command:

```BASH
npm install firebase-admin --save
```

Create a JavaScript file called `index.js` in the same directory as the `package.json` file.

```BASH
touch index.js
```

Open `index.js` in your code editor and add in the following code:

```js
const AWS = require("aws-sdk");
const SSM = new AWS.SSM();
const FIREBASE_ADMIN = require("firebase-admin");

AWS.config.update({
    region: 'us-east-1'
});

async function getServiceAccountKey() {
    const SERVICE_ACCOUNT_KEY_PARAM = {
        Name: 'angular-firebase-auth0',
        WithDecryption: true
    };
    const STORED_PARAM = await SSM.getParameter(SERVICE_ACCOUNT_KEY_PARAM).promise();
    return JSON.parse(STORED_PARAM.Parameter.Value);
}

async function getFirebaseAuthKey(userId) {
    const customToken = await FIREBASE_ADMIN.auth().createCustomToken(userId);
    return customToken;
}

exports.handler = async (event, context) => {
    switch (event.requestContext.http.method) {
        case "OPTIONS":
            return {
                statusCode: 200,
                    body: JSON.stringify(''),
                    headers: {
                        "Content-Type": "application/json",
                    }
            }
        case "GET":
            const userId = event.queryStringParameters.user_id;
            const serviceAccountKey = await getServiceAccountKey();
            if (!FIREBASE_ADMIN.apps.length) {
                FIREBASE_ADMIN.initializeApp({
                    credential: FIREBASE_ADMIN.credential.cert(serviceAccountKey),
                    databaseURL: "https://angular-firebase-auth0-c074a.firebaseio.com"
                });
            }
            const firebaseAuthKey = await getFirebaseAuthKey(userId);
            return {
                statusCode: 202,
                    body: JSON.stringify(firebaseAuthKey),
                    headers: {
                        "Content-Type": "application/json",
                    }
            }
        default:
            return {
                statusCode: 400,
                    body: JSON.stringify('Bad Request'),
                    headers: {
                        "Content-Type": "application/json",
                    }
            }
    }
};
```

import the project

create the api

create the authorizer

add the cors crap

in the app add the auth0 interceptor

In order to create a token from Firebase we need a key from the database (that does not exist and will need to be created) as well as the admin SDK to have available in the lambda in order to put it all together and output a new token. To get this section started we will be creating the Firebase database and downloading a key. We will be storing that key in Aws's Stored Parameter service. Then we need to create the lambda code which needs to include the Firebase Admin SDK. The easiest way to do this is locally creating it. We can easly import it as a zip file into AWS once it is ready to go. Once we have the lambda all set we need to make it available to the outside world. AWS API Gateway will give us that functionality. 2 important pieces related to the API. 1) manage CORS and 2) protect this api from abuse. We will deal with that and the lambda will be good to go.

Make a folder. Let's call it **firebase-auth-token-function**. Move into that directory. Once in the directory initilize it as a Node project. The init command will prompt you with a list of questions related to setting up the project. All of the default values are fine.

```bash
npm init
```

Now we want to add the Firebase Admin to the package. We can do that with NPM like this:

```bash
npm install firebase-admin --save
```

![Setup the package.json for the lambda function><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda-part-1-of-2/npm-init.jpg "Screenshot of the setup for the package.json for the lambda function")

Log into the **[AWS Console][7]**. Click on the **Services** drop down onthe upper left of the screen. Within the **Compute** list, click **Lambda**.

You will be routed to your Lambda console. Click on **Create function**

[1]: https://auth0.com/blog/complete-guide-to-angular-user-authentication/ "The Complete Guide to Angular User Authentication with Auth0"

[2]: https://auth0.com/signup "Try the world’s #1 authentication-as-a-service platform for free!"

[3]: https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/ "How do I create and activate a new AWS account?"

[4]: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html "Creating a Billing Alarm to Monitor Your Estimated AWS Charges"

[5]: https://firebase.google.com/ "Firebase Login"

[6]: https://auth0.com/ "Auth0"

[7]: https://console.aws.amazon.com "AWS console"
