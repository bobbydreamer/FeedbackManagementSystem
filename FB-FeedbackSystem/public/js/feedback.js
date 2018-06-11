document.addEventListener('DOMContentLoaded', event => {

    const txtTitle = document.getElementById('title1');

    var colors = [];
    var appList = {};
    var catList = [];


    // get elements
    //const txtSname = document.getElementById('newApp-sname');

    //var data = {"Good":{"-LE-GsOeTv6kM3rQD5IH":{"application":"BTD","category":"Good","dateSaved":1527939302131,"email":"i@j.com","message":"> Using a combination of electrophysiological, molecular, genetic and pharmacological techniques we demonstrate that the abnormal anxiety in the mutant mice is caused by [...]<BR />Yes, indeed, reads to me like some Clockwork Orange-ish nightmare. We should do better than experiment on animals; it is cruel to expose anyone to so much suffering: https://theintercept.com/2018/05/17/inside-the-barbaric-u-s-...","name":"MNO","status":"active","subject":"A central extended amygdala circuit that modulates anxiety (jneurosci.org)"},"-LE0mxLlKWnyi98MoEqc":{"application":"signal","category":"Good","dateSaved":1527964749952,"email":"d@e.com","message":"The Firebase Admin SDK provides an API for managing your Firebase Authentication users with elevated privileges. The admin user management API gives you the ability to programmatically complete the following tasks from a secure server environment","name":"sushanth","status":"active","subject":"firebase manage users"},"-LE3PJlCMLNwJOnhgXJR":{"application":"stash","category":"Good","dateSaved":1528008623794,"email":"ion","message":"I am still frustrated with the amount of incidental complexity required whenever I want to do this. My latest attempt was to use a Digital Ocean droplet with Django pre-installed. I guess the biggest issue there was setting up something so that I could easily deploy my local version to the droplet (ended up using git/Github), and ensuring those two environments were in sync. I looked into Docker in some detail about a year ago, and I think it's the only pretty good solution for this I've come across—but there's a steep up front cost in learning/setup etc. (or so it seems).<BR />What services and technologies do you use when you'd like to quickly build a web app which may never be more than a prototype, but may also turn into something real? A big aspect of what I'm wondering is about automatically setting something up for keeping local/production environments in sync, quickly deploying to production, and not having to mess with a bunch of server configuration things, user accounts, security, etc.","name":"West","status":"active","subject":"Ask HN: What's your favorite way of getting a web app up quickly in 2018?"}},"Testing":{"-LE-H5RZBpEV70sSFiDX":{"application":"signal","category":"Testing","dateSaved":1527939359661,"email":"k@l.com","message":"So his central thesis is that JS has been getting all of the love while HTML and CSS have been marginalized. I want to empathize with him because he's a seasoned vet in programming and has been at it longer than I have. But, I've been doing web development since i was 12 on pet projects, and we totally have been making great strides in web UI.<BR />If you made a website in the 90s or early noughts, everything was tables. Do you remember how to make a button with a bevel in 2005? You made a 3x3 table, and had to splice an image into 9 different sub images, and then stitch them all together. Now you have background:linear-gradient and border-radius. I mean, maybe you take this for granted now, but seriously, that was game changing for me when those things came out.<BR /><BR />Now add on UI frameworks like Bootstrap and Zurb. Before everything was a JPG photoshop mockup. Every design was treated in isolation. There were entire businesses revolved around taking a PSD and turning it into HTML/CSS. Now everything is a component. It's reusable...and useable. Sure, we may have watered down design to the point where largely every SaaS landing page is the same, but the speed with which we can get developers to convey trust via design is vastly improved over the old days.<BR /><BR />Sure, JS frameworks are all the rage right now. But we have made serious strides in web UIs as well.","name":"PQR","status":"active","subject":"GOES-17 Releases ‘First Light’ Imagery from Its Advanced Baseline Imager (noaa.gov)"}}};

    function CategoryListCount(data){
        return new Promise( (resolve, reject) => {
            let keys = Object.keys(data);
            let catListCount = {};            
            // console.log('Empty catListCount = ',catListCount, ' = ', Object.keys(catListCount).length);
            for(let i=0;i<keys.length;i++){
                catListCount[keys[i]] = Object.keys(data[keys[i]]).length;        
            }
            // console.log(catListCount);    
            resolve(catListCount); 
        });
    }
    
    function loadColors(){        
        let colorObj = {        
            "blue": "#007bff",
            "indigo": "#6610f2",
            "purple": "#6f42c1",
            "pink": "#e83e8c",
            "red": "#dc3545",
            "orange": "#fd7e14",
            "green": "#28a745",
            "teal": "#20c997",
            "cyan": "#17a2b8",
            "white": "#fff",
            "gray": "#6c757d",
            "gray-dark": "#343a40",
            "primary": "#007bff",
            "secondary": "#6c757d",
            "success": "#28a745",
            "info": "#17a2b8",
            "danger": "#dc3545",
            "light": "#f8f9fa",
            "dark": "#343a40"
        }
        let keys = Object.keys(colorObj);
        for(let i=0; i<keys.length; i++){
            let val = keys[i];
            // console.log(val);
            // val = colorObj[val];
            colors.push(val);
        }
        //console.log(colors);        
    }

    function getColor(){
        var c = colors.shift(); 
        colors.push(c);
        return c;
    }

    function formattedDate(unixts){
        let d = new Date(unixts);
        let fd;
        let months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
        fd = months[d.getMonth()]+" "+d.getDate()+", "+d.getFullYear();
        // console.log('Formatted Date = ',fd);                
        return fd;
    }


    function getUnreadCounts(){
        return new Promise( (resolve, reject) => {
            var appRef = firebase.database().ref().child('FB_AppCounts');
            var allApps = {}, appCounts =[];
            let temp = {};
            appRef.on('value', function(snap) {
                    if(snap.val() == null) return 0;
                    allApps = {};
                    appCounts = [];
                    allApps = snap.val();
                    //console.log('allApps', allApps);
                    let keys = Object.keys(allApps);
                    //console.log('Keys = ',keys);
                    for(let i=0;i<keys.length;i++){
                        temp = {};
                        temp['shortName'] = keys[i];
                        temp['longName'] = allApps[keys[i]].longName;
                        temp['TotalCount'] = allApps[keys[i]].TotalCount;
                        temp['WeeklyCount'] = allApps[keys[i]].WeeklyCount;
                        temp['color'] = getColor();
                        appCounts[i] = temp;
    
                        appList[keys[i]] = allApps[keys[i]].longName;
                    }
                    temp = {};
                    temp['appCounts'] = appCounts;
                    appCounts = temp;
                    // console.log('// appCounts = ',JSON.stringify(appCounts));        
                    // console.log('appCounts = ',appCounts);
        
                    var source   = document.getElementById("appCounts-template").innerHTML; //Application Central all Apps
                    var template = Handlebars.compile(source);    
                    $('#appCounts-placeholder').html(template(appCounts));
                });           

                //console.log('getAppRef = ',getAppRef);
                resolve('OK');                
        });
    }

    function ddOptions(category){
        let temp, flag=0;
        let ddOptions = [];
        
        for(let i=0;i<catList.length;i++){
            // console.log('Category, catList[i] = ',category,'===',catList[i]);
            if(category === catList[i]){
                flag = 1;
                temp = '<option value="' + category + '" selected>'+ category +'</option>';
            }else{
                temp = '<option value="' + catList[i] + '">'+ catList[i] +'</option>';
            }
            ddOptions[i] = temp;
            // console.log('Temp = ',temp);
        }
        if(flag==0){
            ddOptions.unshift('<option value="none" disabled selected>Choose Category</option>');
        }
        // console.log('ddOptions = ', ddOptions);
        return ddOptions;
    }


    function getCategories(uid){
        return new Promise( (resolve, reject) => {
            var catRef = firebase.database().ref().child('/FB_Categories/' + uid +'/CategoryList/');
            catRef.on('value', function(snap) {
                    if(snap.val() == null) return 0;
                    catList = Object.keys(snap.val());
                    // console.log('catList = ',catList);
            });            
                
            resolve('OK');
        });
    }  
        
    function prepareFeedbacks(){        
            var messagesRef = firebase.database().ref().child('FB_Daily/messages/').limitToLast(200);
            var temp = {}, allMessagesObj = [];
            let html;
            var tempDiv = document.createElement("div");
            let getMessagesRef = messagesRef.on('value', function(snap) {
                // console.log('Snap = ',snap);
                    if(snap.val() == null) return 0;
                    allMessages = {};
                    allMessagesObj = [];
                    allMessages = snap.val();
                    // console.log('allMessages', allMessages);
                    let keys = Object.keys(allMessages);
                    // console.log('Keys = ',keys);
                    for(let i=0;i<keys.length;i++){
                        temp = {};
                        //console.log('Status = ',allMessages[keys[i]].status);
                        if(allMessages[keys[i]].status !='active') continue;

                        temp['subject'] = allMessages[keys[i]].subject;
                        temp['application'] = appList[allMessages[keys[i]].application];
                        temp['name'] = allMessages[keys[i]].name;
                        temp['email'] = allMessages[keys[i]].email;
                        temp['dateSaved'] = formattedDate(allMessages[keys[i]].dateSaved);                        
                        //html =   $.parseHTML( allMessages[keys[i]].message )
                        $(tempDiv).html(allMessages[keys[i]].message);
                        temp['message'] = tempDiv.innerText;
                        temp['mid'] = keys[i];
                        temp['category'] = allMessages[keys[i]].category;
//                        temp['CategoryList'] = catList;
                        temp['CategoryList'] = ddOptions(allMessages[keys[i]].category);
                        temp['shortName'] = allMessages[keys[i]].application;
                        
                        allMessagesObj.unshift(temp);
                        //allMessagesObj[i] = temp;                        
                    }
                    temp = {};
                    temp['latest200Messages'] = allMessagesObj;
                    allMessagesObj = temp;                    
                    // console.log('allMessagesObj = ',allMessagesObj);
                    //console.log('// allMessagesObj = ',JSON.stringify(allMessagesObj));        
        
                    var source   = document.getElementById("latest200Messages-template").innerHTML; //Application Central all Apps
                    var template = Handlebars.compile(source);    
                                        
                    $('#latest200Messages-placeholder').html(template(allMessagesObj));
                });           

                //console.log('getMessagesRef = ',getMessagesRef);
                // resolve('OK');
    }

    firebase.auth().onAuthStateChanged(firebaseUser => {
        loadColors();
        if(firebaseUser){
            //getUnreadCounts();
            let promiseGetUnreadCounts = getUnreadCounts();
            let promisegetCategories = getCategories(firebaseUser.uid);
            // console.log('promiseGetUnreadCounts = ',promiseGetUnreadCounts);
            // console.log('promisegetCategories = ',promisegetCategories);
            Promise.all([promiseGetUnreadCounts, promisegetCategories]).then(function(results) {
                prepareFeedbacks();        
            }).catch( (error) => {
                console.log('Error = ',error);
            });
                
            
            
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);            
        }
    });


    $('#latest200Messages-placeholder').on('click','#setCategory', function(){
        let user = firebase.auth().currentUser;
        let mid = $(this).data('id');
        // console.log('Clicked set category - ',mid);

        let catOptions = $(this).prev();
        //console.log('catOptions = ',catOptions.children('option:selected').val());
        let optValue = catOptions.children('option:selected').val();
        // console.log('optValue = ',optValue);
        let application = catOptions.data('application');

        // console.log('Application name : ',application);
        let curCategory = catOptions.data('curcategory');
        // console.log('Current Category : ',curCategory);

        if(curCategory != optValue){
            let updates = {}, temp;
            updates['/FB_Daily/messages/' + mid +'/category'] = optValue;
            updates['/FB_Messages/' + application +'/' + mid +'/category'] = optValue;     
            firebase.database().ref().update(updates);            
            
            let messageRef = firebase.database().ref().child('/FB_Daily/messages/'+ mid);
            let promMIDdata = messageRef.once('value').then( function(snap){
                temp = snap.val();
            });
    
            Promise.all([promMIDdata]).then( (snap) =>{
                // console.log('TEMP = ',temp);
                updates = {};
                updates['/FB_Categories/' + user.uid + '/messages/' + optValue +'/' + mid ] = temp;     
                updates['/FB_Categories/' + user.uid + '/messages/' + curCategory +'/' + mid +'/'] = null;     
                firebase.database().ref().update(updates);            

                firebase.database().ref().child('/FB_Categories/' + user.uid + '/messages/').once('value').then( function(snap){
                    temp = snap.val();
                    CategoryListCount(snap.val()).then( (snap) =>{
                        // console.log('SNAP CategoryList = ', snap);
                        if(Object.keys(snap).length > 0){
                            firebase.database().ref().child('/FB_Categories/' + user.uid + '/CategoryList/').set(snap);
                        }                            
                    });                    
   //                 console.log('temp = ',JSON.stringify(temp));
                });                
            });        
        }
    });
    
    $('#latest200Messages-placeholder').on('click','#btnArchive', function(){
        let user = firebase.auth().currentUser;
        let mid = $(this).data('id');
        let status = 'archive';
        // console.log('Clicked set category - ',mid);

        let catOptions = $(this).prev();
        //let application = catOptions.data('application');
        let application = $(this).data('application');
        console.log('Application = ',application);

        let updates = {}, temp;
        updates['/FB_Daily/messages/' + mid +'/status'] = status;
        updates['/FB_Messages/' + application +'/' + mid +'/status'] = status;     
        firebase.database().ref().update(updates);            
            
        let messageRef = firebase.database().ref().child('/FB_Daily/messages/'+ mid);
        let promMIDdata = messageRef.once('value').then( function(snap){
            temp = snap.val();
        });
    
        Promise.all([promMIDdata]).then( (snap) =>{
            //console.log('TEMP = ',temp);
            updates = {};
            updates['/FB_Archive/messages/' + mid + '/'] = temp;

            if(temp['category'] != 'none'){
                updates['/FB_Categories/' + user.uid + '/messages/' + temp['category'] + '/' + mid +'/status'] = status;     
            }            
            firebase.database().ref().update(updates);                            
        });
        
    });
        
});