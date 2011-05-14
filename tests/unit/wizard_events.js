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
			beforeBackward: function( event, ui ) {
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
			beforeForward: function( event, ui ) {
				if ( cancel ) {
					return cancel = false;
				}
			}
		})
		// This one is cancelled
		.wizard( "forward" )
		.wizard( "forward" )
		// Go to the last step
		.wizard( "select", $wizard.wizard( "stepCount" ) - 1 )
		// Can't go forward on last step
		.wizard( "forward" );
});

/*
test( "beforeForward", function() {
	expect( 4 );

	var $wizard = $( "#wizard" );

	$wizard
		.bind( "wizardbeforeforward", callback )
		.wizard({
			beforeForward: function() {
			console.log($wizard.wizard("index"));
				return $wizard.wizard( "index" ) < 0;
			}
		})
		.wizard( "select", $wizard.wizard( "stepCount" ) - 1 )
		// Not called here because we are on the last step
		.wizard( "forward" );
});

test( "afterForward", function() {
	expect( 4 );

	var $wizard = $( "#wizard" );

	$wizard
		.bind( "wizardafterforward", callback )
		.wizard({
			afterForward: callback
		})
		.wizard( "select", $wizard.wizard( "stepCount" ) - 1 )
		// Not called here because we are on the last step
		.wizard( "forward" );
});
*/
})( jQuery );
