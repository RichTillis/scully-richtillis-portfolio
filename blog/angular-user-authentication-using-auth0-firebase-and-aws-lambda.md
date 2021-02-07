---
title: Angular User Authentication Using Auth0, Firebase, and AWS Lambda
description: Details the basic steps required to authenticate users into an Angular application using Auth0, AWS Lambda, and Firebase. 
publish: true
publishDate: 2021-01-05
latestRevision: 2021-01-31
authorName: Rich Tillis
authorTwitter: richtillis
featured: true
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

**This post describes one way to add user authentication to an Angular application using Auth0 and Firebase with the help of AWS Lambda.**

This guide creates an Angular app using Auth0 to authenticate a user. Once authenticated, the app produces an Auth0 JWT which is used to authorize access to an API in the AWS API Gateway. The API routes to a Lambda which will mint a Firebase Auth token. This token is returned to the app and used to authenticate to Firebase.

### Takeaways

This guide shows a way to integrate Auth0, AWS Lambda, and Google Firebase together into the authentication of an Angular app. It is not a complete, polished, production-ready authentication solution, however **you will learn a way to:**

* Integrate Auth0 into an Angular App
* Create a route in API Gateway and secure it with a JWT
* Store (encrypt) and retrieve (decrypt) a Firebase Admin key in the AWS Parameter Store
* Mint a Firebase auth token in an AWS Lambda
* Authenticate into Firebase using a custom minted token

### Prerequisites

* **Auth0 Account** - You can sign up **[here][2]**.
* **Firebase Account** - You can sign up **[here][5]**.
* **Amazon AWS Account** - Information about how to sign up can be found **[here][3]**. The sign up process is more involved than either Auth0 or Firebase. It does require a credit card which, if you are like me, left me feeling a little uneasy that I might mess something up and run up a huge AWS bill. You are not alone. There are **[ways][4]** to setup billing alarms to warn you when you exceed a threshold you specify. **This tutorial will stay well within the AWS free-tier.**
* **Asynchronous programming**, JavaScript **Promises**, RxJS **Observables** and **Observers** are used throughout this tutorial. Familiarity with these objects and concepts will be helpful to understand how component data is being managed.

### Table of Contents

1. Angular Setup
2. Auth0 Setup
3. Firebase Setup
4. AWS Setup
5. Integrate everything into the Angular app

It may seem like a lot. We'll just take it piece by piece. Ready? Lets get started!
***

## Part 1 - Angular Setup

I created a repo for a simple Angular starter app that contains placeholders for the integrations that we will be completing throughout this guide. To get started, clone the `starter` branch of the repository:

```bash
git clone -b starter --single-branch https://github.com/RichTillis/ng-auth0-lambda-firebase-demo.git
```

Next, install all the dependencies and startup the app to take a look at what's going on.

```bash
cd ng-auth0-lambda-firebase-demo/
```

```bash
npm install && ng serve -o
```

![Angular starter app layout><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/angular-app-main-content.jpg "Angular starter app layout")

Since this guide focusses on the integration of external services, we will keep the UI simple and use this basic three-button Angular app. The idea beind the UI is that each button becomes enabled once the prior step in the authentication process is successfully completed.

1. **Login to Auth0** button: Authenticate with Auth0
2. **AWS Lambda (get key)** button: Call the AWS Lambda and generate the Firebase auth token
3. **Login to Firebase** button: Login to Firebase with the atuh token to complete the authentication process

These behaviors are mocked out in the app so try it out. `src/app/services/auth.service.ts` maintains the state of the authentication progress.  **talk about rxjs here** It uses RxJS BehaviorSubjects to share the state of buttons.

Use `ctrl`+`c` keys to stop the app.
***

## Part 2 - Auth0 Setup

> Dan Arias of Auth0 wrote **[The Complete Guide to Angular User Authentication with Auth0][1]** that really is the complete Auth0 guide. I learned a great deal from it and much of this section comes from Dan's writing. All credit to Dan.

### Create the Auth0 App

Log into **[Auth0][6]**. Once logged in, you will arrive at your account dashboard. From your dashboard, click on the **Applications** sub menu item in the left-hand navigation menu.

![Auth0 application navigation menu ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-app-menu.jpg "Auth0 application navigation menu")

The main content will display all of your existing appliations if you have any. Click on the **Create Application** button.

![Auth0 create application page menu ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-create-application.jpg "Auth0 create application page")

In the subsequent **Create application** modal, name your app and select the **Single Page Web Applications** application type. For this tutorial I will name the app `ng-aws-firebase-auth-app`. Click the **Create** button to create the app.

![Auth0 application settings ><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-create-app.jpg "Auth0 application settings")

Once the app is created you will be routed to that application. Click on the **Settings** tab. In the **Basic Information** section, copy down the **Domain** and the **Client ID** and keep them somewhere close by. We will need them shortly.

![Auth0 app settings - basic information section><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/auth0-app-settings.jpg "Auth0 app settings page. Basic information section")

In the **Application URIs** section, update **Allowed Callback URLs**, **Allowed Logout URLs**, and **Allowed Web Origins** with **http://localhost:4200**. Be aware that localhost:4200 is only being used for development. When you app make it to a production environment you will need to add the location (IP address) and port where your app is being hosted. Done setting up the Auth0 app.

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

Auth0 is now bootstrapped to the app. The next step is to use it. The Auth0 SDK is going to perform all the Auth0 specific authentication activities and report back to the Angular app with the results of the authentication attempt. We want wrap this library into the app's existing auth service.

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

That's it. Auth0 should be wired in. Restart the app and try out the Auth0 implementation.

```bash
ng serve -o
```

***

## Part 3 - Firebase Setup

We need to create a Firebase project so that we can grab the project's key which will be used by the lambda. To get started with Firebase, login into [console.firebase.google.com][5]. From the main dashboard, click on **Add project**. You will be asked for a project name. After typing a name, like **angular-auth0-lambda-project**, click **continue**. The following prompt will ask you about analytics. We are not interested in analytics so toggle the radio button near the bottom and **Disable Google Analytics**. Then click **Create project**.

Once the project is created you will be routed to the project's dashboard. We need to geneate a private key for this project. From the navigation menu on the left, click the gears next to **Project Overview** and select **Project Settings**. In the Settings page, click the **Service Accounts** tab. Near the bottom of this page click the **Generate new private key**. Firebase will provide you with a confirmation prompt. Click **Generate Key**. Save the json file somewhere safe. We will need it later. The key contents will look somthing like this:

![Firebase private key example><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/firebase-admin-private-key.jpg "Firebase private key example")

We are done with Firebase for now.

***

## Part 4 - AWS Setup

The process of creating an AWS lambda and making it available with API Gateway is well documented by AWS and can be completed in just a few clicks in the AWS console. This proess becomes more involved when we add in API authorization, an SDK, a private key, and CORS management. We will be addressing all of these pieces in this section. Here are the steps we are going to work through:

1. Store the key (encrypted) in the AWS Parameter Store
2. Create the Node project locally
3. Create the AWS Lambda and import the Node project
4. Create the API Gateway API with an Authorizer and CORS management
5. Add the Auth0 auth inteceptor and api call to the lambda

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

Here is a breakdown of what is going on in the code above. **details here**

At this point the lambda is functionally ready to do its job. In order to import it into the AWS Lambda we are going to create, we need to zip the project up into a zip file. Create a zip file that contains the `node_modules` folder, `index.js`, `package.json`, and `package-lock.json` into the zip. The zip file name does not matter.

### Create the AWS Lambda

Log back into AWS and search for Lambda. When you get the Lambda dashboard you will see your list of Lambdas if you have any. Click on the `Create function` button.

![Create Lambda button><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/create-lambda.jpg "Create Lambda button")

On the next screen select **Author from scratch** and name the function name **firebase-auth-token**. Select the appropriate Node runtime. All the other settings are fine. Click **Create function**

![Create Lambda settings><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/create-lambda-detail.jpg "Create Lambda settings")

Once the function has been created you will be taken to the Lambda's dashboard page. Scroll down to the **Function code** section. In teh section on the top right hand side click the **Actions** toolbar and select **Upload a .zip file**. From the modal that appears, click the **Upload** button and find the zip file created from the last section. Once the file is selected, click the Save button. You will see an alert that will let you know the zip file was successfully imported. Unfortunately you will see a message in the Function code section that the function is too large for inline code editing. This is because the firebase-admin sdk is pretty big. That said, the good news is the Lambda is all set.

### Create the API Gateway API

create the authorizer

add the cors crap

in the app add the auth0 interceptor

![Setup the package.json for the lambda function><](assets/images/blog/angular-user-authentication-using-auth0-firebase-and-aws-lambda/npm-init.jpg "Screenshot of the setup for the package.json for the lambda function")

Log into the **[AWS Console][7]**. Click on the **Services** drop down onthe upper left of the screen. Within the **Compute** list, click **Lambda**.

You will be routed to your Lambda console. Click on **Create function**

[1]: https://auth0.com/blog/complete-guide-to-angular-user-authentication/ "The Complete Guide to Angular User Authentication with Auth0"

[2]: https://auth0.com/signup "Try the world’s #1 authentication-as-a-service platform for free!"

[3]: https://aws.amazon.com/premiumsupport/knowledge-center/create-and-activate-aws-account/ "How do I create and activate a new AWS account?"

[4]: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/monitor_estimated_charges_with_cloudwatch.html "Creating a Billing Alarm to Monitor Your Estimated AWS Charges"

[5]: https://firebase.google.com/ "Firebase Login"

[6]: https://auth0.com/ "Auth0"

[7]: https://console.aws.amazon.com "AWS console"
