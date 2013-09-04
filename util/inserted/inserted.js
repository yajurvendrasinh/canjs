steal('can/util/can.js',function (can) {
	// Given a list of elements, check if they are in the dom, if they 
	// are in the dom, trigger inserted on them.
	can.inserted = function(elems){
		var inDocument = false,
			checked = false,
			children;
		for ( var i = 0, elem; (elem = elems[i]) !== undefined; i++ ) {
			if( !inDocument ) {
				if( elem.getElementsByTagName ){
					if( can.has( can.$(document) , elem ).length ) {
						inDocument = true;
					} else {
						return;
					}
				} else {
					continue;
				}
			}
			
			if(inDocument && elem.getElementsByTagName){
				can.trigger(elem,"inserted",[],false);
				children = can.makeArray( elem.getElementsByTagName("*") );
				for ( var j = 0, child; (child = children[j]) !== undefined; j++ ) {
					// Trigger the destroyed event
					can.trigger(child,"inserted",[],false);
				}
			}
		}
	}
	

	var nodeListToFragment = function(nodeList){
		var frag = document.createDocumentFragment();
		for(var i = 0; i < nodeList.length; i++){
			frag.appendChild(nodeList[i]);
		}
		return frag;
	}
	
	can.appendChild = function(el, child){

		if(child.nodeType === 11){
			var children = can.makeArray(child.childNodes);
		} else {
			var children = [child]
		}

		var innerHtml = el.innerHTML,
			frag      = nodeListToFragment(children);

		if(innerHtml && innerHtml.indexOf('<!--select:') !== -1){
			var childNodes = el.childNodes;
			for(var i = 0; i < childNodes.length; i++){
				if(childNodes[i].nodeType === 8 && childNodes[i].nodeValue.substring(0,7) === 'select:'){
					el.insertBefore(nodeListToFragment(frag.querySelectorAll(childNodes[i].nodeValue.substring(7))), childNodes[i])
				}
			}
		}

		el.appendChild(frag);
		can.inserted(children)
	}
	can.insertBefore = function(el, child, ref){
		if(child.nodeType === 11){
			var children = can.makeArray(child.childNodes);
		} else {
			var children = [child];
		}

		var frag = nodeListToFragment(children),
			innerHtml = el.innerHTML;

		if(innerHtml && innerHtml.indexOf('<!--select:') !== -1){
			var childNodes = el.childNodes;
			for(var i = 0; i < childNodes.length; i++){
				if(childNodes[i].nodeType === 8 && childNodes[i].nodeValue.substring(0,7) === 'select:'){
					el.insertBefore(nodeListToFragment(frag.querySelectorAll(childNodes[i].nodeValue.substring(7))), childNodes[i])
				}
			}
		}

		el.insertBefore(frag, ref);
		can.inserted(children)
	}
	
});