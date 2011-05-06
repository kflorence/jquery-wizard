/*
 * wizard events unit tests
 */

(function( $ ) {

module( "wizard: events" );

test( "forward", function() {
	expect( 2 );

	var $wizard = $( "#wizard" ).wizard({
		afterForward: function() {
			ok( true, "afterForward event triggered" );
		},
		beforeForward: function() {
			ok( true, "beforeForward event triggered" );
		}
	}).wizard( "forward" );

	// Not called if forward invoked on last step
	$wizard.wizard( "select", $wizard.wizard( "stepCount" ) - 1 )
		.wizard( "forward" );
});

test( "backward", function() {
	expect( 2 );

	var $wizard = $( "#wizard" ).wizard({
		afterBackward: function() {
			ok( true, "afterBackward event triggered" );
		},
		beforeBackward: function() {
			ok( true, "beforeBackward event triggered" );
		}
	}).wizard( "forward" ).wizard( "backward" );

	// Not called if backward invoked on first step
	$wizard.wizard( "select", 0 ).wizard( "backward" );
});

})( jQuery );
