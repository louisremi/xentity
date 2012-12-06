(function($, window, document, undefined) {
"use strict";

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
	return new xentity.prototype.init( nodes );
}

xentity.component = function( name, definition ) {
	xentity.components[ name ] = definition;

	definition._components = {};
	definition._components[ name ] = 1;

	// Inherit from required components
	$.each( definition.requires || [], function( name ) {
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
	init: function( nodes ) {
		$.prototype.init.apply( this, arguments );
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
		stylesheets = document.querySelectorAll("style:not([xen-checked]), link[rel=stylesheet]:not([xen-checked])"),
		i = stylesheets.length,
		j = i,
		stylesheet,
		rules = [];

	if ( !i ) {
		return callback();
	}

	while ( i-- ) {
		stylesheet = stylesheets[i];

		// mark the stylesheeet as checked
		// (this should be done first to prevent infinit loops when errors are thrown)
		stylesheet.setAttribute( "xen-checked", true );

		if ( stylesheet.nodeName == "STYLE" ) {
			parseCss( stylesheet.innerHTML, i );

		} else {
			getCss( stylesheet.href, i );
		}
	}

	function getCss( url, i ) {
		$.ajax({
			url: url,
			complete: function( a,b,c ) {
				parseCss( c.text, i, a );
			}
		});
	}

	function parseCss( css, i, status ) {
		var match,
			style,
			k,
			innerHTML = [],
			_rules = [],
			selector,
			components,
			watched;

		if ( status != 404 ) {
			// strip comments
			css = css.replace( rcomments, "" );

			while ( ( match = rxcomponent.exec( css ) ) ) {
				selector = match[1].replace( rclean, " " );
				components = match[2].split(" ");
				k = components.length;

				_rules.push( [ selector, match[2] ] );

				// let's determine if the selector need to be watched
				while ( k-- ) {
					// The definition of the component doesn't exit yet
					if ( !xentity.components[ components[k] ] ) {
						xentity.undef[ components[k] ] ?
							xentity.undef[ components[k] ].push( selector ) :
							[ selector ];
					
					// The definition exists and we know it handles insert
					} else if ( xentity.components[ components[k] ].oninsert ) {
						xentity.watched[ selector ] = watched = 1;
						break;
					}
				}
			}

			rules[i]  = _rules;
		}
		

		// build a custom <style> when all stylesheets have been parsed
		if ( !--j ) {
			// reorganize rules
			rules = [].concat.apply( [], rules );

			while ( k-- ) {
				innerHTML.unshift( rules[k][0] + "{quotes:'\"''\"''xcomponent:" + rules[k][1] + "'''}" );
			}

			if ( innerHTML.length ) {
				style = document.createElement("style");
				style.setAttribute( "xen-checked", "" );
				style.innerHTML = innerHTML.join("");
				head.appendChild( style );
			}

			callback();
		}
	}
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