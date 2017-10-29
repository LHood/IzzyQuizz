goog.provide('XhrService');
function get(url, data) {
	if(data === undefined){
		data = {};
	}

	return new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();

		xhr.onload = function(e) {
			const response = xhr.response;
			resolve(xhr.response);
		};
		xhr.onerror = function(error) {
			reject(error.message);
		};
		xhr.open('GET', url);
		xhr.withCredentials = true;
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(data));
	});
}

function getJSON(url, data) {
	if(data === undefined){
		data = {};
	}
	return get(url, data).then(JSON.parse);
}

function post(url, data) {
	if(data === undefined){
		data = {};
	}

	console.log('posting data ', data, ' at url ', url);
	return new Promise(function(resolve, reject) {
		const xhr = new XMLHttpRequest();

		xhr.onload = function(e) {
			const response = xhr.response;
			resolve(xhr.response);
		};

		xhr.onerror = function(error) {
			if (error.hasOwnProperty('message')) {
				return error.message;
			} else {
				reject('Unkown error connecting to server');
			}
		};
		xhr.open('POST', url);
		xhr.withCredentials = true;
		xhr.setRequestHeader('Content-Type', 'application/json');
		xhr.send(JSON.stringify(data));
	});
}

function postJSON(url, data) {
	if(data === undefined){
		data = {};
	}
	return post(url, data).then(JSON.parse);
}

XhrService.get = get;
XhrService.post = post;
XhrService.getJSON = getJSON;
XhrService.postJSON = postJSON;
