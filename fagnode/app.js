var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({'extended' : 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type : 'application/vnd.api+json'}));

var cors = require('cors');
var corsOptions = {
  origin: false,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204 
}

app.use(cors(corsOptions));

var multer = require('multer');
var upload = multer({ dest: 'upload/'});

var mongoose = require('mongoose');
mongoose.connect('mongodb://heroku_r09ljrwl:tjtjogjpuaa8sfiemk7a8rdop5@ds141221.mlab.com:41221/heroku_r09ljrwl');
var shortid = require('shortid');

var path = require('path');
var fs = require('fs');

const URL = require('url');
const outfitSchema = new mongoose.Schema({
	_id: { type: String, 'default': shortid.generate },
	author: { id: String, fullName: String },
	date: Date,
	images: [{ data: Buffer, contentType: String }],
	items: [{ name: String, url: String }],
	tags: [{ tag: String }],
	features: [{ tag: String}],
	model: { name: String, url: String}, 
	accepted: Boolean
});

const userSchema = new mongoose.Schema({
	facebook_id: String, 
	full_name: String,
	email: String
});

var Outfit = mongoose.model('Outfit', outfitSchema);
var User = mongoose.model('User', userSchema);

//takes array of image data and makes it parseable by browser
function convertImageData(outfits){
	Object.keys(outfits).forEach(function(key,index) {
		for(let i = 0; i < outfits[key].images.length; i++){
			outfits[key].images[i]['base64'] = outfits[key].images[i].data.toString('base64');
		}
	});
	return outfits;
}

//returns full author name based on id
function getFullFromId(){
	User.find({ facebook_id: req.params.userid }).lean().exec(function(err, user){
		if (err) return console.log(err);
		if(user){
			return user;
		}else{
			return null;
		}
	});
}

//get specific outfit based on Id
//can access both approved and unapproved items this way, potential secuity issue?
app.get('/api/outfits/:outfitId', function(req, res){
	Outfit.find({ _id: req.params.outfitId }).lean().exec(function(err, outfit){
		if (err) return console.log(err);
		res.json(convertImageData(outfit)[0]);
	}
	);
});

//returns an array of outfits based on tag
app.get('/api/tags/outfits/:tag', function(req, res){
	Outfit.find({$and: [{ 'tags.tag': req.params.tag }, { accepted: true }]}).lean().exec(function(err, outfit){
		if (err) return console.log(err);
		res.json(convertImageData(outfit));
	}
	);
});

//returns an array of outfits based on user
app.get('/api/users/outfits/:user', function(req, res){
	Outfit.find({ $and: [{ 'author': req.params.user }, { accepted: true }] }).lean().exec(function(err, outfit){
		if (err) return console.log(err);
		res.json(convertImageData(outfit));
	}
	);
});

//returns user based on id
app.get('/api/users/:userid', function(req, res){
	res.json(getFullFromId(req.params.id));
});

//delivers a number of approved outfits, defaulting to 6
app.get('/api/outfits', function(req, res){
	let limit = parseInt(req.body.limit) || 6;
	Outfit.find({ accepted: true }).limit(limit).lean().exec(function(err, outfit){
		if (err) return console.log(err);
		res.json(convertImageData(outfit));
	}
	);
});

//delivers a number of unapproved outfits, defaulting to 6
app.get('/api/outfits/unapproved', function(req, res){
	let limit = parseInt(req.body.limit) || 6;
	Outfit.find({ accepted: false }).limit(limit).lean().exec(function(err, outfit){
		if (err) return console.log(err);
		res.json(convertImageData(outfit));
	}
	);
});

//reassign an outfit from unapproved to approved
app.get('/api/outfits/reassign/:outfitId', function(req, res){
	Outfit.update({ _id: req.params.outfitId }, {
	  accepted: true
	})
});

//add a new user
app.post('/api/user', function(req, res){
	let { id, name } = req.body;
	let userData = new User();
	userData.facebook_id = id;
	userData.full_name = name;

	User.count({ facebook_id: id }, function(err, count){
		if(count === 0){
			userData.save(function(err, fluffy){
				if (err) console.log(err);
			});
		}
	});

});

//post a new outfit to the app
app.post('/api/outfit', upload.any(), function(req, res){
	//validate the outfit input to make sur eits valid
	//subimt outfit to monogodb

	//decode json string of items(json'd bc it has to be transferred as multipart)
	try{
		var items = JSON.parse(req.body.items);
		var rawTags = JSON.parse(req.body.tags);
	} catch(err) {
		if(err) console.log(err);
	}
	
	var images = [];
	req.files.forEach(function(item){
		images.push({ data: fs.readFileSync(item.path), contentType: item.mimetype });
	});

	var tags = [];
	for(let i = 0; i < rawTags.length; i++){
		tags.push({ tag: rawTags[i].text });
	}

	var userOutfit = new Outfit();
	userOutfit.author = { id: req.body.userID, fullName: getFullFromId(req.body.userID) };
	userOutfit.date = Date.now();
	userOutfit.images = images;
	userOutfit.items = items;
	userOutfit.model = { name: req.body.modelName, url: req.body.modelLink};
	userOutfit.tags = tags;
	userOutfit.accepted = false;

	userOutfit.save(function(err, fluffy){
		if (err) console.log(err);
	});
});

//delete an outfit from the app based on id
//works on all outfits
app.delete('/api/outfits/:outfitId', function(req, res){
	Outfit.findOneAndRemove({ _id: req.params.outfitId }, function(err, response){
		if (err) console.log(err);
	});
});

app.listen(process.env.PORT || 8080, function(){
	console.log('API listening for connnections.');
});