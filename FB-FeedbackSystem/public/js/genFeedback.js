document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const txtSubject = document.getElementById('txtSubject');
    const txtName = document.getElementById('txtName');
    const txtEmail = document.getElementById('txtEmail');
    const txtApps = document.getElementById('txtApps');
    const ddList = document.getElementById('ddList');
    const taMessage = document.getElementById('taMessage');
    const txtStatus = document.getElementById('txtStatus');    
    const btnFeedback = document.getElementById('btnFeedback');

    function validateForm() {
        return new Promise( (resolve, reject) => {            
            var errMsg;
            console.log('OK');
            if (txtSubject.value == "") {
                errMsg = "no text in subject textbox";
                reject('Missing value : '+errMsg);
            }
            console.log('OK');
            if (txtName.value == "") {
                errMsg = "no text in Name textbox";
                reject('Missing value : '+errMsg);
            }
            console.log('OK');
            if (txtEmail.value == "") {
                errMsg = "no text in Email textbox";
                reject('Missing value : '+errMsg);
            }

            if(txtApps.value == 'Choose application'){
                errMsg = "no Application selected in the Drop-down list";
                reject('Missing value : '+errMsg);
            }
            console.log('OK');            
            if (taMessage.value == "") {
                errMsg = "no text in Message textbox";
                reject('Missing value : '+errMsg+" = "+taMessage);
            }
            console.log('AllOK');
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


    btnFeedback.addEventListener('click', e => {
        validateForm().then( (resolved) => {
            //console.log('validate form = ',resolved);
            const auth = firebase.auth();
            const uid = auth.currentUser.uid; //var userId = firebase.auth().currentUser.uid;
                    
            let subject = txtSubject.value;
            let name = txtName.value;
            let email = txtEmail.value;
            
            let appName = $('#txtApps').val();
            //let application =   $('#ddList option[value="' + $('#txtApps').val() + '"]').data('id');
            let application = $('#ddList').find('option[value="' +appName + '"]').attr('id');            

            let message = taMessage.value.replace(/\n/g, "<BR />");        
            let status = 'active', category='none';
            let dateSaved = Date.now();
            let yearweek = getYearWeek(dateSaved);

            console.log(subject, name, email, application, message, dateSaved, getYearWeek(dateSaved), getCurrentDate(dateSaved), category);

            var addDocuments = { subject, name, email, application, message, dateSaved, status, category };
            //var topicsInfo = { topic, dateSaved };
                    
            // Get a key for a new Post.
            var fbDailyRef = firebase.database().ref().child('FB_Daily');
            var fbMessagesRef = firebase.database().ref().child('FB_Messages');
            var fbAppCountsRef = firebase.database().ref().child('FB_AppCounts');
            //var catRef = firebase.database().ref().child('categories');

            var key = fbDailyRef.push().key;

            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['/FB_Daily/messages/' + key] = addDocuments;
            updates['/FB_Messages/' + application +'/' + key] = addDocuments; 
            firebase.database().ref().update(updates);

            fbDailyRef.child('DateCounts/' + yearweek + '/').transaction(function (i) { return i+1; });
            fbDailyRef.child('TotalCount/').transaction(function (i) { return i+1; });
            
            //Weekly & TotalCounts
            fbMessagesRef.child('/' + application + '/TotalCount/').transaction(function (i) { 
                firebase.database().ref('/FB_AppCounts/' + application + '/TotalCount/').set(i+1);
                return i+1; 
            });
            fbMessagesRef.child('/' + application + '/DateCounts/' + yearweek + '/').transaction(function (i) { 
                firebase.database().ref('/FB_AppCounts/' + application + '/WeeklyCount/').set(i+1);                                
                return i+1; 
            });

            // fbAppCountsRef.child('/FB_AppCounts/' + application + '/WeekCounts/' + yearweek + '/').transaction(function (i) { return i+1; });
            // fbAppCountsRef.child('/FB_AppCounts/' + application + '/TotalCount/').transaction(function (i) { return i+1; });
            
        }).catch( (error) => {
            txtStatus.style.display = 'inline';
            txtStatus.innerHTML= error;
            setTimeout( () => {
                txtStatus.style.display = 'none';
            }, 60000);            
        });
            
    });


    function appList(){
        var appList = firebase.database().ref().child('ApplicationList');
        let appNames = [], temp={};
        appList.on('value', function(snap) {
            appNames = [];
            let allApps = snap.val();
            if(allApps == null){
                return 0;
            }

            // console.log('allApps = ',allApps);
            let keys = Object.keys(allApps);
            for(let i = 0; i<keys.length;i++){
                temp = {};
                temp['id'] = allApps[keys[i]].shortName;
                temp['appName'] = allApps[keys[i]].longName;
                appNames[i] = temp;
            }

            appNames['appNames'] = appNames;
            var source   = document.getElementById("appList-template").innerHTML; //Application Central all Apps
            var template = Handlebars.compile(source);    
            $('#ddList').html(template(appNames));                        

        });
                
    }    

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            //document.getElementById("fullBody").style.display='inherit';
            //console.log('stash - put - firebaseUser.uid = ',firebaseUser.uid);
            appList();
        }else{
            //document.getElementById("fullBody").style.display='none';
            setTimeout( () => {
                window.location = "/";
            }, 5);            
        }
    });
    
});