document.addEventListener('DOMContentLoaded', event => {
    // get elements
    const signout = document.getElementById('aSignout');
    const name = document.getElementById('userProfile');
    const test = document.getElementById('test');
 
    signout.addEventListener('click', e => {
        const auth = firebase.auth();
        const promise = auth.signOut();
        promise.catch(e => {
            console.log('Error : Feedbacks : Logout : There was an unexpected error during logout');
            console.log('Error : Feedbacks : Logout : Message = ', e);
        });
        promise.then(e => {
            setTimeout( () => {
                window.location = "/";
            }, 500);    
        });

    });


    function getAppNames(){
    var appRef = firebase.database().ref().child('ApplicationList');
    var allApps = {}, appNames =[];
    let temp = {};
        appRef.on('value', function(snap) {
            allApps = {};
            appNames = [];
            allApps = snap.val();
            // console.log('allApps', allApps);
            let keys = Object.keys(allApps);
            // console.log('Keys = ',keys);
            for(let i=0;i<keys.length;i++){
                temp = {};
                temp['shortName'] = allApps[keys[i]].shortName;
                temp['longName'] = allApps[keys[i]].longName;            
                appNames[i] = temp;
            }        
            appNames['appNames'] = appNames;
            // console.log('appNames = ',JSON.stringify(appNames));        

            var source   = document.getElementById("sidebar-template").innerHTML;
            var template = Handlebars.compile(source);    
            $('.sidebar-placeholder').html(template(appNames));
        });
        
    }

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            $("body").fadeIn("fast");
            getAppNames();
            //console.log('fbs - firebaseUser',firebaseUser);
            if(firebaseUser.providerData[0].providerId == 'password'){
                if(firebaseUser.displayName == null){
                   name.innerText = firebaseUser.email;
                }else
                   name.innerText = firebaseUser.displayName;
                //console.log('Firebase Email User = ',firebaseUser);
            }else{//google.com
                name.innerText = firebaseUser.displayName;
                //console.log('Firebase Google User = ',firebaseUser);
            }            
            //test.innerText = 'Hello';
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);            
    }
    });
    
});