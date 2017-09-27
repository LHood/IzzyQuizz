goog.provide('Oauth2Service');

function userSignedIn(){
	return XhrService.getJSON('/user').message;
}

function userInfo(){
	if (userSignedIn()){
		const result = XhrService.getJSON('/user');
		return result
	} else {
		NotificationService.notify('Seems like you are not active. Taking you to the login page');
		setTimeout(() => {window.location = '/'}, 3000);
	}
}

function logoutUser(){
	const result = XhrService.getJSON('/logout')
	if (result.message == 'success'){
		window.location = '/';
	} else{
		NotificationService.notify('Attempted Logout and got Error: ', result.message);
		setTimeout(() => {window.location = '/'}, 3000);
	}

}
Oauth2Service.userSignedIn = userSignedIn
Oauth2Service.userInfo = userInfo
Oauth2Service.logout = logoutUser