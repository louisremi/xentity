(function(window, document, Element, undefined) {

// This adpater isn't required if jQuery is present
if ( window.jQuery ) { return; }

var rdescendant = /^>/,
	matchesSelector = Element.prototype.matchesSelector
		|| Element.prototype.webkitMatchesSelector
		|| Element.prototype.mozMatchesSelector
		|| Element.prototype.msMatchesSelector
		|| Element.prototype.oMatchesSelector,
	classList = !!document.documentElement.classList;

function $( selector, context ) {
	return new $.prototype.init( selector, context );
}

/* $ prototype
 *******************************************************************/

// in the following methods, loops will be inlined for perf
$.prototype = {
	init: function( selector, context ) {
		// init with selector
		if ( ( typeof selector ) == "string" ) {
			selector = exa( selector, context );

		// init with domReady callback
		} else if ( ( typeof selector ) == "function" ) {
			return domReady( selector );
		}
		
		var i = -1,
			l = selector.length;

		// init with selector or nodeList
		if ( l === +l ) {
			while ( ++i < l ) {
				this[i] = selector[i];
			}
			this.length = l;
		
		// init with node
		} else if ( selector.nodeName ) {
			this[0] = selector;
			this.length = 1;
		}

		return this;
	},

	// check if the first element of the collection matches the given selector
	// (doesn't match jQuery behavior exactly)
	is: function( selector ) {
		if ( matchesSelector ) {
			return matchesSelector.call( this[0], selector );
		}

		var nodes = ( elem.parentNode || document ).querySelectorAll(selector),
			i = -1,
			l = nodes.length;
		
		while ( ++i < l ) {
			if ( nodes[i] == elem ) {
				return true;
			}
		}

		return false;
	},

	// check if the first element of the collection has the given className
	hasClass: function( name ) {
		return classList ?
			this[0].classList.has( name ) :
			className( this[0], "has", name );

	},

	// add the className to all elements of the collection
	addClass: function( name ) {
		var i = -1;

		while ( ++i < this.length ) {
			classList ?
				this[i].classList.add( name ) :
				className( this[i], "add", name );
		}

		return this;
	},

	// remove the className from all elements of the collection
	removeClass: function( name ) {
		var i = -1;

		while ( ++i < this.length ) {
			classList ?
				this[i].classList.add( name ) :
				className( this[i], "remove", name );
		}

		return this;
	},

	// toggle the className all elements of the collection, individually
	toggleClass: function( name ) {
		var i = -1;

		while ( ++i < this.length ) {
			classList ?
				this[i].classList.add( name ) :
				className( this[i], "toggle", name );
		}

		return this;
	}
};

/* Utils
 *******************************************************************/

// A very limited version of $.ajax()
$.ajax = function( params ) {
	var xhr = new XMLHttpRequest();

	xhr.open( params.type || "GET", params.url, true );

	xhr.send( params.data || null );

	xhr.onreadystatechange = function( _, isAbort ) {
		if ( isAbort || xhr.readyState !== 4 ) { return; }

		var responses = {};
		if ( xhr.responseXML ) {
			responses.xml = xhr.responseXML;
		}
		if ( xhr.responseText ) {
			responses.text = xhr.responseText;
		}

		params.complete( xhr.status, xhr.statusText, responses, xhr.getAllResponseHeaders() );	
	};
};

// jQuery's version of forEach
$.each = function( obj, iterator ) {
	var i = -1,
		l = obj.length,
		key;

	if ( obj === null ) {
		return;
	}

	if ( l === +l ) {
		while  ( ++i < l ) {
			if ( iterator.call( obj[i], i, obj[i] ) === false ) {
				return;
			}
		}

	} else {
		for ( key in obj ) {
			if ( iterator.call( obj[key], key, obj[key] ) === false ) {
				return;
			}
		}
	}
};

// Extend a given object with all the properties in passed-in object(s).
$.extend = function( obj ) {
	$.each(slice.call( arguments, 1 ), function() {
		for ( var prop in this ) {
			obj[ prop ] = this[ prop ];
		}
	});

	return obj;
};

$.support = {};

// enhanced querySelecorAll, understand queries starting with ">"
function exa( selector, context ) {
	var parent,
		needTempId,
		result;

	if ( !context ) {
		context = document;
	}

	// if the selector starts with ">",
	if ( rdescendant.test( selector ) ) {
		// execute the search from the parent node
		parent = context.parentNode;

		// prefix the selector
		selector = ( parent ?
			"#" + (
				// with the @id of the context
				context.id ||
				// or a temporary id
				( context.id = needTempId = "t" + ( Math.random() * 1E9 | 0 ) )
			) :
			// or "html" if no parent
			"html"
		) + selector;
	}

	result = ( parent || context ).querySelecorAll( selector );

	if ( needTempId ) {
		context.id = "";
	}

	return result;
}

// execute the callback when the DOM is ready
function domReady( callback ) {
	if ( document.readyState == "complete" ) {
		return callback();
	}

	var proxy = function() {
			if ( document.readyState == "complete" ) {
				document[ listener.remove ]( listener.prefix + "readystatechange", proxy );
				callback();
			}
		},
		// this object is defined in core.js
		listener = $.support.listener;

	document[ listener.add ]( listener.prefix + "readystatechange", proxy, false );
}

// className manipulation
function className( elem, verb, name ) {
	var originalClassName = elem.className,
		replacedClassName = originalClassName.replace( RegExp( " *\\b" + name + "\\b", "g" ), "" );

	switch ( verb ) {
		case "has":
			return replacedClassName != originalClassName;
		case "add":
			if ( replacedClassName == originalClassName ) {
				elem.className = replacedClassName + " " + name;
			}
			break;
		case "remove":
			if ( replacedClassName != originalClassName ) {
				elem.className = replacedClassName;
			}
			break;
		case "toggle":
			elem.className = replacedClassName == originalClassName ?
				replacedClassName + " " + name :
				replacedClassName;
	}
}

window.jQuery = $;

})(window, document, Element);