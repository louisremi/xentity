(function($, window, document, undefined) {

var rcomments = /\/\*[^\uffff]*?\*\//gm,
	rxcomponent = /\s([^{}]+)\{[^}]*-x-component.*?["'](.*?)["']/gm,
	rclean = /[ \r\n\t]+/gm,
	rseparator = / *,/,
	listener = $.support.listener = "addEventListener" in window ? {
		add: "addEventListener",
		remove: "removeEventListener",
		prefix: ""
	} : {
		add: "attachEvent",
		remove: "detachEvent",
		prefix: "on"
	},
	support = {
		currentStyle: !!document.documentElement.currentStyle
	},
	head = document.querySelector("head");

/* Public API
 *****************************************************************************/

function xentity( nodes ) {
	return new xentity.prototype._init( nodes );
}

xentity.component = function( name, definition ) {
	xentity.components[ name ] = definition;

	definition._components = {};
	definition._components[ name ] = 1;

	// Inherit from required components
	$.each( definition.requires, function( name ) {
		// inherit component names
		$.extend( definition._components, xentity.components[ name ]._components );

		// inherit oninsert
		if ( !definition.oninsert ) {
			definition.oninsert = xentity.components[ name ].oninsert;
		}
	});

	// if the component was already referenced in CSS and handles insert
	if ( definition.oninsert && xentity.undef[ name ] ) {
		$.each( xentity.undef[ name ], function( selector ) {
			xentity.watched[ selector ] = 1;
		});
	}
};

xentity.components = {};
xentity.watched = {};
xentity.undef = {};

/* Prototype
 *****************************************************************************/

xentity.prototype = {
	_init: function( nodes ) {

	},

	is: function( name ) {

	}
};

/* Internal Utils
 *****************************************************************************/

// mutation handler for IE9+ and good browsers
xentity._onmutation = function() {
	xentity._checkStylesheets( xentity._checkEntities );

	xentity._mutationPending = false;
};

// throttles calls to ._onmutation(), used by fallbacks
xentity.__onmutation = function() {
	if ( xentity._mutationPending ) { return; }

	xentity._mutationPending = true;
	setTimeout( xentity._onmutation, 16 );
};

// search for -x-component properties in stylesheets
// and translate it to a hijacked cascading property
xentity._checkStylesheets = function( callback ) {
	var _this = this,
		stylesheets = document.querySelectorAll("style:not([xen-checked]), link:not([xen-checked])"),
		i = stylesheets.length,
		j = i,
		stylesheet,
		rules = [];

	if ( !i ) {
		return callback();
	}

	while ( i-- ) {
		stylesheet = stylesheets[i];

		if ( stylesheet.nodeName == "STYLE" ) {
			parseCss( stylesheet.innerHTML, i );

		} else {
			getCss( stylesheet.href, i );
		}

		// mark the stylesheeet as checked
		stylesheet.setAttribute( "xen-checked", true );
	}

	function getCss( url, i ) {
		$.ajax({
			url: url,
			complete: function( a,b,c ) {
				if ( a != 404 ) {
					parseCss( c.text, i );
				}
			}
		});
	}

	function parseCss( css, i ) {
		rules[i]  = _this._parseCss( css );

		// build a custom <style> when all stylesheets have been parsed
		if ( !--j ) {
			// reorganize rules
			rules = [].concat.apply( [], rules );

			var style,
				k = rules.length,
				innerHTML = [];

			while ( k-- ) {
				innerHTML.unshift( rules[k][0] + "{quotes:'\"''\"''xcomponent:" + rules[k][1] + "'''}" );
			}

			if ( innerHTML ) {
				style = document.createElement("style");
				style.setAttribute( "xen-inited", true );
				style.innerHTML = innerHTML.join("");
				head.appendChild( style );
			}

			callback();
		}
	}
};

// this is the function that actually parses the fetched css
xentity._parseCss = function( css ) {
	var match,
		rules = [],
		style = document.createElement("style");

	// strip comments
	css = css.replace( rcomments, "" );

	while ( ( match = rxcomponent.exec( css ) ) ) {
		var selector = match[1].replace( rclean, " " ),
			components = match[2].split(" "),
			i = components.length,
			watched;

		rules.push( [ selector, match[2] ] );

		// let's determine if the selector need to be watched
		while ( i-- ) {
			// The definition of the component doesn't exit yet
			if ( !xentity.components[ components[i] ] ) {
				xentity.undef[ components[i] ] ?
					xentity.undef[ components[i] ].push( selector ) :
					[ selector ];
			
			// The definition exists and we know it handles insert
			} else if ( xentity.components[ components[i] ].oninsert ) {
				xentity.watched[ selector ] = watched = 1;
				break;
			}
		}
	}

	return rules;
};

xentity._checkEntities = function() {
	var selector = Object.keys( xentity.watched ).join().replace( rseparator, ":not([xen-inited])," );

	if ( selector ) {

	}
};

/* Init
 *****************************************************************************/

// prevent quotes to be inherited
head.insertAdjacentHTML( "afterbegin", "<style xen-checked>*{quotes:'\"''\"'}</style>" );

$(function() {
	xentity._onmutation();

	// Setup global Mutation Observer
	if ( "MutationObserver" in window ) {
		( new MutationObserver( xentity._onmutation ) )
			.observe( document, {
				childList: true,
				subtree: true
			});

	} else if ( document.createEvent && ( document.createEvent("MutationEvent") ).initMutationEvent ) {
		document.addEventListener("DOMNodeInsertedIntoDocument", xentity.__onmutation );
	}
});

window.xentity = xentity;

})(jQuery, window, document);