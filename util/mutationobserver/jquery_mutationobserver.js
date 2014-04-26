// # can/util/mutationobserver/jquery_mutationobserver.js
//
// This implements `can.MutationObserver` for older browers that do not support
// native MutationObservers or Mutation Events.

steal("jquery", "can/util/setimmediate", "can/control", function($, setImmediate) {

	// We only want to run this code if the browser supports neither MutationObserver
	// or Mutation Event.
	/*if(window.MutationObserver || window.MutationEvent) {
		return;
	}*/

	// Handles insertions, like `append`, `insertBefore`, etc.
	var oldDomManip = $.fn.domManip;
	$.fn.domManip = function(args, callback) {
		var addedNodes = [];

		var ret = oldDomManip.call(this, args, function(elem) {
			addedNodes.push(elem);

			return callback.apply(this, arguments);
		});

		$.each(addedNodes, function(i, element) {
			$(element).trigger("canChildList", {
				type: "childList",
				addedNodes: addedNodes
			});
		});

		return ret;
	};

	// Handles removes like `remove` and `empty`
	var oldClean = $.cleanData;
	$.cleanData = function (elems) {
		$.each(elems, function(i, element) {
			$(element).trigger("canChildList", {
				type: "childList",
				removedNodes: elems
			});
		});

		oldClean(elems);
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

	var EventListener = can.Control.extend({

		handleAttributes: function(el, jEv, event) {
			var element = this.element[0];
			var options = this.options.observerOptions;
			var observer = this.options.observer;

			// If we're not observing subtrees, then make sure that the target
			// element is the element of this observation.
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
		},

		handleChildList: function(el, jEv, event) {
			var element = this.element[0];
			var observer = this.options.observer;
			var options = this.options.observerOptions;

			// If we are not observing `subtree` then the `event.target` must be
			// a direct child of `element`.
			if(!options.subtree && jEv.target.parentNode !== element) {
				return;
			}

			event.target = element;
			observer._queue(event);
		}
		
	});

	function jMutationObserver(callback) {
		this._callback = callback;
		this._mutations = [];
		this._bound = [];
	}

	can.extend(jMutationObserver.prototype, {

		/**
		 * @method observe
		 * @hide
		 * @param {HTMLElement} element The element to observe
		 * @param {Object} options Init options for this observation
		 */
		observe: function(element, options) {
			// Make sure we are not already observing this element. If so, then ignore
			// this function call so that we don't callback multiple times for the same element.
			if(this._observing(element)) {
				return;
			}

			var control = new EventListener(element, {
				observer: this,
				observerOptions: options
			});

			// For the `attributes` type of observation.
			if(options.attributes) {
				control.on("canAttribute", "handleAttributes");
			}

			// For the `childList` type of observation.
			if(options.childList) {
				control.on("canChildList", "handleChildList");
			}

			this._bound.push(control);
		},

		disconnect: function() {
			var bound = this._bound;
			this._bound = [];

			can.each(bound, function(control) {
				control.destroy();
			});
		},

		_observing: function(element) {
			var bound = this._bound;

			for(var i = 0, len = bound.length; i < len; i++) {
				if(bound[i].element[0] === element) {
					return true;
				}
			}

			return false;
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
