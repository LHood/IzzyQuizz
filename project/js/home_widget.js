
goog.require('goog.dom');
goog.require('goog.events');

const title = goog.dom.createDom('div', {'className': 'main_title'},'MIT African Students Association');
const mainLogo = goog.dom.createDom('img', {'className': 'main_logo', 'src': '/static/logo.jpg'});
const topHolder = goog.dom.createDom('div', {'className': 'top_holder'}, [mainLogo, title]);

const textToUser = goog.dom.createDom('p1', {'className': 'text_to_user'}, 
	['It seems like you are not logged in'])
const gmailLogo = goog.dom.createDom('img', {'className': 'gmail_logo', 
	'src': '/static/gmail_logo.jpg'});
const linkToLogin = goog.dom.createDom('a', {'className': 'link_to_login'}, 
	[gmailLogo, 'Login with Google']);

const bodyHolder = goog.dom.createDom('div', {'className': 'body_holder'}, [linkToLogin]);

const bottomText = goog.dom.createDom('p1', {'className': 'bottom_text'}, 
	['Copyright &copy MIT ASA 2017. All rights reserved']);
const bottomHolder = goog.dom.createDom('div', {'className': 'bottomHolder'}, [bottomText]);

const mainHolder = goog.dom.createDom('div', {'className': 'main_holder'}, 
	[topHolder, bodyHolder, bottomHolder]);

goog.events.listen(window, goog.events.EventType.LOAD, {document.body.append(mainHolder)});

