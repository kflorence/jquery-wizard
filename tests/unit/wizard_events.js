/*
 * wizard events unit tests
 */

(function( $ ) {

var callback = function( e ) {
	ok( true, e.type + " triggered" );
};

module( "wizard: events" );

test( "backward", function() {
	expect( 3 );

	var cancel = true;

	$( "#wizard" )
		.bind( "wizardbeforebackward", callback )
		.bind( "wizardafterbackward", callback )
		.wizard({
			beforeBackward: function( event, state ) {
				if ( cancel ) {
					return cancel = false;
				}
			}
		})
		.wizard( "forward" )
		// This one is cancelled
		.wizard( "backward" )
		.wizard( "backward" )
		// Can't go back on first step
		.wizard( "backward" );
});

test( "forward", function() {
	expect( 3 );

	var cancel = true, $wizard = $( "#wizard" );

	$wizard
		.bind( "wizardbeforeforward", callback )
		.bind( "wizardafterforward", callback )
		.wizard({
			beforeForward: function( event, state ) {
				if ( cancel ) {
					return cancel = false;
				}
			}
		})
		// This one is cancelled
		.wizard( "forward" )
		// Go to the last step
		.wizard( "select", $wizard.wizard( "stepCount" ) - 1 )
		// Can't go forward on last step
		.wizard( "forward" );
});

})( jQuery );
