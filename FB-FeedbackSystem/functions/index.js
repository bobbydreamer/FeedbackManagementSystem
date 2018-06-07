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

/*
function getApps(){
    return new Promise( (resolve, reject) => {
        var appRef = firebase.database().ref().child('ApplicationList');
        var appList = {}, appNames = {};
        appRef.on('value', function(snap) {
            appList = snap.val();
            console.log('appList', appList);
            let keys = Object.keys(appList);
            for(let i=0;i<keys.length;i++){
                appNames[keys[i]] = appList[keys[i]].longName;
            }
            console.log('Keys = ',keys);
            console.log('appNames = ',appNames);
            resolve(appNames);
        });            

    });
}
*/

// app.get('/feedback', (request, response) => {
//     var appRef = firebase.database().ref().child('ApplicationList');
//     var appList = {}, appNames = {};
//     appRef.on('value', function(snap) {
//         appList = appNames = {};
//         appList = snap.val();
//         console.log('appList', appList);
//         let keys = Object.keys(appList);
//         for(let i=0;i<keys.length;i++){
//             appNames[keys[i]] = appList[keys[i]].longName;
//         }
//         console.log('Keys = ',keys);
//         console.log('appNames = ',appNames);

//         response.render('feedback.ejs', {
//             pageTitle:'Feedback - Home',
//             pageID: 'feedbackhome',
//             pageName: 'Home',
//             appNames
//         });        

//     });            
// });


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

    // getApps().then(appNames => {        
    //     response.render('appFeedbacks.ejs', {
    //         pageTitle: pgTitle,
    //         pageID: 'feedbackappFeedbacks',
    //         applicationName: appName,
    //         pageName: 'Application > '+appName,
    //         appNames
    //     });        
    // });
    
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
/*
// Firebase Functions()
// Check Authorization
exports.checkAuthorization = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
      // Throwing an HttpsError so that the client gets the error details.
      throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
          'while authenticated.');
    }
    
    // Message text passed from the client.
    const text = data.text;
    // Authentication / user information is automatically added to the request.
    const uid = context.auth.uid;
    const loginLog = {"uid":uid, timestamp:firebase.database.ServerValue.TIMESTAMP};
    
    console.log('Text:',text, ' UID:',uid);

    // Saving the new message to the Realtime Database.
    //const sanitizedMessage = sanitizer.sanitizeText(text); // Sanitize the message.
    return firebase.database().ref('/FB_Logins/').push(loginLog).then(() => {
      // Returning the sanitized message to the client.      
      return { Text: ' Success' };
    })
    
    
    });
*/

/*
exports.checkAuthorization = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'The function must be called ' +
            'while authenticated.');
      }
      
      // Message text passed from the client.
      const text = data.text;
      // Authentication / user information is automatically added to the request.
      const uid = context.auth.uid;
      const loginLog = {"uid":uid, "timestamp":firebase.database.ServerValue.TIMESTAMP};
      
    var pushKey = firebase.database().ref().child('FB_Logins').push().key;
    var updates = {};
    let FB_UsersRef = firebase.database().ref().child('/FB_Users/'+ uid);
    let getUser = FB_UsersRef.once('value').then(function(snap) {
        // console.log('Snap = ',snap.val());
        if(snap.val()!=null){
            updates['/FB_Logins/'+ pushKey] = loginLog;
            firebase.database().ref().update(updates);          
        }
        return snap.val() != null;
    });
    
    return Promise.all([getUser]).then(function(results) {
        console.log('in Promise');
        if(results[0] == true){
            // console.log("IN");
            return {Text:'OK'};
        }                    
        else
            return {Text:'Unauthorized to use application'};
    });
    

});
*/
/*
exports.checkAuthorization = functions.https.onCall((data, context) => {
    // Checking that the user is authenticated.
    if (!context.auth) {
        // Throwing an HttpsError so that the client gets the error details.
        throw new functions.https.HttpsError('failed-precondition', 'User not authorized to usee the application');
      }
      
      // Authentication / user information is automatically added to the request.
      const uid = context.auth.uid;
      const lastSignInTime = data.lastSignInTime;
      console.log('lastSignInTime = ',lastSignInTime);
      let updates = {};
    //   const loginLog = {"uid":uid, "timestamp":firebase.database.ServerValue.TIMESTAMP};

      let FB_UsersRef = firebase.database().ref().child('/FB_Users/'+ uid);
      let getUser = FB_UsersRef.once('value').then(function(snap) {
          // console.log('Snap = ',snap.val());
          if(snap.val()!=null){
              updates['/FB_Users/'+ uid] = lastSignInTime;
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

*/
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

exports.app = functions.https.onRequest(app);