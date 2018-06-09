document.addEventListener('DOMContentLoaded', event => {
    
    // get elements
    const divEmail = document.getElementById('divEmail');
    const divPassword = document.getElementById('divPassword');
    const divLogin = document.getElementById('divLogin');
    const divMessage = document.getElementById('divMesssage');
    const divcardBody = document.getElementById('divcardBody');

    const lblMessage = document.getElementById('lblMessage');
    const email = document.getElementById('txtEmail');
    const password = document.getElementById('txtPassword');
    const signInGoogle = document.getElementById('btnGoogle');
    const signInEmail = document.getElementById('btnEmail');
    const signout = document.getElementById('btnSignout');


    function updateUserDetails() {
        return new Promise( (resolve, reject) => {
            // Update USER details.
            var user = firebase.auth().currentUser;
            var name, email, photoUrl, uid, emailVerified, providerId, lastloginTime, creationTime;
            
            if (user != null) {
            name = user.displayName;
            email = user.email;
            photoUrl = user.photoURL;
            emailVerified = user.emailVerified;
            uid = user.uid;
            lastloginTime = user.metadata.lastSignInTime;
            creationTime = user.metadata.creationTime;

            // Get a user's provider-specific profile information
            user.providerData.forEach(function (profile) {
                providerId = profile.providerId;
                // console.log("Sign-in provider: " + providerId);
                // console.log("  Provider-specific UID: " + profile.uid);
                // console.log("  Name: " + profile.displayName);
                // console.log("  Email: " + profile.email);
                // console.log("  Photo URL: " + profile.photoURL);
            });

            var user = { name, email, photoUrl, uid, emailVerified, providerId, lastloginTime, creationTime };
                    
            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['/users/allUsers/' + uid] = user;      
            updates['/users/Applications/FeedbackSystem/' + uid] = 'active';
            firebase.database().ref().update(updates);          
            resolve('OK');
            }
        });        
    }

    // sign-in with email
    signInEmail.addEventListener("click", e =>{
   
        if(divEmail.style.display == 'none'){
            divLogin.style.display = 'inline';
            divEmail.style.display = 'inline';
            divPassword.style.display = 'inline';
            lblMessage.style.display='none';
            
            signout.style.display = 'none';           
            signInGoogle.style.display = 'none';
            return 0;
        }
    
        if(email.value.length == 0 || password.value.length == 0){
            return console.log('email & password required');
        }
    
        const auth = firebase.auth();
        const promise = auth.signInWithEmailAndPassword(email.value, password.value);
        promise.then( firebaseUser => {
            // console.log('Checking Authorization to access Feedback Management System');
        });
        promise.catch(e => {
            //console.log(e.code, ' ',e.message)
            if(e.code == 'auth/user-not-found'){
                lblMessage.style.display='inline';
                lblMessage.innerHTML = 'Unauthorized to use application';
                signInEmail.style.display = 'none';
                divEmail.style.display = 'none';
                divPassword.style.display = 'none';
                
                setTimeout( () =>{
                    lblMessage.style.display='none';
                },3000);

                setTimeout( () => {
                    divEmail.style.display = 'none';
                    divPassword.style.display = 'none';
                            
                    signout.style.display = 'none';
                    signInGoogle.style.display = 'inline';
                    signInEmail.style.display = 'inline';                
                }, 3000);
                
            }
        });  
    
    });
    
    // sign-in with google
    signInGoogle.addEventListener("click", e =>{
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });          
        firebase.auth().signInWithPopup(provider);
    });    
    
    // signout
    signout.addEventListener('click', e => {
        const auth = firebase.auth();
        // console.log('Current user : ',firebase.User);
        // console.log('BEfore Signout - ', auth);
        auth.signOut();
        // console.log('After Signout - ', auth);
        // console.log('Current user : ',firebase.User);
    });

    // Check AUTH state change
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){            
            var checkAuthorization = firebase.functions().httpsCallable('checkAuthorization');         
            checkAuthorization({ "lastSignInTime" : firebaseUser.metadata.lastSignInTime}).then( (result) => {
                // console.log('Functions () - ',result);
                // console.log('Functions () - ',result.data.status);
                //if(result.data.status == 'OK'){
                if(result.data.status){
                    // console.log('onAuthStateChanged - FBAuth');
                    lblMessage.style.display='inline';
            /*        console.log(firebaseUser.createdAt, ' ', firebaseUser.lastLoginAt); //Not able to get this data */
            
                    if(firebaseUser.providerData[0].providerId == 'password'){
                        lblMessage.innerHTML = 'Hello '+firebaseUser.email;
                        // console.log('Firebase Email User = ',firebaseUser);
                    }else{//google.com
                        //document.getElementById('lblMessage').innerHTML = 'Hello '+firebaseUser.displayName+' - '+firebaseUser.email+' - '+firebaseUser.photoURL+' - '+firebaseUser.emailVerified+' - '+firebaseUser.uid;
                        lblMessage.innerHTML = 'Hello '+firebaseUser.displayName;
                        // console.log('Firebase Google User = ',firebaseUser);
                    }
            
                    divLogin.style.display = 'none';
                    divEmail.style.display = 'none';
                    divPassword.style.display = 'none';

                    divcardBody.style.display='inline';
                    lblMessage.style.display = 'inline';

                    signInGoogle.style.display = 'none';
                    signInEmail.style.display = 'none';
                    signout.style.display = 'inline';

                    setTimeout( () => {
                        window.location = "/feedback";
                    }, 2000);

                }else{//Mostly this is not executed.
                    // console.log('ELSE');
                    lblMessage.style.display='inline';
                    lblMessage.innerHTML= 'Unauthorized to use application';
                    if(firebaseUser){
                        const auth = firebase.auth();
                        auth.signOut();
                        console.log('Unauthorized to use application');
                    }        
                }

            }).catch( (error) => {
                // Getting the Error details.
                // console.log('CATCH');
                if(firebaseUser){
                    const auth = firebase.auth();
                    auth.signOut();
                }        

                var code = error.code;
                var message = error.message;
                var details = error.details;
                if(code != undefined){
                    lblMessage.style.display='inline';
                    lblMessage.innerHTML= code + message + details;
                    console.log('CODE:',code,' MESSAGE:',message,' DETAILS:',details);    
                }                
            });
            
        }else{
            divcardBody.style.display='inline';            
            divLogin.style.display = 'inline';

            divEmail.style.display = 'none';
            divPassword.style.display = 'none';
                    
            signout.style.display = 'none';
            signInGoogle.style.display = 'inline';
            signInEmail.style.display = 'inline';

            if(lblMessage.innerHTML !='Unauthorized to use application'){
                lblMessage.innerHTML = '';
            }

        }

    });
    
});