/*
 * wizard events unit tests
 */

(function( $ ) {

var callback = function( e ) {
	ok( true, e.type + " triggered" );
};

module( "wizard: events" );

test( "backward", function() {
	expect( 2 );

	$( "#wizard" )
		.bind( "wizardbeforebackward", callback )
		.bind( "wizardafterbackward", callback )
		.wizard()
		.wizard( "forward" )
		.wizard( "backward" )
		// Can't go back on first step
		.wizard( "backward" );
});

test( "cancel backward", function() {
	expect( 0 );

	$( "#wizard" )
		.bind( "wizardafterbackward", callback )
		.wizard({
			beforeBackward: function() {
				return false;
			}
		})
		.wizard( "forward" )
		.wizard( "backward" );
});

test( "destroy", function() {
	expect( 2 );

	$( "#wizard" )
		.bind( "wizardbeforedestroy", callback )
		.bind( "wizardafterdestroy", callback )
		.wizard()
		.wizard( "destroy" );
});

test( "cancel destroy", function() {
	expect( 0 );

	$( "#wizard" )
		.bind( "wizardafterdestroy", callback )
		.wizard({
			beforeDestroy: function() {
				return false;
			}
		})
		.wizard( "destroy" );
});

test( "forward", function() {
	expect( 4 );

	$( "#wizard" )
		.bind( "wizardbeforeforward", callback )
		.bind( "wizardafterforward", callback )
		.wizard()
		.wizard( "forward" )
		.wizard( "select", -1 )
		// Can't go forward on last step
		.wizard( "forward" );
});

test( "cancel forward", function() {
	expect( 0 );

	$( "#wizard" )
		.bind( "wizardafterforward", callback )
		.wizard({
			beforeForward: function() {
				return false;
			}
		})
		.wizard( "forward" );
});

test( "select", function() {
	expect( 10 );

	$( "#wizard" )
		.bind( "wizardbeforeselect", callback )
		.bind( "wizardafterselect", callback )
		.wizard()
		.wizard( "forward" )
		.wizard( "select", 3 )
		.wizard( "select", -1 )
		.wizard( "select", -2, true )
		.wizard( "select", null )
		.wizard( "select", "asdf" )
		.wizard( "backward" );
});

})( jQuery );