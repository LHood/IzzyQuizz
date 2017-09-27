goog.require('tools.modules');
const required_js = [
				"/js/xhr_service.js",
				"/js/oauth2_service.js",
				"/js/data_service.js",
			]
const moduleTools = tools.modules
moduleTools.append_js(required_js);
console.log('home_init_executed');