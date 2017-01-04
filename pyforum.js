

// Variable for user's token, used to indentify the user server side
id_token=0;
account="";
signedInFunction=0;
signedOutFunction=0;



function onSignInGoogle(googleUser) {
	id_token = googleUser.getAuthResponse().id_token;
	account="google";
	document.getElementById('signInDiv').style.display='none';
	if (signedInFunction) signedInFunction();
}

function onSignInFaceBook(){
	id_token = FB.getAuthResponse().accessToken;
	account="facebook";
	document.getElementById('signInDiv').style.display='none';
	if (signedInFunction) signedInFunction();
}



class PyForum {

	constructor(p) {
		this.forumId=p['forumId'];
		this.lastThreadId=0;
		// Add facebook script tag to the header section
		var facebook_script_element = document.createElement('script');
		facebook_script_element.src="//connect.facebook.net/en_US/sdk.js";
		facebook_script_element.id="facebook-jssdk";
		document.getElementsByTagName('head')[0].appendChild(facebook_script_element);
	
		// Add required facebook div first in the body according to facebook's spec
		var fbDiv = document.createElement("div");       
		fbDiv.id="fb-root";
		document.body.insertBefore(fbDiv, document.body.firstChild);
		
		// Add login buttons according to facebook's and google's spec
		var siDiv = document.createElement("div");       
		siDiv.id="signInDiv";
		document.body.insertBefore(siDiv, document.body.firstChild);
		document.getElementById('signInDiv').innerHTML = "<div class='g-signin2' style='margin:20px' data-onsuccess='onSignInGoogle' ></div><div class='fb-login-button' style='margin:20px' onlogin='onSignInFaceBook' data-max-rows='1' data-size='xlarge' data-show-faces='false' data-auto-logout-link='false'></div>";
		
		// Add google meta tag to the header section
		var google_meta = document.createElement('meta');
		google_meta.name = "google-signin-client_id";
		google_meta.content = p['google'];
		document.getElementsByTagName('head')[0].appendChild(google_meta);
	
		// Add google script tag to the header section
		var google_script_element = document.createElement('script');
		google_script_element.src="https://apis.google.com/js/platform.js";
		document.getElementsByTagName('head')[0].appendChild(google_script_element);

		window.fbAsyncInit = function() {
			FB.init({
			appId      : p['facebook'],
			xfbml      : true,
			version    : 'v2.8'
			});
		};
	}

	signIn(){
		document.getElementById('signInDiv').style.display='flex';
	}

	signOut() {
		if (account=="google"){
			var auth2 = gapi.auth2.getAuthInstance();
			auth2.signOut().then(function () {
			});
		}
		if (account=="facebook"){
			FB.logout();
		}
		if (signedOutFunction) signedOutFunction();
	}
	
	setSignedInFunction(f) {
		signedInFunction=f;
	}
	
	setSignedOutFunction(f) {
		signedOutFunction=f;
	}

	getThreadList(callback) {
		var xhr = new XMLHttpRequest();
		var url = 'http://nile16.nu:1201/';
		var para  = {};
		para['forumId'] = this.forumId;
		para['task']    = "listThreads";
		xhr.open("POST", url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200) {
				var threadList=JSON.parse(xhr.responseText);
				var title=[];
				for (var i=0;i<threadList.length;i++) {
					threadList[i]['title']=(decodeURIComponent(threadList[i]['title']));
					//console.log(threadList[i]);
					}
				callback(threadList);
				}
			}
		xhr.send(JSON.stringify(para));
	}
	
	
	addThread(title,text){
		var xhr = new XMLHttpRequest();
		var url = 'http://nile16.nu:1201/';
		var para  = {};
		para['forumId'] = this.forumId;
		para['account'] = account;
		para['idtoken'] = id_token;
		para['task']    = "addThread";
		para['title']   = encodeURIComponent(title.replace(/(\r\n|\n|\r)/gm,""));
		para['text']    = encodeURIComponent(text.replace(/(\r\n|\n|\r)/gm,"<br>"));
		xhr.open("POST", url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200) {
				}
			}
		xhr.send(JSON.stringify(para));
	}


	getThread(id,callback){
		var xhr = new XMLHttpRequest();
		var url = 'http://nile16.nu:1201/';
		var para  = {};
		if (id=="last") id=this.lastThreadId; else this.lastThreadId=id;
		para['forumId'] = this.forumId;
		para['task']="getThread";
		para['_id']=id;
		xhr.open("POST", url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200) {
				var thread=eval("("+decodeURIComponent(xhr.response)+")"); // Eval requires wrapping in () Bug?
				//thread=JSON.parse(decodeURIComponent(xhr.response)); 
				//console.log(thread);
				//for (i=0;i<thread['posts'].length;i++) {
				//	}
				callback(thread);
				}
			}
		xhr.send(JSON.stringify(para));
	}

	addPost(text){
		var xhr = new XMLHttpRequest();
		var url = 'http://nile16.nu:1201/';
		var para  = {};
		para['forumId'] = this.forumId;
		para['account'] = account;
		para['idtoken'] = id_token;
		para['task']    = "addPost";
		para['_id']     = this.lastThreadId;
		para['text']    = encodeURIComponent(text.replace(/(\r\n|\n|\r)/gm,"<br>"));
		xhr.open("POST", url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200) {
				}
			}
		xhr.send(JSON.stringify(para));
	}


	
	
}