class PyForum {

	constructor(forumId) {
		this.forumId=forumId;
		this.lastThreadId=0;
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
	
	
	addThread(title,creator,text){
		var xhr = new XMLHttpRequest();
		var url = 'http://nile16.nu:1201/';
		var para  = {};
		para['forumId'] = this.forumId;
		para['task']    = "addThread";
		para['title']   = encodeURIComponent(title.replace(/(\r\n|\n|\r)/gm,""));
		para['creator'] = encodeURIComponent(creator);
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

	addPost(author,text){
		var xhr = new XMLHttpRequest();
		var url = 'http://nile16.nu:1201/';
		var para  = {};
		para['forumId'] = this.forumId;
		para['task']    = "addPost";
		para['_id']     = this.lastThreadId;
		para['author']  = encodeURIComponent(author);
		para['text']    = encodeURIComponent(text.replace(/(\r\n|\n|\r)/gm,"<br>"));
		xhr.open("POST", url, true);
		xhr.onreadystatechange = function(){
			if(xhr.readyState == 4 && xhr.status == 200) {
				}
			}
		xhr.send(JSON.stringify(para));
	}


	
	
}