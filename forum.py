#sudo pip install facebook-sdk


from flask import Flask, request, session
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bson.objectid import ObjectId          # Used to create an id-object for mongo database
import json
import time
#from oauth2client import client, crypt      # Used to read googles tokens
import facebook
import os
import requests

app = Flask(__name__)
app.secret_key = os.urandom(24)
CORS(app)

db = MongoClient()['pyforum']


@app.route('/',methods = ['POST'])
def tasks():
#   Convert received json string to a dict
    received_data=json.loads(request.get_data())

    if (received_data['task']=="listThreads"):
        res=[]
        for thread in db[received_data['forumId']].find({}, {'text': False}):
            thread['_id']=str(thread['_id'])
            thread['replys']=len(thread['posts'])
            if (thread['replys']>0):
			    thread['last']=thread['posts'][thread['replys']-1]['author']
			    thread['last_time']=thread['posts'][thread['replys']-1]['time']
            else:
			    thread['last']=""
			    thread['last_time']=thread['time']
            del thread['posts']
            res.append(thread)
        return (json.dumps(sorted(res,key=lambda k: k['last_time'], reverse=True)))

    elif (received_data['task']=="addThread"):
        token=received_data['idtoken']
        try:
            if (received_data['account']=="facebook"):
                graph = facebook.GraphAPI(access_token=token)
                creator=graph.get_object(id='me')['name']
                creatorId=graph.get_object(id='me')['id']
            if (received_data['account']=="google"):
                r=requests.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='+token)
                creator=r.json()['name']
                creatorId=r.json()['sub']
#           Save the forumId in separate variables
            forumId=received_data['forumId']
#           Remove the 'task' and forumId from the received dict
            del received_data['idtoken']
            del received_data['task']
            del received_data['forumId']
#           Prime the recevied dict with an empty 'posts', future posts added to the thread will be saved here
            received_data['posts']=[]
            received_data['creator']=creator
#           Add a unix timestamp to the recevied dict, this time stamp will represent the thread's creation time
            received_data['time']=int(time.time())
#           Add viewed
            received_data['viewed']=0
#           Insert the received dict into the mongo collection specified by 'forumId'
            db[forumId].insert(received_data)
            return ("OK")
        except:
            return ("Error")

    elif (received_data['task']=="getThread"):
        db[received_data['forumId']].update({'_id': ObjectId(received_data['_id'])},{'$inc':{'viewed':1}})
        for p in db[received_data['forumId']].find({'_id': ObjectId(received_data['_id'])}):
            p['_id']=str(p['_id'])
        return(json.dumps(p))

    elif (received_data['task']=="addPost"):
        token=received_data['idtoken']
        try:
            if (received_data['account']=="facebook"):
                graph = facebook.GraphAPI(access_token=token)
                creator=graph.get_object(id='me')['name']
                creatorId=graph.get_object(id='me')['id']
            if (received_data['account']=="google"):
                r=requests.get('https://www.googleapis.com/oauth2/v3/tokeninfo?id_token='+token)
                creator=r.json()['name']
                creatorId=r.json()['sub']
#                idinfo = client.verify_id_token(token, '397944035490-1ojdlm58ess32m3iigdck8gugopmvng1.apps.googleusercontent.com')
#                creator=idinfo['name']
#                creatorId=idinfo['sub']
            db[received_data['forumId']].update({'_id': ObjectId(received_data['_id'])},{'$push': {'posts': { 'time':int(time.time()),'author':creator,'text':received_data['text']}}})
            return("OK")
        except:
            return ("Error")

    else:
        return ("Unknown task")
	
if __name__ == "__main__":
    app.run(host='0.0.0.0',port=1201)
