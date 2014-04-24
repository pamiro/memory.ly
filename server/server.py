from flask import Flask
from flask import request, Response, make_response
from pymongo import MongoClient
import datetime
import simplejson
import base64
from flask import jsonify

client = MongoClient()
db = client.test_database
#collection = db.test_collection
#post = {"author": "Mike",
#         "text": "My first blog post!",
#         "tags": ["mongodb", "python", "pymongo"],
#         "date": datetime.datetime.utcnow()}
#db.posts.insert(post)
#for p in db.posts.find():
#        print p

app = Flask(__name__)

@app.route("/")
def hello():
    return "Momently.nl"

from PIL import Image
import StringIO
import re,io, datetime
url_expr = re.compile("((https?):((//)|(\\\\))+([\w\d:#@%/;$()~_?\+-=\\\.&](#!)?)*)", re.MULTILINE|re.UNICODE)

@app.route('/parse', methods=('GET', 'POST'))
def sendgrid_parser():
  # Consume the entire email
  try: 
  	envelope = simplejson.loads(request.form.get('envelope'))
  	# Get some header information
  	to_address = envelope['to'][0]
 	from_address = envelope['from']

	storage = to_address.split("@")[0]
	post = {}
	post['storage'] = storage	
	post['from']    = from_address
	post['date'] = datetime.datetime.utcnow()
	print to_address, from_address	

  	# Now, onto the body
  	text = request.form.get('text')
  	html = request.form.get('html')
 	subject = request.form.get('subject')
	
	if text != None:
		post['text']=str(text)
		print "Here!"
		match = re.search(url_expr, post['text'])
		if match:
			print match.group(0)
			if (match.group(0).find("deezer") > 0):
				post['type']='deezer' 
				post['url']=str(match.group(0))
		
	if subject != None:
		post['subject'] = str(subject) 
	

  	# Process the attachements, if any
  	num_attachments = int(request.form.get('attachments', 0))
  	attachments = []
  	if num_attachments > 0:
    		for num in range(1, (num_attachments + 1)):
      			attachment = request.files.get(('attachment%d' % num))
      			attachments.append(attachment.read())
      			# attachment will have all the parameters expected in a Flask file upload

			buff = StringIO.StringIO()
			buff.write(attachments[-1])
			buff.seek(0)
			img = Image.open(buff)		
			basewidth = 500
			wpercent = (basewidth/float(img.size[0]))
			hsize = int((float(img.size[1])*float(wpercent)))
			img = img.resize((basewidth,hsize),  Image.ANTIALIAS)
			out = io.BytesIO()
			img.save(out, format='JPEG')	
			post['image']=str(base64.b64encode(out.getvalue()))
			post['orig_image']=str(base64.b64encode(attachments[-1]))
			post['type']='picture'
			print "posting"
        		db.emails.insert(post)
        		print "success!"
		return "OK"

	if not post.has_key('type'):
		post['type']='text'

        print "posting"
	db.emails.insert(post)
	print "success!"
  except Exception, e:
  	print str(e)
	return e
  return "OK"


#@app.route('/post_image/<storage>', methods=('GET','POST'))
#def post_image(storage):
#	post = { 'image'   : base64.b64encode(request.stream.read()),
#		 'storage' : storage  }
#	db.emails.insert(post)
#  	return "OK"

import calendar

@app.route('/list/<storage>')
def list_images(storage, ts = 0):
	ts = int(request.args.get('ts', calendar.timegm(datetime.datetime.utcnow().utctimetuple())))
	response = []
	print "1",ts
	dt = datetime.datetime.fromtimestamp(ts)
	print dt
	try:
		for p in db.emails.find({"storage":storage, "date" : { "$lt": dt }}).sort("date",pymongo.DESCENDING):
			#print p['_id']
			if not p.has_key('type'): continue
			values = { 'type': p['type'], 'id': str(p['_id']) }
			if p['type'] == "deezer":
				values['data'] = p['url'];
				#response.append([p['type'], str(p['_id']), p['url']])
			if p['type'] == "picture":
				values['data'] = "http://momently.nl:5000/image/" + str(p['_id'])
				values['url'] = "http://momently.nl:5000/orig_image/" + str(p['_id'])
				#response.append([p['type'], str(p['_id']), "http://www.momently.nl:5000/image/" + str(p['_id'])])
			if p['type'] == 'text' and p.has_key('text'):
				values['data'] = p['text']
			values['from'] = p.get('from', 'Anonymous')
			values['subject'] = p.get('subject', '')
			#values['date'] = p.get('date','')
			values['date'] = calendar.timegm(p['date'].utctimetuple())
			print values['date']
			response.append(values)
	except Exception,e:
		print e
	return jsonify(storage=response)



import pymongo
import sys
#from pymongo import ObjectId
import pymongo
import bson.objectid
pymongo.objectid = bson.objectid
sys.modules["pymongo.objectid"] = bson.objectid

#    js = [ { "name" : filename, "size" : st.st_size , 
#        "url" : url_for('show', filename=filename)} ]
#then do this
#    return Response(json.dumps(js),  mimetype='application/json')

@app.route('/image/<id>')
def get_image(id):
	try:
		for p in db.emails.find({'_id':bson.objectid.ObjectId(id)}):
			response = make_response()
			response.data=base64.b64decode(p['image'])
			response.headers['Content-Type'] = 'image/jpeg'
			return response
		return "Not found"
	except Exception,e:
		return str(e)



@app.route('/orig_image/<id>')
def get_orig_image(id):
        try:
                for p in db.emails.find({'_id':bson.objectid.ObjectId(id)}):
                        response = make_response()
                        response.data=base64.b64decode(p['orig_image'])
                        response.headers['Content-Type'] = 'image/jpeg'
                        return response
                return "Not found"
        except Exception,e:
                return str(e)

from tornado.wsgi import WSGIContainer
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop

http_server = HTTPServer(WSGIContainer(app))
http_server.listen(5000)
IOLoop.instance().start()


#if __name__ == "__main__":
#    app.run(host='0.0.0.0')

