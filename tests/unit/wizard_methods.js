/*
 * wizard methods unit tests
 */

(function( $ ) {

module( "wizard: methods" );

test( "backward", function() {
	expect( 4 );

	var $w = $( "#wizard" ).wizard().wizard( "select", -1 );

	$w.wizard( "backward" );

	equals( $w.wizard( "stepIndex" ), 6, "Backward" );

	$w.wizard( "backward", $.Event( "click" ) );

	equals( $w.wizard( "stepIndex" ), 5, "Backward, event as first argument" );

	$w.wizard( "backward", 2 );

	equals( $w.wizard( "stepIndex" ), 3, "Backward, multiple steps" );

	$w.wizard( "backward", 99 );

	equals( $w.wizard( "stepIndex" ), 0, "Backward, multiple steps, normalized to first step" );
});

test( "branch", function() {
	expect( 3 );

	var $w = $( "#wizard" ).wizard();

	equals( $w.wizard( "branch" ).attr( "id" ), "form", "Current branch" );

	equals( $w.wizard( "branch", "branch-1" ).attr( "id" ), "branch-1",
		"Find a specific branch via branch label" );

	equals( $w.wizard( "branch", 0 ).attr( "id" ), "form",
		"Find a specific branch via branch index" );
});

test( "branches", function() {
	expect( 2 );

	var $w = $( "#wizard" ).wizard();

	equals( $w.wizard( "branches" ).length, 4, "Wizard has 4 branches" );
	equals( $w.wizard( "branches", "branch-1" ).length, 1, "Found 1 branch inside 'branch-1'" );
});

test( "branchesActivated", function() {
	expect( 2 );

	var $w = $( "#wizard" ).wizard();

	equals( $w.wizard( "branchesActivated" ).length, 1, "One branch has been activated" );

	$w.wizard( "forward" );

	equals( $w.wizard( "branchesActivated" ).length, 2, "Two branches have been activated" );
});

test( "destroy", function() {
	expect( 2 );

	var $w = $( "#wizard" ).wizard();

	ok( $w.hasClass( "ui-wizard" ) && $w.data( "wizard" ), "Wizard has been created" );

	$w.wizard( "destroy" );

	ok( !$w.hasClass( "ui-wizard" ) && !$w.data( "wizard" ), "Wizard has been destroyed" );
});

test( "form", function() {
	expect( 1 );

	equals( $( "#wizard" ).wizard().wizard( "form" )[0].tagName, "FORM",
		"Wizard has form" );
});

test( "forward", function() {
	expect( 5 );

	var $w = $( "#wizard" ).wizard();

	$w.wizard( "forward" );

	equals( $w.wizard( "stepIndex" ), 1, "Forward" );

	$w.wizard( "forward", $.Event( "click" ) );

	equals( $w.wizard( "stepIndex" ), 2, "Forward, event as first argument" );

	$w.wizard( "forward", 2 );

	equals( $w.wizard( "stepIndex" ), 4, "Forward, multiple steps" );

	$w.wizard( "forward", 99 );

	equals( $w.wizard( "stepIndex" ), 7, "Forward, multiple steps, normalized to last step" );

	$w.wizard( "select", 0 ).wizard( "forward", 3, false );

	equals( $w.wizard( "stepsActivated" ).length, 2, "Forward, multiple steps, no history" );
});

test( "isValidStep", function() {
	expect( 6 );

	var $w = $( "#wizard" ).wizard();

	ok( $w.wizard( "isValidStep", 0 ), "Validate step by index" );
	ok( $w.wizard( "isValidStep", "finish" ), "Validate step by ID" );
	ok( $w.wizard( "isValidStep", $( "#finish" ) ), "Validate step by jQuery object" );
	ok( !$w.wizard( "isValidStep", $( "#wizard2 .step" ).eq( 0 ) ),
		"Invalidates a step that is not in the wizard" );
	ok( !$w.wizard( "isValidStep", 8 ), "Invalidates a faulty step index" );
	ok( $w.wizard( "isValidStep", -2 ), "Negative step indexes may be used" );
});

test( "isValidStepIndex", function() {
	expect( 5 );

	var $w = $( "#wizard" ).wizard();

	ok( $w.wizard( "isValidStepIndex", 0 ) );
	ok( $w.wizard( "isValidStepIndex", 7 ) );
	ok( !$w.wizard( "isValidStepIndex", 8 ), "Step index does not exist in wizard" );
	ok( !$w.wizard( "isValidStepIndex", -1 ), "Negative indexes are invalid" );
	ok( !$w.wizard( "isValidStepIndex", "string" ), "Invalid because index is not a number" );
});

test( "length", function() {
	expect( 3 );

	equals( $( "#wizard" ).wizard().wizard( "length" ), 8, "#wizard contains 8 steps" );
	equals( $( "#wizard2" ).wizard().wizard( "length" ), 2, "#wizard2 contains 2 steps" );
	equals( $( "#wizard3" ).wizard().wizard( "length" ), 1, "#wizard3 contains 1 step" );
});

test( "select", function() {
	

	var $w = $( "#wizard" ).wizard();

	equals( $w.wizard( "select", 1 ).wizard( "stepIndex" ), 1, "Selected step 1" );
	equals( $w.wizard( "select", -1 ).wizard( "stepIndex" ), 7, "Select the last step" );
	equals( $w.wizard( "select", "branch-1" ).wizard( "stepIndex" ), 1,
		"Select the first step in a branch" );

});
/*
test( "", function() {
});

test( "", function() {
});

test( "", function() {
});
*/
})( jQuery );
