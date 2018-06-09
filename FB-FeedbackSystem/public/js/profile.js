document.addEventListener('DOMContentLoaded', event => {
    // get elements
    const btnNameUpd = document.getElementById('btnNameUpdate');
    const btnEmailUpd = document.getElementById('btnEmailUpdate');
    const btnVerify = document.getElementById('btnVerify');
    const btnPasswordUpd = document.getElementById('btnPasswordUpdate');

    const CName = document.getElementById('txtCname');
    const NName = document.getElementById('txtNname');
    const CEmail = document.getElementById('txtCemail');
    const NEmail = document.getElementById('txtNemail');
    const NPassword = document.getElementById('txtNpassword');
    const txtStatus = document.getElementById('txtStatus');

    const trPassword = document.getElementById('trPassword');
    const lblLastLogin = document.getElementById('lblLastLogin');

    var user;
    
    function getDatetime(uid){
            var dtRef = firebase.database().ref().child('/FB_Users/' + uid);
            dtRef.on('value', function(snap) {
                // console.log(snap.val());
                    lblLastLogin.innerHTML = snap.val();
            });            
    }  

    function updateUserProfile(){
        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified;
        
        if (user != null) {
          name = user.displayName;
          email = user.email;
          uid = user.uid;  
        //   console.log(name, ' ',email, ' ',uid ,' ', user.providerData[0].providerId);
        //   console.log('User = ',user);

          var updates = {}, temp = {};
          temp['username'] = name;
          temp['email'] = email;
          temp['provider'] = user.providerData[0].providerId;
          updates['/FB_Users/details/'+ uid ] = null;
          updates['/FB_Users/details/'+ uid ] = temp;
          updates['/FB_Users/user/'+ uid ] = null;
          updates['/FB_Users/user/'+ uid ] = 'updated';
          firebase.database().ref().update(updates);                          
        }        

    }

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            getDatetime(firebaseUser.uid);
            user = firebaseUser;
            //document.getElementById('lblMessage').innerHTML = 'Hello '+firebaseUser.displayName+' - '+firebaseUser.email+' - '+firebaseUser.photoURL+' - '+firebaseUser.emailVerified+' - '+firebaseUser.uid;
            //console.log('fbs - firebaseUser',firebaseUser);
            //console.log("  Name: " + firebaseUser.providerData[0].displayName);
            //console.log("  Email: " + firebaseUser.providerData[0].email);
                
            if(firebaseUser.providerData[0].providerId == 'password'){
                trPassword.style = 'visible';
                if(firebaseUser.displayName != null){
                    CName.value = firebaseUser.displayName;
                }
                if(firebaseUser.email != null){
                    CEmail.value = firebaseUser.email;
                }
            }else{//google.com
                CName.value = firebaseUser.displayName;
                CEmail.value = firebaseUser.email;
                // console.log(CName.value.length);
                //console.log('Firebase Google User = ',firebaseUser);
            }            
            //test.innerText = 'Hello';
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);            
    }
    });

    btnNameUpd.addEventListener('click', e => {
        //txtStatus.innerHTML
        user.updateProfile({
            displayName: NName.value
          }).then(function() {
            txtStatus.innerHTML = "Profile name updated";
            updateUserProfile();
          }).catch(function(error) {
            txtStatus.innerHTML = "Error : Profile name not updated. Error = "+error;
          });
        
    });

    btnEmailUpd.addEventListener('click', e => {
        user.updateEmail(NEmail.value).then(function() {
            txtStatus.innerHTML = "Email updated to "+NEmail.value;
            updateUserProfile();
          }).catch(function(error) {
            txtStatus.innerHTML = "Error : Email not updated. Error = "+error;
          });
                  
    });    

    btnVerify.addEventListener('click', e => {
        user.sendEmailVerification().then(function() {
            txtStatus.innerHTML = "Verification email sent to "+CEmail.value;
          }).catch(function(error) {
            txtStatus.innerHTML = "Error : Error occured when trying to send verification email. Error = "+error;
          });
    });    

    btnPasswordUpd.addEventListener('click', e => {
        user.updatePassword(NPassword.value).then(function() {
            txtStatus.innerHTML = "Password update successful";
          }).catch(function(error) {
            txtStatus.innerHTML = "Error : Password updated failed. Error = "+error;
          });
                  
    });    
    
});