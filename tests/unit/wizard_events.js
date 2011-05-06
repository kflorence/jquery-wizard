/*
 * wizard events unit tests
 */

(function( $ ) {

module( "wizard: events" );

test( "forward", function() {
	expect( 4 );

	// Called on initialization
	var $wizard = $( "#wizard" ).wizard({
		afterForward: function() {
			ok( true, "afterForward event triggered" );
		},
		beforeForward: function() {
			ok( true, "beforeForward event triggered" );
		}
	});

	// Called on selection but not if invoked on last step
	$wizard.wizard( "select", $wizard.wizard( "stepCount" ) - 1 )
		.wizard( "forward" );
});

test( "backward", function() {
	expect( 2 );

	// Not called on initialization
	var $wizard = $( "#wizard" ).wizard({
		afterBackward: function() {
			ok( true, "afterBackward event triggered" );
		},
		beforeBackward: function() {
			ok( true, "beforeBackward event triggered" );
		}
	});

	// Called when moving backward (after moving forward)
	// but not if invoked on first step
	$wizard.wizard( "forward" ).wizard( "backward" ).wizard( "backward" );
});

})( jQuery );
