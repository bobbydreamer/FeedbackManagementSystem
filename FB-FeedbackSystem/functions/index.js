const functions = require('firebase-functions');
const express = require('express');
const firebase = require('firebase-admin');

// variables
const app = express();
firebase.initializeApp();
var db = firebase.database();

// middleware

app.use(express.static('views'));   //Middleware for sharing files across routes  

app.set('view engine', 'ejs');          //Name of view engine
app.set('views', __dirname+'/views');   //Location of views

// Routes - When adding new routes update firebase.json in root folder
//app.use(require('./routes/stash'));

app.get('/', (request, response) => {
    response.render('feedbacklogin.ejs', {
        pageTitle:'Feedback - Login',
        pageID: 'feedbacklogin',
        pageName: 'Login'
    });    
});

app.get('/feedback', (request, response) => {
    // getApps().then(appNames => {
    //     console.log('/feedback = ',appNames);
        response.render('feedback.ejs', {
            pageTitle:'Feedback - Home',
            pageID: 'feedbackhome',
            pageName: 'Home' //,
            //appNames
        });        
    // });
});

app.get('/newApp', (request, response) => {
    response.render('newApp.ejs', {
        pageTitle:'Feedback - New Application',
        pageID: 'feedbackNewApp',
        pageName: 'Applications'
    });    
});

app.get('/newCat', (request, response) => {
    response.render('newCat.ejs', {
        pageTitle:'Feedback - Category',
        pageID: 'feedbackNewCategory',
        pageName: 'Categories'
    });    
});

app.get('/app/:appName', (request, response) => {
    var appName = request.params.appName;
    var pgTitle = 'Feedback - '+appName;
    response.render('appFeedbacks.ejs', {
        pageTitle: pgTitle,
        pageID: 'feedbackappFeedbacks',
        applicationName: appName,
        pageName: 'Application >> '+appName
    });    
});

app.get('/category/:catName', (request, response) => {
    var catName = request.params.catName;
    var pgTitle = 'Feedback - Category/'+catName;
    response.render('appFeedbackCat.ejs', {
        pageTitle: pgTitle,
        pageID: 'feedbackCategory',
        categoryName: catName,
        pageName: 'Category > '+catName
    });    
});

app.get('/testfeed', (request, response) => {
    response.render('genFeedback.ejs', {
        pageTitle:'Feedback - Generate TEST Feedbacks',
        pageID: 'feedbackTEST',
        pageName: 'Test Feedbacks'
    });    
});

app.get('/archive', (request, response) => {
    response.render('archive.ejs', {
        pageTitle:'Feedback - Archive',
        pageID: 'feedbackArchive',
        pageName: 'Archive'
    });    
});

app.get('/profile', (request, response) => {
    response.render('profile.ejs', {
        pageTitle:'Feedback - Profile',
        pageID: 'feedbackProfile',
        pageName: 'Profile'
    });    
});

app.get('/users', (request, response) => {
    response.render('addUsers.ejs', {
        pageTitle:'Feedback - Users',
        pageID: 'feedbackUsers',
        pageName: 'Users'
    });    
});

// Firebase Functions()
// Check Authorization

exports.checkAuthorization = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'User not authorized to usee the application');
      }
      
      // Authentication / user information is automatically added to the request.
      const uid = context.auth.uid;
      const lastSignInTime = data.lastSignInTime;
    //   console.log('lastSignInTime = ',lastSignInTime);
      let updates = {};
    //   const loginLog = {"uid":uid, "timestamp":firebase.database.ServerValue.TIMESTAMP};

      let FB_UsersRef = firebase.database().ref().child('/FB_Users/user/'+ uid);
      let getUser = FB_UsersRef.once('value').then(function(snap) {
          // console.log('Snap = ',snap.val());
          if(snap.val()!=null){
              updates['/FB_Users/user/'+ uid] = lastSignInTime;
              updates['/FB_Users/details/'+ uid +'/lastlogin/'] = lastSignInTime;
              firebase.database().ref().update(updates);          
          }
          return snap.val() != null;
      });
    
    return Promise.all([getUser]).then(function(results) {
        if(results[0] == true){
            // console.log("IN");
            return {status:'OK'};
        }                    
        else{   
            // throw new functions.https.HttpsError('failed-precondition', 'The function must be called while authenticated.');
            return {};
        }
            
    });
});

exports.writeFeedback = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    // Have to comment the below condition because feedbacks are going to come in from other projects, UID is only unique within project.
    // Same user in different project get different UID
    // if (!context.auth) {
    //     // Throwing an HttpsError so that the client gets the error details.
    //     throw new functions.https.HttpsError('failed-precondition', 'User not authorized to usee the application');
    // }

    // Authentication / user information is automatically added to the request.
    //const uid = context.auth.uid;

    const feedback = data.feedback;
    const yearweek = data.yearweek;
    const application = data.application;
    
    // console.log('UID:',uid,' Yearweek:',yearweek,' Application:',application,' Feedback:',feedback);
    let updates = {};
    
    let fbDailyRef = firebase.database().ref().child('FB_Daily');
    let fbMessagesRef = firebase.database().ref().child('FB_Messages');
    let fbAppCountsRef = firebase.database().ref().child('FB_AppCounts');

    // Get a key for a new Post.
    let key = fbDailyRef.push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    updates['/FB_Daily/messages/' + key] = feedback;
    updates['/FB_Messages/' + application +'/' + key] = feedback; 
    let prom1 = firebase.database().ref().update(updates);

    let prom2 = fbDailyRef.child('/DateCounts/' + yearweek + '/').transaction(function (i) { return i+1; });
    let prom3 = fbDailyRef.child('/TotalCount/').transaction(function (i) { return i+1; });
    
    //Weekly & TotalCounts
    let prom4 = fbMessagesRef.child('/' + application + '/TotalCount/').transaction(function (i) { 
        firebase.database().ref('/FB_AppCounts/' + application + '/TotalCount/').set(i+1);
        return i+1; 
    });
    let prom5 = fbMessagesRef.child('/' + application + '/DateCounts/' + yearweek + '/').transaction(function (i) { 
        firebase.database().ref('/FB_AppCounts/' + application + '/WeeklyCount/').set(i+1);                                
        return i+1; 
    });

    return Promise.all([prom1, prom2, prom3, prom4, prom5]).then(function(results) {
        return {status:'OK'}
    });    

});

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.app = functions.https.onRequest(app);