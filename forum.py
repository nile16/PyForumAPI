
from flask import Flask, request
from flask_cors import CORS, cross_origin
from pymongo import MongoClient
from bson.objectid import ObjectId
import json
import time

app = Flask(__name__)
CORS(app)

client = MongoClient()
db = client['pyforum']

@app.route('/',methods = ['POST'])
def tasks():
    received_data=json.loads(request.get_data())

    if (received_data['task']=="listThreads"):
        res=[]
        for p in db[received_data['forumId']].find({}, {'text': False}):
            p['_id']=str(p['_id'])
            res.append(p)
        return (json.dumps(res))

    elif (received_data['task']=="addThread"):
        del received_data['task']
        received_data['posts']=[]
        db[received_data['forumId']].insert(received_data)
        return ("OK")

    elif (received_data['task']=="getThread"):
        for p in db[received_data['forumId']].find({'_id': ObjectId(received_data['_id'])}):
            p['_id']=str(p['_id'])
            return(json.dumps(p))

    elif (received_data['task']=="addPost"):
        db[received_data['forumId']].update({'_id': ObjectId(received_data['_id'])},{'$push': {'posts': { 'author':received_data['author'],'text':received_data['text']}}})
        return("OK")

    elif (received_data['task']=="openForum"):
        db[received_data['forumId']].update({'_id': ObjectId(received_data['_id'])},{'$push': {'posts': { 'author':received_data['author'],'text':received_data['text']}}})
        return("OK")

    else:
        return ("Unknown task")
	
if __name__ == "__main__":
    app.run(host='0.0.0.0',port=1201)
