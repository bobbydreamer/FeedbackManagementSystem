document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const txtUsername = document.getElementById('txtUsername');
    const txtEmail = document.getElementById('txtEmail');
    const txtPass = document.getElementById('txtPass');
    const txtStatus = document.getElementById('txtStatus');

    const btnRegister = document.getElementById('btnRegister');
    const btnGoogle = document.getElementById('btnGoogle');

    function validateForm() {
        return new Promise( (resolve, reject) => {
            var errMsg;
            if (txtUsername.value == "") {
                errMsg = "no text in username textbox";
                reject('Missing value : '+errMsg);
            }
            
            if (txtEmail.value == "") {
                errMsg = "no text in email textbox";
                reject('Missing value : '+errMsg);
            }
            
            if (txtPass.value == "") {
                errMsg = "no text in password textbox";
                reject('Missing value : '+errMsg);
            }
                        
            resolve('OK');   
        });
    }
    
    function unixts2stdts(unixts){
        var timestamp = unixts;
       date = new Date(timestamp),
       datevalues = [
            date.getFullYear(),
            date.getMonth()+1 <10?"0"+(date.getMonth()+1):(date.getMonth()+1),
            date.getDate() <10?"0"+date.getDate():date.getDate(),
            date.getHours() <10?"0"+date.getHours():date.getHours(),
            date.getMinutes() <10?"0"+date.getMinutes():date.getMinutes(),
            date.getSeconds() <10?"0"+date.getSeconds():date.getSeconds(),
       ];
       //alert(datevalues); //=> [2011, 3, 25, 23, 0, 0]
       //document.getElementById("demo2").innerHTML = datevalues;
       var str = datevalues[0]+"-"+datevalues[1]+"-"+datevalues[2]+" "+datevalues[3]+":"+datevalues[4]+":"+datevalues[5];
        
        return str;
    }

function getYearWeek(unixts) {
    date = new Date(unixts); 
    var onejan = new Date(date.getFullYear(), 0, 1);
    return date.getFullYear()+''+Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
}

function getCurrentDate(unixts) {
    date = new Date(unixts); 
    let str='';
    let d = date.getDate() <10?"0"+date.getDate():date.getDate();
    let m = date.getMonth()+1 <10?"0"+(date.getMonth()+1):(date.getMonth()+1);
    let y = date.getFullYear();
    str = str.concat(y,m,d);

    return str;
}

// sign-in with google
btnGoogle.addEventListener("click", e =>{
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({
        prompt: 'select_account'
    });          
    const promise = firebase.auth().signInWithPopup(provider);

    promise.catch(e => {
        if(e.code == 'auth/email-already-in-use'){
            txtStatus.innerHTML = e.message
        }else if(e.code == 'auth/weak-password'){
            txtStatus.innerHTML = e.message
        }else
            console.log(e.code, ' ',e.message);
    });
    promise.then( (e) => {

        var user = firebase.auth().currentUser;
        var name, email, photoUrl, uid, emailVerified;
        
        if (user != null) {
          name = user.displayName;
          email = user.email;
          uid = user.uid;  
        //   console.log(name, ' ',email, ' ',uid);

          var updates = {}, temp = {};
          temp['username'] = name;
          temp['email'] = email;
          temp['provider'] = 'google.com';
          updates['/FB_Users/details/'+ uid ] = temp;
          updates['/FB_Users/user/'+ uid ] = 'added';
          firebase.database().ref().update(updates);                          
        }        
    
    });    

});    


btnRegister.addEventListener('click', e => {
        //txtStatus.innerHTML
        validateForm().then( (resolved) => {

            const auth = firebase.auth();
            const promise = auth.createUserWithEmailAndPassword(txtEmail.value, txtPass.value);
            promise.catch(e => {
                if(e.code == 'auth/email-already-in-use'){
                    txtStatus.innerHTML = e.message
                }else if(e.code == 'auth/weak-password'){
                    txtStatus.innerHTML = e.message
                }else
                    console.log(e.code, ' ',e.message);
            });
            promise.then( (e) => {
                // console.log(txtUsername.value, ' ', txtEmail.value, ' ', e.uid, ' ', e.providerData[0].providerId);

                var updates = {}, temp = {};
                temp['username'] = txtUsername.value;
                temp['email'] = txtEmail.value;
                temp['provider'] = e.providerData[0].providerId;                
                updates['/FB_Users/details/'+ e.uid ] = temp;
                updates['/FB_Users/user/'+ e.uid ] = 'active';
                firebase.database().ref().update(updates);

                e.updateProfile({
                    displayName: txtUsername.value
                  }).then(function() {
                    txtStatus.innerHTML = "User added";
                  }).catch(function(error) {
                    txtStatus.innerHTML = "Error : Profile name not updated. Error = "+error;
                });
                        
            });
    
        }).catch( (error) => {
            txtStatus.innerHTML= error;
        });        
});


    function getUserDetails(){
        var appRef = firebase.database().ref().child('FB_Users/details');
        var allUsers = {}, userList =[];
        let temp = {};
            appRef.on('value', function(snap) {
                allUsers = {}; userList = [];
                allUsers = snap.val();
                // console.log('allUsers', allUsers);
                let keys = Object.keys(allUsers);
                //console.log('Keys = ',keys);
                for(let i=0;i<keys.length;i++){
                    temp = {};
                    temp['username'] = allUsers[keys[i]].username;
                    temp['email'] = allUsers[keys[i]].email;
                    temp['uid'] = keys[i];
                    temp['lastLogin'] = allUsers[keys[i]].lastlogin;                    
                    userList[i] = temp;
                }        
                userList['userList'] = userList;
                //console.log('// userList = ',JSON.stringify(userList));        
    
                var source   = document.getElementById("allUsers-template").innerHTML; //Application Central all Apps
                var template = Handlebars.compile(source);    
                $('.allUsers-placeholder').html(template(userList));
            });            
    }

    $('#appTableBody').on('click','.delete', function(){
        var temp = $(this).attr('id');
        // console.log('TEMP = ',temp);
        
        let updates = {};
        updates['/FB_Categories/' + temp ] = null;
        updates['/FB_Users/details/' + temp ] = null;
        updates['/FB_Users/user/' + temp ] = null;
        firebase.database().ref().update(updates);            
        
    });
    

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            getUserDetails();
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);            
        }
    });

});