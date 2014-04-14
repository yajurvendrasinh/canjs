// If the browser supports native mutation observers
if(window.MutationObserver){
	steal(function() {
		return window.MutationObserver;
	});
} else if (window.MutationEvent) {
	steal('./polyfill.js', function(MutationObserver){
		return MutationObserver;
	});
} else if (window.jQuery) {
	steal('./jquery_observe.js', function(MutationObserver){
		return MutationObserver;
	});
}
