steal("can/util/mutationobserver/jquery_mutationobserver.js", function(Observer){
	module("can/util/mutationobserver", {
		setup: function () {
			document.getElementById("qunit-test-area")
				.innerHTML = "";
		}
	});

	var setAttr, removeAttr;
	if(window.jQuery) {
		setAttr = jQuery.attr;
		removeAttr = jQuery.removeAttr;
	} else {
		setAttr = function(el, attr, val) {
			return el.setAttribute(attr, val);
		};
		removeAttr = function(el, attr) {
			return el.removeAttribute(attr);
		};
	}

	//Observer = window.MutationObserver;

	test("It observes attributes being added", function() {
		var element = document.createElement("div");

		var observer = new Observer(function(mutations) {
			var mutation = mutations[0];

			equal(mutations.length, 1);
			equal(mutation.type, "attributes");
			equal(mutation.target, element);
			equal(mutation.attributeName, "foo");
			start();
		});

		observer.observe(element, {
			attributes: true
		});

		can.append(can.$("#qunit-test-area"), element);
		setAttr(element, "foo", "bar");

		stop();
	});

	test("It observes attributes being modified", function() {
		var element = document.createElement("div");
		can.attr.set(element, "foo", "bar");

		var observer = new Observer(function(mutations) {
			var mutation = mutations[0];

			equal(mutations.length, 1);
			equal(mutation.type, "attributes");
			equal(mutation.oldValue, "bar");

			start();
		});

		observer.observe(element, {
			attributes: true,
			attributeOldValue: true
		});

		can.append(can.$("#qunit-test-area"), element);
		setAttr(element, "foo", "baz");

		stop();
	});

	test("It observes attributes being removed", function() {
		var element = document.createElement("div");
		can.attr.set(element, "foo", "bar");

		var observer = new Observer(function(mutations) {
			var mutation = mutations[1];

			equal(mutations.length, 2);
			equal(mutation.type, "attributes");
			equal(mutation.attributeName, "foo");

			start();
		});

		observer.observe(element, {
			attributes: true,
			attributeOldValue: true
		});

		can.append(can.$("#qunit-test-area"), element);
		removeAttr(element, "foo");

		stop();
	});

	test("Descendant attributes changing", function() {
		var element = document.createElement("div");
		var child = document.createElement("span");
		can.attr.set(child, "foo", "bar");
		can.append($(element), child);

		var observer = new Observer(function(mutations) {
			var mutation = mutations[0];

			equal(mutations.length, 1);
			equal(mutation.type, "attributes");
			equal(mutation.oldValue, "bar");
			equal(mutation.target, child);

			start();
		});

		observer.observe(element, {
			attributes: true,
			attributeOldValue: true,
			subtree: true
		});

		can.append(can.$("#qunit-test-area"), element);
		setAttr(child, "foo", "baz");

		stop();
	});

	test("Descentant attributes shouldn't trigger if subtree is not true", function() {
		var element = document.createElement("div");
		var child = document.createElement("span");
		can.attr.set(child, "foo", "bar");
		can.append($(element), child);
		var timeout;

		var observer = new Observer(function() {
			clearTimeout(timeout);
			ok(false, "We shouldn't have gotten here.");

			start();
		});

		observer.observe(element, {
			attributes: true,
			attributeOldValue: true
			// We are not observing subtree this time
		});

		can.append(can.$("#qunit-test-area"), element);
		setAttr(child, "foo", "baz");

		// Wait 5ms and then things should be ok
		timeout = setTimeout(function() {
			ok(!!timeout, "Timeout still exists because not cleared in mutation callback");
			clearTimeout(timeout);
			start();
		}, 5);

		stop();
	});

	test("It has support for attribute filters", function() {
		var element = document.createElement("div");
		can.attr.set(element, "foo", "bar");

		var observer = new Observer(function(mutations) {
			var mutation = mutations[0];

			// There should only be 1 mutation
			equal(mutations.length, 1);
			equal(mutation.attributeName, "class");

			start();
		});

		observer.observe(element, {
			attributes: true,
			attributeFilter: ["class"]
		});

		can.append(can.$("#qunit-test-area"), element);

		// This shouldn't be observed
		setAttr(element, "foo", "baz");
		
		// But this should
		setAttr(element, "class", "some-class");

		stop();
	});

	test("It observes children being inserted", function() {
		var element = document.createElement("div");
		var child = document.createElement("span");

		var observer = new Observer(function(mutations) {
			var mutation = mutations[0];

			equal(mutations.length, 1);
			equal(mutation.type, "childList");
			equal(mutation.target, element);
			equal(mutation.addedNodes.length, 1);
			equal(mutation.addedNodes[0], child);
			start();
		});

		observer.observe(element, {
			childList: true
		});

		can.append(can.$("#qunit-test-area"), element);

		// Insert the child
		can.append(can.$(element), child);
		stop();
	});

	test("It observes children being removed", function() {
		var element = document.createElement("div");
		var child = document.createElement("span");
		can.append(can.$(element), child);

		var observer = new Observer(function(mutations) {
			var mutation = mutations[0];

			equal(mutations.length, 1);
			equal(mutation.type, "childList");
			equal(mutation.target, element);
			equal(mutation.removedNodes.length, 1);
			equal(mutation.removedNodes[0], child);
			start();
		});

		observer.observe(element, {
			childList: true
		});

		can.append(can.$("#qunit-test-area"), element);
		can.remove(can.$(child));

		stop();
	});

	test("It observes nested children being removed using subtree", function() {
		var element = document.createElement("ul");
		var second = document.createElement("li");
		var third = document.createElement("div");

		can.append(can.$(second), third);
		can.append(can.$(element), second);
		can.append(can.$("#qunit-test-area"), element);

		var observer = new Observer(function(mutations) {
			var mutation = mutations[0];

			equal(mutations.length, 1);
			equal(mutation.type, "childList");
			equal(mutation.removedNodes[0], third);

			start();
		});

		observer.observe(element, {
			childList: true,
			subtree: true
		});

		can.remove(can.$(third));

		stop();
	});

	test("It doesn't observes nested children being removed without subtree option", function() {
		var element = document.createElement("ul");
		var second = document.createElement("li");
		var third = document.createElement("div");
		var timeout;

		can.append(can.$(second), third);
		can.append(can.$(element), second);

		var observer = new Observer(function(mutations) {
			clearTimeout(timeout);

			// We shouldn't get here
			ok(false, "Shouldn't call childList on a nested element without subtree option");

			start();
		});

		observer.observe(element, {
			childList: true
		});

		can.append(can.$("#qunit-test-area"), element);
		can.remove(can.$(third));

		// Wait 5ms, observation would have been called by then.
		timeout = setTimeout(function() {
			clearTimeout(timeout);
			ok(true);
			start();
		}, 5);

		stop();
	});

	test("Disconnecting will prevent further mutations from being observed", function() {
		var element = document.createElement("div");
		var child = document.createElement("span");
		var timeout;

		var observer = new Observer(function() {
			clearTimeout(timeout);

			// We shouldn't get this callback because we disconnected before the mutation
			ok(false, "Received an observation after disconnecting had occurred");
			start();
		});

		observer.observe(element, {
			childList: true
		});

		can.append(can.$("#qunit-test-area"), element);

		// Disconnect
		observer.disconnect();

		// Insert the child
		can.append(can.$(element), child);

		timeout = setTimeout(function() {
			clearTimeout(timeout);
			ok(true);
			start();
		}, 5);

		stop();
	});

	test("Observing multiple elements should work", function() {
		var element1 = document.createElement("div");
		var element2 = document.createElement("div");

		var observer = new Observer(function(mutations) {

			// There should be 2 mutations
			equal(mutations.length, 2);

			equal(mutations[0].target, element1);
			equal(mutations[1].target, element2);
			
			start();
		});

		observer.observe(element1, {
			attributes: true
		});

		observer.observe(element2, {
			attributes: true
		});

		can.append(can.$("#qunit-test-area"), element1);
		can.append(can.$("#qunit-test-area"), element2);

		setAttr(element1, "foo", "bar");
		setAttr(element2, "baz", "qux");

		stop();
	});

	test("Calling observe on the same element should only result in 1 event", function() {
		var element = document.createElement("div");

		var observer = new Observer(function(mutations) {

			// There should only be 1 mutations
			equal(mutations.length, 1);

			start();
		});

		observer.observe(element, {
			attributes: true
		});

		// Do the same observation again
		observer.observe(element, {
			attributes: true
		});

		can.append(can.$("#qunit-test-area"), element);

		setAttr(element, "foo", "bar");

		stop();


	});

});
