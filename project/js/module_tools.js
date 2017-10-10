/**
	Tools for importing js and css modules by only specifying their sources.
	Very helpful since you only have to write the srcs in an array and
	the methods will insert that for you
	#Note that this depends on google closure
**/
goog.provide('tools.modules');
goog.require('goog.dom');
function append_js(modules) {
	for (module of modules) {
		const node = goog.dom.createDom('script', {'src': module});
		document.body.append(node);
		console.log('loaded js module ', module);
	}
}

function append_css(modules) {
	for (module of modules) {
		const node = goog.dom.createDom('link', {'rel': 'stylesheet', 'href': module});
		document.head.append(node);
		console.log('loaded css module ', module);
	}
}
tools.modules.append_js = append_js;
tools.modules.append_css = append_css;
