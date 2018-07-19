function getUnapprovedOutfits(limit){
	let data = {
		limit: limit
	}
	return fetch(`http://smallbrandserver.herokuapp.com/api/outfits/unapproved`, {
		body: data 
	});
}

// change the status of an outfit from unapproved to approved
// using outfit id as selector
function changeApprovalState(id){
	return fetch(`http://smallbrandserver.herokuapp.com/api/outfits/reassign/` + id);
}

function getOutfitById(id){
  return fetch(`http://smallbrandserver.herokuapp.com/api/outfits/` + id);
}

function getOutfitsByTag(tag){
	tag = tag || 'frontpage'
	return fetch(`http://smallbrandserver.herokuapp.com/api/tags/outfits/` + tag);
}

function getOutfitsByUser(user){
	return fetch(`http://smallbrandserver.herokuapp.com/api/users/outfits/` + user);
}

//need to json the limit paramenter to get it to work
function getRandomOutfits(limit){
	let data = {
		limit: limit
	}
	return fetch(`http://smallbrandserver.herokuapp.com/api/outfits/`, {
		body: data 
	});
}

//must use json to properly send body data to node 
function postUser(user){
	let data = JSON.stringify(user);
	console.log(data)
	return fetch(`http://smallbrandserver.herokuapp.com/api/user/`, {
		 headers: {
	      'Accept': 'application/json',
	      'Content-Type': 'application/json'
	    },
		method: 'POST',
		body: data 
	});
}

function getUserById(id){
	return fetch(`http://smallbrandserver.herokuapp.com/api/users/` + id);
}

function postOutfit(outfit){
	var formData  = new FormData();
	for(var name in outfit) {
		formData.append(name, outfit[name]);
	}

	let images = outfit['images'];
	if(images){
		for (var i = 0; i < images.length; i++) {
			formData.append("images[]", images[i], images[i]['name']);
		}
	}

	console.log(formData);

	return fetch(`http://smallbrandserver.herokuapp.com/api/outfit`, {
	method: 'POST',
	body: formData
	});
}

function deleteOutfit(id){
	return fetch(`http://smallbrandserver.herokuapp.com/api/outfits/` + id, {
	method: 'DELETE'
	});
}

const Client = { getOutfitById, getOutfitsByTag, getUserById, getOutfitsByUser, getRandomOutfits, postOutfit, postUser, deleteOutfit };
export default Client