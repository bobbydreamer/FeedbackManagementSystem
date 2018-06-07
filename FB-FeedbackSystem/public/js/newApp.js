document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const txtSname = document.getElementById('newApp-sname');
    const txtLname = document.getElementById('newApp-lname');
    const taDescription = document.getElementById('newApp-description');
    const txtStatus = document.getElementById('txtStatus');

    const btnAdd = document.getElementById('btnAdd');
    var catColors = {};

    function validateForm() {
        return new Promise( (resolve, reject) => {
            var errMsg;
            if (txtSname.value == "") {
                errMsg = "no text in short name textbox";
                reject('Missing value : '+errMsg);
            }
            
            if (txtLname.value == "") {
                errMsg = "no text in long name textbox";
                reject('Missing value : '+errMsg);
            }
                        
            if (taDescription.value == "") {
                errMsg = "no text in Description textbox";
                reject('Missing value : '+errMsg+" = "+taMessage);
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


btnAdd.addEventListener('click', e => {
        //txtStatus.innerHTML
        validateForm().then( (resolved) => {

            //console.log('validate form = ',resolved);
            const auth = firebase.auth();
            const uid = auth.currentUser.uid; //var userId = firebase.auth().currentUser.uid;
                   
            let shortName = txtSname.value;
            let longName = txtLname.value;
            let description = taDescription.value.replace(/\n/g, "<BR />");        
            let dateSaved = Date.now();
    
            console.log(shortName, longName, description, dateSaved);

            var addDocument = { shortName, longName, description, dateSaved };
                    
            // Get a key for a new Post.
            var appListRef = firebase.database().ref().child('ApplicationList');

            var key = appListRef.push().key;
   
            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['/FB_AppCounts/'+ shortName +'/longName'] = longName;
            updates['/ApplicationList/'+ shortName ] = addDocument;

            txtStatus.style.display = 'inline';
            txtStatus.innerHTML = 'Application Added';
            setTimeout( () => {
                txtStatus.style.display = 'none';
            }, 10000);            

            return firebase.database().ref().update(updates);

        }).catch( (error) => {
            txtStatus.innerHTML= error;
        });
        
    });


    function getAppDetails(){
        var appRef = firebase.database().ref().child('ApplicationList');
        var allApps = {}, appNames =[];
        let temp = {};
            appRef.on('value', function(snap) {
                allApps = {};
                appNames = [];
                allApps = snap.val();
                //console.log('allApps', allApps);
                let keys = Object.keys(allApps);
                //console.log('Keys = ',keys);
                for(let i=0;i<keys.length;i++){
                    temp = {};
                    temp['shortName'] = allApps[keys[i]].shortName;
                    temp['longName'] = allApps[keys[i]].longName;
                    temp['dateSaved'] = unixts2stdts(allApps[keys[i]].dateSaved);
                    temp['description'] = allApps[keys[i]].description;
                    appNames[i] = temp;
                }        
                appNames['appNames'] = appNames;
                //console.log('// appNames = ',JSON.stringify(appNames));        
    
                var source   = document.getElementById("ACallApps-template").innerHTML; //Application Central all Apps
                var template = Handlebars.compile(source);    
                $('.ACallApps-placeholder').html(template(appNames));
            });            
    }
        
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            getAppDetails();
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);            
        }
    });

});