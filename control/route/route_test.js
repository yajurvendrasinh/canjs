(function () {

module("can/control/route",{
	setup : function(){
		stop();
		can.route.routes = {};
		can.route._teardown();
		can.route.defaultBinding = "hashchange";
		can.route.ready();
		window.location.hash = "";
		setTimeout(function(){
			
			start();
		},13);
		
	}
});

test("routes changed", function () {
	expect(3);

	//setup controller
	can.Control.extend("Router", {
		"foo/:bar route" : function () {
			ok(true, 'route updated to foo/:bar')
		},

		"foos route" : function () {
			ok(true, 'route updated to foos');
		},

		"route" : function () {
			ok(true, 'route updated to empty')
		}
	});

	// init controller
	var router = new Router(document.body);

	can.trigger(window, 'hashchange');

	window.location.hash = '!foo/bar';
	can.trigger(window, 'hashchange');

	window.location.hash = '!foos';
	can.trigger(window, 'hashchange');
	router.destroy();

});

test("route pointers", function(){
	expect(1);
	var Tester = can.Control.extend({
		"lol/:wat route" : "meth",
		meth : function(){
			ok(true, "method pointer called")
		}
	});
	var tester = new Tester(document.body);
	window.location.hash = '!lol/wat';
	can.trigger(window, 'hashchange');
	tester.destroy();
})

test("dont overwrite defaults (#474)", function(){
	
	expect(1);
	
	can.route("content/:type",{type: "videos" });
	
	var Tester = can.Control.extend({
		"content/:type route" : function(params){
			equal(params.type, "videos")
		} 
	});
	var tester = new Tester(document.body);
	window.location.hash = "#!content/";
	can.trigger(window, 'hashchange');
	tester.destroy();
	
	
})

test("multiple controls on the same route (#359)", function() {
	expect(2);
	
	var Files = can.Control.extend({
		"test/:type route": function(params) {
			equal(params.type, "files", 'hit route event on Files control');
		}
	});

	var Contacts = can.Control.extend({
		"test/:type route": function(params) {
			equal(params.type, "contacts", 'hit route event on Contacts control');
		}
	});

	var views = {
	    contacts: Contacts,
	    files: Files
	};

	var ParentControl = can.Control.extend({
		"test/:type route": function(params) {
			var control = can.$('#child').data('controls');
			if(control) {
				control[0].destroy();
			}
			new views[params.type]('#child');
		}
	});

	var parent = document.createElement('div'),
		child = document.createElement('div');
	parent.id = 'parent';
	child.id = 'child';
	can.$('#qunit-test-area').append(parent);
	can.$('#qunit-test-area').append(child);

	new ParentControl('#parent');
	can.route.ready();

	window.location.hash = "#!test/files";
	can.trigger(window, 'hashchange');

	window.location.hash = "#!test/contacts";
	can.trigger(window, 'hashchange');
})


})();
