var GoogleAuth; 

function initClient() {
	gapi.client.init({
		'apiKey': 'my_api_key',
		'clientId': 'my_client_id',
		'scope': 'email_scope'
	}).then(() => {
		GoogleAuth = gapi.auth2.getAuthInstance();
	}).then(() => {
		handleSignIn();
	})
}

function isSignedIn(){
	return GoogleAuth.isSignedIn;
}

function isAuthorizedScope() {
	return GoogleAuth.isAuthorizedScope;
}

function signInUser(){
	GoogleAuth.signIn();
}

function logoutUser(){
	GoogleAuth.logout();
}
