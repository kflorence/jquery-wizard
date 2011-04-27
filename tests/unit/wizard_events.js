/*
 * wizard events unit tests
 */

(function( $ ) {

module( "wizard: events" );

test( "forward", function() {
	expect( 1 );

	var $wizard = $( "#wizard" ).wizard({
		forward: function() {
			ok( true, "forward event triggered" );
		}
	}).wizard( "forward" );

	// Not called if forward invoked on last step
	$wizard.wizard( "select", $wizard.wizard( "stepCount" ) - 1 )
		.wizard( "forward" );
});

test( "backward", function() {
	expect( 1 );

	var $wizard = $( "#wizard" ).wizard({
		backward: function() {
			ok( true, "backward event triggered" );
		}
	}).wizard( "forward" ).wizard( "backward" );

	// Not called if backward invoked on first step
	$wizard.wizard( "select", 0 ).wizard( "backward" );
});

})( jQuery );
