/*
 * wizard methods unit tests
 */

(function( $ ) {

module( "wizard: methods", {
	setup: function() {
		$w = $( "#wizard" ).wizard();
	}
});

test( "backward", function() {
	expect( 4 );

	$w.wizard( "select", -1 );

	equal( $w.wizard( "backward" ).wizard( "stepIndex" ), 6, "Backward" );
	equal( $w.wizard( "backward", $.Event( "click" ) ).wizard( "stepIndex" ), 5,
		"Backward, event as first argument" );
	equal( $w.wizard( "backward", 2 ).wizard( "stepIndex" ), 3, "Backward, multiple steps" );
	equal( $w.wizard( "backward", 99 ).wizard( "stepIndex" ), 0,
		"Backward, multiple steps, normalized to first step" );
});

test( "branch", function() {
	expect( 3 );

	equal( $w.wizard( "branch" ).attr( "id" ), "form", "Current branch" );
	equal( $w.wizard( "branch", "branch-1" ).attr( "id" ), "branch-1",
		"Find a specific branch via branch label" );
	equal( $w.wizard( "branch", 0 ).attr( "id" ), "form",
		"Find a specific branch via branch index" );
});

test( "branches", function() {
	expect( 2 );

	equal( $w.wizard( "branches" ).length, 4, "Wizard has 4 branches" );
	equal( $w.wizard( "branches", "branch-1" ).length, 1, "Found 1 branch inside 'branch-1'" );
});

test( "branchesActivated", function() {
	expect( 3 );

	equal( $w.wizard( "branchesActivated" ).length, 1, "One branch has been activated" );
	equal( $w.wizard( "forward" ).wizard( "branchesActivated" ).length, 2,
		"Two branches have been activated" );
	equal( $w.wizard( "select", -1 ).wizard( "branchesActivated" ).length, 4,
		"All branches have been activated" );
});

test( "destroy", function() {
	expect( 2 );

	ok( $w.hasClass( "wizard" ) && $w.data( "kf-wizard" ), "Wizard has been created" );
	ok( !$w.wizard( "destroy" ).hasClass( "wizard" ) && !$w.data( "kf-wizard" ),
		"Wizard has been destroyed" );
});

test( "form", function() {
	expect( 3 );

	equal( $w.wizard( "form" )[0].tagName, "FORM", "#wizard has a form" );
	equal( $( "#wizard2" ).wizard().wizard( "form" )[0].tagName, "FORM", "#wizard2 has a form" );
	equal( $( "#wizard3" ).wizard().wizard( "form" )[0].tagName, "FORM", "#wizard3 has a form" );
});

test( "forward", function() {
	expect( 5 );

	equal( $w.wizard( "forward" ).wizard( "stepIndex" ), 1, "Forward" );
	equal( $w.wizard( "forward", $.Event( "click" ) ).wizard( "stepIndex" ), 2,
		"Forward, event as first argument" );
	equal( $w.wizard( "forward", 2 ).wizard( "stepIndex" ), 4, "Forward, multiple steps" );
	equal( $w.wizard( "forward", 99 ).wizard( "stepIndex" ), 7,
		"Forward, multiple steps, normalized to last step" );
	equal( $w.wizard( "select", 0 )
		.wizard( "forward", 3, false )
		.wizard( "stepsActivated" ).length, 2,
		"Forward, multiple steps, no history" );
});

test( "isValidStep", function() {
	expect( 6 );

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

	ok( $w.wizard( "isValidStepIndex", 0 ) );
	ok( $w.wizard( "isValidStepIndex", 7 ) );
	ok( !$w.wizard( "isValidStepIndex", 8 ), "Step index does not exist in wizard" );
	ok( !$w.wizard( "isValidStepIndex", -1 ), "Negative indexes are invalid" );
	ok( !$w.wizard( "isValidStepIndex", "string" ), "Invalid because index is not a number" );
});

test( "stepCount", function() {
	var $wizard = $( ".wizard" );

	expect( $wizard.length );

	$wizard.each(function() {
		var $this = $( this );

		ok( $this.wizard().wizard( "stepCount" ) > 0,
			"Found steps in wizard '" + $this.attr( "id" ) + "'" );
	});
});

test( "select", function() {
	expect( 7 );

	equal( $w.wizard( "select", 1 ).wizard( "stepIndex" ), 1, "Select step by index" );
	equal( $w.wizard( "select", -1 ).wizard( "stepIndex" ), 7, "Select step with negative index" );
	equal( $w.wizard( "select", "finish" ).wizard( "stepIndex" ), 7, "Select a step by ID" );
	equal( $w.wizard( "select", "branch-1" ).wizard( "stepIndex" ), 1,
		"Select a step by branch ID" );
	equal( $w.wizard( "select", "branch-1", 1 ).wizard( "stepIndex" ), 2,
		"Select a step relative to a branch" );
	equal( $w.wizard( "select", -2, true ).wizard( "stepIndex" ), 0,
		"Select a step relative to the current step" );
	equal( $w.wizard( "select", 2, true, false ).wizard( "stepsActivated" ).length, 2,
		"Select a step without keeping history" );
});

test( "state", function() {
	expect( 4 );

	equal( $w.wizard( "state" ).stepIndex, 0, "Current state" );
	equal( $w.wizard( "state", 1 ).stepIndex, 1, "State for step index 1" );
	equal( $w.wizard( "state", 2 ).stepsActivated.length, 2,
		"State for step index 2, without history" );
	equal( $w.wizard( "state", 2, [ 0, 1, 2 ] ).stepsActivated.length, 3,
		"State for step index 2, with history" );
});

test( "step", function() {
	expect( 15 );

	ok( $w.wizard( "step" ).length, "Find current step" );
	ok( $w.wizard( "step", 1 ).length, "Find a step by index" );
	ok( $w.wizard( "step", -1 ).length, "Find a step by negative index" );
	ok( $w.wizard( "step", "finish" ).length, "Find a step by ID" );
	ok( $w.wizard( "step", $( "#finish" ) ).length, "Find a step by jQuery object" );
	ok( $w.wizard( "step", $( "#finish" )[0] ).length, "Find a step by DOM element" );
	ok( $w.wizard( "step", "branch-1" ).length, "Find a step by branch ID" );
	ok( $w.wizard( "step", $( "#branch-1" ) ).length, "Find a step by branch jQuery object" );
	ok( $w.wizard( "step", $( "#branch-1" )[0] ).length, "Select a step by branch DOM element" );
	ok( $w.wizard( "step", "branch-1", 1 ).length, "Find a step within a branch" );
	ok( $w.wizard( "step", 1, "branch-1" ).length, "Alternative way to find a step within a branch" );

	ok( !$w.wizard( "step", 99 ).length, "Step index is not valid" );
	ok( !$w.wizard( "step", null ).length, "Null is not valid" );
	ok( !$w.wizard( "step", undefined ).length, "Undefined is not valid" );
	ok( !$w.wizard( "step", "doesnotexist" ).length, "ID is not valid" );
});

test( "stepIndex", function() {
	expect( 4 );

	equal( $w.wizard( "stepIndex" ), 0, "Index of current step" );
	equal( $w.wizard( "stepIndex", 1 ), 1, "Index of step 1" );
	equal( $w.wizard( "stepIndex", "branch-1", 1 ), 2,
		"The index of the second step in branch 'branch-1'" );
	equal( $w.wizard( "stepIndex", "branch-1", 1, true ), 1,
		"The index of the second step in branch 'branch-1' relative to the branch" );
});

test( "steps", function() {
	expect( 2 );

	equal( $w.wizard( "steps" ).length, 8, "Get all of the steps in the wizard" );
	equal( $w.wizard( "steps", "branch-1" ).length, 2,
		"Get all of the steps in the 'branch-1' branch" );
});

test( "stepsActivated", function() {
	expect( 3 );

	equal( $w.wizard( "stepsActivated" ).length, 1, "One step has been activated" );
	equal( $w.wizard( "forward" ).wizard( "stepsActivated" ).length, 2,
		"Two steps have been activated" );
	equal( $w.wizard( "select", -1 ).wizard( "stepsActivated" ).length, 8,
		"All steps have been activated" );
});

test( "submit", function() {
	expect( 1 );

	$w.wizard( "form" ).submit(function() {
		ok( true, "Form submission was successful" );
		return false;
	});

	$w.wizard( "submit" );
});

})( jQuery );