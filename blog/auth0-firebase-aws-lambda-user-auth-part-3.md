---
title: Auth0, Firebase, & AWS Lambda User Auth (Part 3)
description: Details the basic steps required to authenticate users into an Angular application using Auth0, AWS Lambda, and Firebase. 
publish: true
publishDate: 2021-07-05
latestRevision: 2021-07-05
authorName: Rich Tillis
authorTwitter: richtillis
featured: false
abstract: Auth using Auth0. Then mint a token with AWS Lambda, via AWS API Gateway (using Auth0 JWT), and use it to authenticate to Firebase.
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
* **Part 2** - Setup & integration of Firebase into the app.
* **Part 3** - **(YOU ARE HERE)** Setup of AWS API Gateway & Lambda to use by the app.

### Prerequisites

First, you will need a local Express server to act as the AWS Lambda. I have a guide you can follow [here][3].

Second, this guide is a continuation, so **[Part 1][1]** needs to be completed before getting started with this guide. If you want to skip the part 1 guide, below is a branch to clone that will get you almost all the way caught up.

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

![Angular starter app layout><][5]

This guide focuses on the integration of external services so we will keep the UI simple and use this basic three-button Angular app. The idea beind the UI is that each button becomes enabled once the prior step in the authentication process is successfully completed.

1. **Login to Auth0** button: Authenticate using Auth0
2. **AWS Lambda (get key)** button: Call the AWS Lambda and generate the Firebase auth token
3. **Login to Firebase** button: Login to Firebase with the auth token to complete the authentication process

`src/app/services/auth.service.ts` maintains the state of the authentication progress and includes the auth0-angular sdk. `app.component.ts` has the Auth service injected and references the Observables which stream any of change of state to their subscribers. The app template, `app.component.html`, subscribes to these and updates the view via the `| async` as the authentication state changes.

If everything went as planned, once you click on the **Login to Auth0** button, an Auth0 modal will pop-up requesting login.

![Auth0 Login Screen ><][6]

Finally, once you have authenticated using Auth0, your Auth0 user name will be displayed under the **Logout of Auth0** button.

![Auth0 Successful login ><][9]

`ctrl c` to stop the app. We are now ready to integrate Firebase into the app. Let's get started!

***

## Firebase Project Setup & Integration into the Angular App

### Create the Firebase Project

Firebase is a service provided by Google so any gmail account will include Firebase. Log into **[Firebase][2]**. Once logged in, you will arrive at the Firebase Console. From your console, click on **Add Project**.

![Firebase Add new project ><][8]

Then you will be prompted to name your project. It can be anything. For this guide, I called the project angular-auth0-lambda-project.

![Firebase name new project ><][12]

In the next step you will be asked about additional Firebase features related to Google Analytics. These are outside the scope of this guide so **disable** the **Enable Google Analytics for this Project** toggle button. Then click the **Create project** button.

![Firebase disable analytics ><][7]

Once the project is created, we need to create an app within it to create a connection to the project from the outside. There are options to create iOS, Android, Web, or Unity apps. We want to create a Web app so click on the `</>` icon.

![Firebase create app ><][10]

Next you will be prompted to add a nickname to your app. This is an internal name within your Firebase project, and you can name it whatever you want. After you name it, click the **Register app** button.

![Firebase add app ><][11]

Once registered, a set of scripts will be presented. We only need part of these scripts. Copy the `firebaseConfig` object and save it locally as we will need it shortly. Once copied, click the **Continue to console** button.

![Firebase api config ><][4]

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
    apiKey: "AbCdEfGhIjKlMnOpQ-qwertyuiopASDFGHJK-zz",
    authDomain: "angular-auth0-lambda-project.firebaseapp.com",
    projectId: "angular-auth0-lambda-project",
    storageBucket: "angular-auth0-lambda-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123def456ghi789jklm",
    measurementId: "G-ABCDEFGHIJ"
  }
};
```

Now we need to install and import firebase-focused libraries. We will install AngularFire & Firebase into our app’s dependencies. The AngularFire install includes the Firebase library and can be installed using Angular Schematics.

```bash
ng add @angular/fire
```

During the install of Firebase you may be prompted by Google to sign in and authorize an account to connect the Firebase CLI to. Once logged in you will be provided a code that you need to paste into the terminal.

![Google Authorization of Firebase CLI ><][13]

Next you will be provided a list of Firebase projects and propted to select one to connect your app to. These steps will complete the AngularFire & Firebase CLI install.

![Firebase CLI Login ><][14]

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

That is it. Firebase is now integrated into the app. So how do we test it and make sure we can successfully authenticate to Firebase? We will address that in the next section.

## Create a Firebase token locally using an Express server

As mentioned in the beginning of this post we will be working with a local Express server during this section. All of the next steps relate to that app so navigate to it on you filesystem.

We want to test out our Firebase integration and try to login using a token. There are a couple of things we need to move forward. First we need the Firebase Admin SDK, Second, we need a key to provide to the SDK to create the token, and lastly, we need a server to host the SDK that the app can communicate with and request the token. In part 3 we will utilize AWS services for these needs but for now we will use a local Express server to test this whole process.

Step 1, set up the SDK onto a local Express server. In the terminal, navigate to the root of the server. Once there, install the sdk from NPM

```bash
npm install firebase-admin --save
```

Step 2, we need to get a Firebase key from Firebase. Log into your Firebase account (https://console.firebase.google.com) and select your project. Once in the project, click on the gear next to **Project Overview** and select **Project settings**

![Firebase Project Settings ><][17]

Click on the **Service Accounts** tab which displays options related to Firebase features of the project. Click the **Generate new private key**.

![Firebase Generate Private Key ><][18]]

A modal will popup confirming that you want to generate a new private key. The warning is in red for a reason. Store this file somewhere safe and never in a public repository. Click **Generate key**. Save the key anywhere that makes sense to you. We will need it shortly.

![Firebase Generate Private Key Warning ><][19]

> **Your Firebase Admin private key gives access to your project's Firebase services. Keep it confidential and never store it in a public repository.**

Jump back to your local Express server. Open `index.js` (or whatever you named your main file) and update it like this:

```js
//index.js
const express = require('express');
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');

const firebaseAdminPrivateKey = {
    "type": "service_account",
    "project_id": "angular-auth0-lambda-project",
    "private_key_id": "abcd1234abcd1234abcd1234abcd1234abcd1234",
    "private_key": "-----BEGIN PRIVATE KEY-----\nabcdefghijklmnopqrstuvwxyz0123456789...blah...blah...blah...blah...abcdefghijklmnopqrstuvwxyz0123456789=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-abcdefg@angular-auth0-lambda-project.iam.gserviceaccount.com",
    "client_id": "123456789012345678900",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-abcdefg%40angular-auth0-lambda-project.iam.gserviceaccount.com"
}

const app = express();

app.use(cors());

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(firebaseAdminPrivateKey)
});

app.get('/auth', (req, res) => {

    // Create UID from authenticated Auth0 user
    const uid = req.query.uid;

    // Mint token using Firebase Admin SDK
    firebaseAdmin.auth().createCustomToken(uid)
        .then(customToken =>

            // Response must be an object or Firebase errors
            res.json({
                firebaseToken: customToken
            })
        )
        .catch(err =>
            res.status(500).send({
                message: 'Something went wrong acquiring a Firebase token.',
                error: err
            })
        );
});

app.get('/', function (req, res) {
    res.send('Hello World. CORS-enabled web server listening on port 3000')
});

app.use(function (req, res, next) {
    res.status(404).send("Sorry, that route doesn't exist");
});

app.listen(3000);
```

Here's a short overview of what's going on in the code. In the first three lines we are importing Express, cors, and the firebase-admin sdk. Then we are including the firebase admin private key into the server code. Remember this is not a long-term solution and **this code should NOT be checked into any repository.** In the next couple lines we are setting up express, cors and initializing firebase admin where we are using the private key. The next block of code is defining the `/auth` route. In this route we are using the firebase sdk to generate a custom token. The route is expecting a unique id as an included parameter in the api call. The last few lines add another route, configuration for an undefined route and finally a port to listen to.

In a seperate terminal start the server.

```bash
node index.js
```

To verify it is up and running, open a browser tab and navigate to [http://localhost:3000/](http://localhost:3000/). You should see the message "**Hello World. CORS-enabled web server listening on port 3000**".

All right, the server is all set up and ready to mint tokens! Next step is to update the `auth.service.ts` in our app to communicate with this server and then use the response to authenticate with Firebase.

## Minting Tokens and Authenticating to Firebase

With the server up and running, head back to to the Angular app. Let's update the `getTokenFromLambda` function in `auth.service.ts`.

```ts
//auth.service.ts

// ... existing imports
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ... existing property declarations 

  //add these properties
  private firebaseTokenSubject$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  readonly firebaseToken$: Observable<any> = this.firebaseTokenSubject$.asObservable();

  //update the constructor
    constructor(private auth0Service: Auth0Service, @Inject(DOCUMENT) private doc: Document, private http: HttpClient) { }

  // ... existing functions

  //update this function
  getTokenFromLambda() {
    const URL = "http://localhost:3000/auth";

    this.auth0Service.user$.subscribe(user => {
      const auth0Uid = user?.sub!;

      const params = new HttpParams().append('uid', auth0Uid!);
      this.http.get<any>(URL, { params }).subscribe((token: any) => {
        this.firebaseTokenSubject$.next(token.firebaseToken);
        this.awsLambdaAuthTokenGenerated$.next(true);
      });
    });

  }
```

We added imports from `@angular/common/http` so we need to add that library to `app.module.ts`.

```ts
//app.module.ts

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
//add this
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { IconLogoComponent } from './icon-logo/icon-logo.component'

import { AuthModule as Auth0Module } from '@auth0/auth0-angular';
import { environment as env } from '../environments/environment';

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
    HttpClientModule,  //add this
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatGridListModule,
    Auth0Module.forRoot({...env.auth}),
    AngularFireModule.initializeApp(env.firebaseConfig),
    AngularFireAuthModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

Now let's update `app.component.ts` and add a property that uses `firebaseToken$`.

```ts
//app.component.ts

//nothing above changes ...
export class AppComponent {
  // keep all the existing declarations

  //add this
  firebaseToken$: Observable<any> = this.authService.firebaseToken$;

```

Now update `app.component.html` with a little visual reassurance that the token was created.

```html
<!-- app.component.html -->

<!-- update the last mat-grid-list -->
    <mat-grid-list cols="3" rowHeight="4:1">

      <mat-grid-tile *ngIf="auth0User$ | async as user">

        <mat-card>
          <mat-card-content>
            <div>
              Auth0 User Name:<br />
              {{ user.name }}
            </div>
          </mat-card-content>
        </mat-card>
      </mat-grid-tile>

      <mat-grid-tile *ngIf="firebaseToken$ | async as token">
        <mat-card>
          <mat-card-content>
            <div>
              Firebase Auth Token:<br>
              <p id="firebase-token">{{ token! }}</p>
            </div>
          </mat-card-content>
        </mat-card>
      </mat-grid-tile>
      
    </mat-grid-list>
```

The token is a large string. So instead of trying to display the whole thing, let's just display the first few characters. To do that we need add a little CSS to `app.component.scss`.

```scss
// app.component.scss

//add this to the bottom of the file
#firebase-token{
  overflow: hidden;
  max-width: 24ch;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

Ok, moment of truth. Let's see if we can request and receive a token. Make sure the Express server is still running.

```bash
ng serve -o
```

If all went well you should be able to generate a token by clicking the **AWS Lambda (get key)**.

![Firebase token created from local server ><][15]

The last step in this guide is to now take that token and use it to authenticate to Firebase. To do that we need to head back over to `auth.service.ts` and update the `loginToFirebase()` function.

```ts
//auth.service.ts

// ... existing imports
import { AngularFireAuth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // ... existing property declarations 

  //add these properties
  private firebaseUserIdSubject$: BehaviorSubject<string | undefined> = new BehaviorSubject<string | undefined>(undefined);
  readonly firebaseUserId$: Observable<string | undefined> = this.firebaseUserIdSubject$.asObservable();

  //update the constructor
  constructor(private auth0Service: Auth0Service, @Inject(DOCUMENT) private doc: Document, private http: HttpClient, private afAuth: AngularFireAuth) { }

  // ... existing functions

  //update this function
  loginToFirebase() {
    this.firebaseToken$.subscribe(token => {
      this.afAuth.signInWithCustomToken(token!).then(firebaseUser => {
        this.firebaseUserIdSubject$.next(firebaseUser.user?.uid);
        this.firebaseAuthenticated$.next(true);
      });
    });
  }
```

Now let's update `app.component.ts` and add a property that uses `firebaseToken$`.

```ts
//app.component.ts

//nothing above changes ...
export class AppComponent {
  // keep all the existing declarations

  //add this
  firebaseUserId$: Observable<string | undefined> = this.authService.firebaseUserId$;

```

Next let's add a visual indicator to show the Firebase user id in `app.component.ts`.

```html
<!-- app.component.html -->

<!-- update the last mat-grid-list -->
    <mat-grid-list cols="3" rowHeight="4:1">

      <mat-grid-tile *ngIf="auth0User$ | async as user">

        <mat-card>
          <mat-card-content>
            <div>
              Auth0 User Name:<br />
              {{ user.name }}
            </div>
          </mat-card-content>
        </mat-card>
      </mat-grid-tile>

      <mat-grid-tile *ngIf="firebaseToken$ | async as token">
        <mat-card>
          <mat-card-content>
            <div>
              Firebase Auth Token:<br>
              <p id="firebase-token">{{ token! }}</p>
            </div>
          </mat-card-content>
        </mat-card>

      </mat-grid-tile>

      <mat-grid-tile *ngIf="firebaseUserId$ | async as firebaseUser">
        <mat-card>
          <mat-card-content>
            <div>
              Firebase User Id:<br />
              {{ firebaseUser }}
            </div>
          </mat-card-content>
        </mat-card>

      </mat-grid-tile>
      
    </mat-grid-list>
```

Let's see if it worked. Restart the app if its not yet running and click thru all of it and hopefully you get a Firebase User Id back. You will notice that the user id begins with **auth0|...** and that is because we use the Auth0 UID as the UID when we requested the token from the Express server.

![Firebase local login success ><][16]

**Congrats - Part 2 is complete!!**

***

## Wrap-up

In this post, we setup our Firebase project and integrated it into the Angular app. We also setup a local Express server to test our code that created Firebase auth tokens. Finally we wired everything together to create a complete login process. In part 3 of this guide we will take the work we did setting up the Express server and migrate it to AWS lamba. Stay Tuned!

[1]: https://www.richtillis.com/blog/angular-user-auth-using-auth0-firebase-and-aws-lambda-part-1 "Angular User Auth Using Auth0, Firebase, & AWS Lambda (Part 1)"

[2]: https://firebase.google.com/ "Firebase Console"

[3]: https://www.richtillis.com/blog/simple-local-node-server-setup "Setting up a simple local HTTP server with Express"

[4]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528939/ng-aws-fb-blog/firebase-api-config_yw3ius.jpg "Firebase api config"

[5]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528941/ng-aws-fb-blog/angular-app-main-content_ylvctl.jpg "Angular starter app layout"

[6]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528940/ng-aws-fb-blog/auth0-login-screenshot_viuqkb.jpg "Auth0 Login Screen"

[7]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528939/ng-aws-fb-blog/disable-analytics_ebyrn2.jpg "Firebase disable analytics"

[8]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528939/ng-aws-fb-blog/firebase-new-project_ddctzd.jpg "Firebase Add new project"

[9]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528940/ng-aws-fb-blog/auth0-login-success_jnhcfz.jpg "Auth0 Successful login"

[10]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528938/ng-aws-fb-blog/firebase-create-app_rupw0b.jpg "Firebase create app"

[11]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528938/ng-aws-fb-blog/firebase-add-app_ckjlrr.jpg "Firebase add app"

[12]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528939/ng-aws-fb-blog/firebase-project-name_g4gn6q.jpg "Firebase name new project"

[13]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528938/ng-aws-fb-blog/google-authorization_rouipc.jpg "Google Authorization of Firebase CLI"

[14]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528941/ng-aws-fb-blog/firebase-cli-login_njvcb3.jpg "Firebase CLI Login"

[15]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528941/ng-aws-fb-blog/firebase-local-token-success_s7kc65.jpg "Firebase token created from local server"

[16]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528941/ng-aws-fb-blog/firebase-local-login-success_fuuejb.jpg "Firebase local login success"

[17]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528939/ng-aws-fb-blog/firebase-project-settings_auklyo.jpg "Firebase Project Settings"

[18]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528939/ng-aws-fb-blog/firebase-generate-private-key_eco99p.jpg "Firebase Generate Private Key"

[19]: https://res.cloudinary.com/dq8wrsecq/image/upload/v1625528941/ng-aws-fb-blog/firebase-private-key-warning_reqm08.jpg "Firebase Generate Private Key Warning"