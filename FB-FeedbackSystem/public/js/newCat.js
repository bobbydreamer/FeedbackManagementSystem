document.addEventListener('DOMContentLoaded', event => {

    // get elements
    const txtCatname = document.getElementById('newCat-name');
    const txtStatus = document.getElementById('txtStatus');
    const catTableBody = document.getElementById('catTableBody');

    const btnAdd = document.getElementById('btnAdd');
    var catColors = {}, user;

    function validateForm() {
        return new Promise( (resolve, reject) => {            
            var errMsg;
            if (txtCatname.value == "") {
                errMsg = "no text in category name textbox";
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

btnAdd.addEventListener('click', e => {
        validateForm().then( (resolved) => {

            //console.log('validate form = ',resolved);                   
            let categoryName = txtCatname.value;    
            // console.log('Category Name = ',categoryName);
                   
            var updates = {};
            updates['/FB_Categories/' + user.uid +'/CategoryList/' + categoryName] = 0;

            txtStatus.style.display = 'inline';
            txtStatus.innerHTML = 'New category added';
            setTimeout( () => {
                txtStatus.style.display = 'none';
            }, 10000);            

            return firebase.database().ref().update(updates);

        }).catch( (error) => {
            txtStatus.style.display = 'inline';
            txtStatus.innerHTML= error;
            setTimeout( () => {
                txtStatus.style.display = 'none';
            }, 60000);            
            
        });
        
    });


    function getCatDetails(){
        var appRef = firebase.database().ref().child('/FB_Categories/' + user.uid +'/CategoryList/');
        var allCats = {}, catNames =[];
        let temp = {};
        appRef.on('value', function(snap) {
            if(snap.val() == null) return 0;
            allCats = {};
            catNames = [];
            allCats = snap.val();
            // console.log('allCats', allCats);
            let keys = Object.keys(allCats);
            // console.log('Keys = ',keys);
            for(let i=0;i<keys.length;i++){
                temp = {};
                temp['catName'] = keys[i];
                temp['counts'] = allCats[keys[i]];                    
                catNames[i] = temp;
            }        
            catNames['catNames'] = catNames;
            // console.log('// catNames = ',JSON.stringify(catNames));        

            var source   = document.getElementById("userCategories-template").innerHTML; //Application Central all Apps
            var template = Handlebars.compile(source);    
            $('.userCategories-placeholder').html(template(catNames));                
        });            
    }
        
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
            user =firebaseUser;
            // console.log('UID = ',user.uid);
           getCatDetails();
        }else{
            setTimeout( () => {
                window.location = "/";
            }, 5);            
        }
    });

});