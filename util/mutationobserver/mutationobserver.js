
// If the browser supports native mutation observers
if(window.MutationObserver){
	steal(function() {
		return window.MutationObserver;
	});
} else if (window.MutationEvent) {
	steal('./mutation_event.js', function(Observer){
		return Observer;
	});
} else if (window.jQuery) {
	steal("./jquery_mutationobserver.js", function(Observer){
		return Observer;
	});
}
