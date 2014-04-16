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

});
