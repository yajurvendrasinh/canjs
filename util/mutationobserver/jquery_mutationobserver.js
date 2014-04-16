steal("jquery", "can/util/setimmediate", function($, setImmediate) {

	var bind = function(element, name, fn) {
		var $el = $(element);

		$el.bind(name, fn);
		$el.bind("remove", function() {
			$el.unbind(name, fn);
		});
	};

	// handle via calls to attr
	var oldAttr = $.attr;
	$.attr = function (el, attrName) {
		var oldValue, newValue;
		if (arguments.length >= 3) {
			oldValue = oldAttr.call(this, el, attrName);
		}
		var res = oldAttr.apply(this, arguments);
		if (arguments.length >= 3) {
			newValue = oldAttr.call(this, el, attrName);
		}
		if (newValue !== oldValue) {
			$(el).trigger("canAttribute", {
				target: el,
				attributeName: attrName,
				oldValue: oldValue
			});
		}
		return res;
	};
	var oldRemove = $.removeAttr;
	$.removeAttr = function (el, attrName) {
		var oldValue = oldAttr.call(this, el, attrName),
			res = oldRemove.apply(this, arguments);

		if (oldValue != null) {
			$(el).trigger("canAttribute", {
				target: el,
				attributeName: attrName,
				oldValue: oldValue
			});
		}
		return res;
	};

	var addedEvents = [
		"after",
		"append", 
		"before",
		"html",
		"prepend"
	];

	var removalEvents = [
		"remove",
		"empty"
	];

	can.each(removalEvents, function(name) {
		var oldFn = $.fn[name];
		$.fn[name] = function() {
			var removedNodes = [];
			
			this.children().each(function(i, element) {
				removedNodes.push(element);
			});
				
			if(name === "remove") {
				removedNodes.push(this[0]);
			}

			this.each(function(i, element) {
				$(element).trigger("canChildList", {
					type: "childList",
					removedNodes: removedNodes
				});
			});

			return oldFn.apply(this, arguments);
		};
	});

	can.each(addedEvents, function(name) {
		var oldFn = $.fn[name];
		$.fn[name] = function() {
			var addedNodes = [];
			
			var result = oldFn.apply(this, arguments);

			this.children().each(function(i, element) {
				addedNodes.push(element);
			});

			this.each(function(i, element) {
				$(element).trigger("canChildList", {
					type: "childList",
					addedNodes: addedNodes
				});
			});

			return result;
		};
	});

	function jMutationObserver(callback) {
		this._callback = callback;
		this._mutations = [];
	}

	can.extend(jMutationObserver.prototype, {

		/**
		 * @method observe
		 * @hide
		 * @param {HTMLElement} element The element to observe
		 * @param {Object} options Init options for this observation
		 */
		observe: function(element, options) {
			var $element = $(element);
			var observer = this;

			// For the `attributes` type of observation
			if(options.attributes) {
				// Bind to the special canAttribute event so that any descendant nodes
				// also trigger up
				bind(element, "canAttribute", function(jEv, event) {
					// If we're not observing subtrees, then make sure that the target element
					// is the element of this observation.
					if(!options.subtree && element !== event.target) {
						return;
					}

					// If using attribute filters, make sure this is an attribute
					// that we care about.
					if(options.attributeFilter &&
						 can.inArray(event.attributeName, options.attributeFilter) === -1) {
						return;
					}

					event.type = "attributes";

					// If this observation doesn't care about oldValue, don't send that
					// as part of the event.
					if(!options.attributeOldValue) {
						delete event.oldValue;
					}
					observer._queue(event);
				});
			}

			if(options.childList) {
				bind(element, "canChildList", function(jEv, event) {
					event.target = element;
					observer._queue(event);
				});
			}
		},

		_queue: function(event) {
			this._mutations.push(event);

			if(this._mutations.length === 1) {
				var self = this;

				setImmediate(function() {
					var mutations = self._mutations;
					self._mutations = [];

					self._callback(mutations);
				});
			}
		}

	});

	return jMutationObserver;
});
