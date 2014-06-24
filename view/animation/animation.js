// #can/view/animations/animate.js
//
// This file defines the can-animation attributes for
// animating elements on certain events. These are usable
// in any mustache template, but are documented primarily
// for use within can.Component
steal("can/util", "can/view/mustache", function (can) {

/**
 * @function performAnimation
 * 
 * Performs a jQuery-style animation.
 *
 * @param {Object} properties An object of CSS styles to animate toward
 * @param {Object} options An object of animation options
 * @return {Promise} the animation promise
 */
var performAnimation = function(properties, options){

	// the first argument can be a nested object of properties and options
	var props = properties.properties || properties;
	var ops = properties.options || options;
};

/** 
 * @function setProperties
 *
 * Creates or updates animation properties for an element
 * 
 * @param {HTMLElement} el
 * @param {Object} properties An object of animation properties to set
 */
var setProperties = function(el, properties){

};

/**
 * @function getProperties
 * 
 * Gets all animation properties specified for an element
 * 
 * @param {HTMLElement} el
 * @return {Object} an object of animation properties
 */
var getProperties = function(el){

};

/**
 * @function animate
 * 
 * Animate a specified element
 * 
 * @param {HTMLElement} el
 * @returns {Promise} the animation promise
 */
 var animate = (function(){
 	var defaults = {
 		properties: {
 			display: 'block'
 		},
 		options: {
	 		duration: 400,
	 		easing: 'swing',
	 		queue: true
	 	}
 	};

 	return function (el) {
 		var props = defaults;
 		can.extend(props, 
 			getProperties(el));

 		animate(props);
 	};
 })();


// ## can-aninimation
// 
// ### Usage
// 
//    <div can-animation="{ANIMATIONKEY}"></div>
//    
// Animationkey should either specify:
//  * A set of CSS properties to animate toward
//  * An jQuery `animate` object
//  
//  This can be used to specify all animation options in a
//  single object instead of specifying individual attributes.
//  It also exposes certain options in jQuery's `animate` function
//  not exposed as a can-attribute.
can.view.attr('can-animation', function(el, data){
	// Get attribute and data at attribute
	// removeCurly should be moved from can/view/bindings to a reusable place
	var attr = removeCurly(el.getAttribute('can-animation')),
			properties = data.scope.attr(attr);

	setProperties(el, properties);

});

// ## can-animation-duration
// 
// ### Usage
// 
//    <div can-animation-duration="slow" can-animation="{ANIMATIONKEY}"></div>
//    
// Specify the duration of the animation as:
//  * A string
//    * slow: 600ms
//    * fast: 200ms
//  * A number, specifying duration in milliseconds
//  
//  If not specified, the duration will be 400ms.
can.view.attr('can-animation-duration', function(el, data){
	var attr = removeCurly(el.getAttribute('can-animation')),
			properties = data.scope.attr(attr);

	setProperties(el, {duration: value})
});

//  ## can-animation-easing
//  
//  ### Usage
//  
//		<div can-animation-easing="linear" can-slide-down="slow"></div>
//		<div can-animation-easing="{easingProperty}"></div>
//  
//  Specify the duration of the animation as:
//  * A string
//  	* linear or swing are default available options
//  * An object
//  	* A map of the CSS animation properties with specified easing for each
can.view.attr('can-animation-easing', funciton(el, data){

});

// ## can-animation-WHEN
// 
// ### Usage
// 
//    <div can-animation-inserted="{animationkey}"></div>
//    <div can-animation-removed="{animationkey}"></div>
//    <div can-animation-when="{truthyProperty}"></div>
//    <div can-animation-when="{scope} property"></div>
//    <ul can-animation-when="li click"></ul>
//    
// Specify when the animation should take place.
// 
// #### can-animation-inserted
// 
//    The animation will be performed when the element is inserted into
//    the document. By default, the element will be visible when
//    the animation concludes.
can.view.attr('can-animation-inserted', function(el, data){

});
// #### can-animation-removed
// 
//    The animation will be performed when the element is removed from
//    the document. At the end of the animation, the element
//    will be removed (and no longer displayed).
can.view.attr('can-animation-removed', function(el, data){

});
// #### can-animation-when
// 
//    The animation will be performed based on a scope property or event.
//    The option passed to the attribute is either a string or a scope property.
//    
//    * String
//      * The animation will be performed when the specified event is triggered
//    * Scope Property
//      * The animation will be performed when the specified scope property is truthy
//      
//    If using a scope property, by default the animation will run each time the property
//    changes from a falsy value to a truthy value. To change the property to falsy when
//    the animation completes, use can-animation-complete.
can.view.attr('can-animation-when', function(el, data){
	var attr = removeCurly(el.getAttribute('can-animation-when')),
			value = data.scope.attr(attr);

	if(typeof value === "string"){
		can.bind(value, animate(el));
	}else{
		// Bind to changes on the scope property, then
		// animate when it is truthy
	}
});


// ## can-animation-style
// 
// ### Usage
// 
//    <div can-animation-style="color: green" can-animation-inserted></div>
//    
// Instead of specifying an object of properties in `ANIMATIONKEY`, 
// `can-animation-style` specifies CSS properties to animate toward.
can.view.attr('can-animation-style', function(el, data){

});

// ## can-animation-start
// 
// ### Usage
// 
//    <div can-animation-start="scopeMethod" can-animation="{ANIMATIONKEY}"></div>
//    
// Specify a method to call when the animation starts.
can.view.attr('can-animation-start', function(el, data){

});

// ## can-animation-complete
// 
// ### Usage
// 
//    <div can-animation-complete="scopeMethod" can-animation="{ANIMATIONKEY}"></div>
//    
// Specify a method to call when the animation completes.
can.view.attr('can-animation-complete', function(el, data){

});

// Predefined Animations

// ## can-fade-in
// 
// ### Usage
// 
//    <div can-fade-in="slow"></div>
//    
// Perform a fade in animation, at the end of which the element will be visible.
// By default, this will be performed on insertion.
// 
// Optionally, specify a duration.
can.view.attr('can-fade-in', function(el, data){

});

// ## can-fade-out
// 
// ### Usage
// 
//    <div can-fade-out="fast"></div>
//    
// Perform a fade out animation, at the end of which the element will be hidden.
// By default, this will be performed on removal.
// 
// Optionally, specify a duration.
can.view.attr('can-fade-out', function(el, data){

});

// ## can-fade-toggle
// 
// ### Usage
// 
//    <div can-fade-toggle="fast" can-animation-when="{property}"></div>
//    
// Perform a fade in if hidden or fade out if visible. Requires use of can-animation-when.
can.view.attr('can-fade-toggle', function(el, data){

});

// ## can-slide-down
// 
// ### Usage
// 
//    <div can-slide-down="slow"></div>
//    
// Perform a slide down animation, at the end of which the element will be visible.
// By default, this will be performed on insertion.
can.view.attr('can-slide-down', function(el, data){

});

// ## can-slide-up
// 
// ### Usage
// 
//    <div can-slide-up="fast"></div>
//    
// Perform a slide up animation, at the end of which the element will be hidden.
// By default, this will be performed on removal.
can.view.attr('can-slide-up', function(el, data){

});

// ## can-slide-toggle
// 
// ### Usage
// 
//    <div can-slide-toggle="fast" can-animation-when="{slideChange}"></div>
//    
// Perform a slide in if hidden or slide up if isible. Requires use of can-animation-when.
can.view.attr('can-slide-toggle', function(el, data){

});
