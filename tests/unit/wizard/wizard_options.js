/*
 * wizard options unit tests
 */

(function( $ ) {

module( "wizard: options", {
	setup: function() {
		$w = $( "#wizard" );
		$w2 = $( "#wizard2" );
	}
});

// TODO make tests for animations

test( "{ backward: string }", function() {
	expect( 2 );

	equals( $w.wizard().data( "wizard" ).elements.backward.length, 1 );
	equals( $w2.wizard({
			backward: ".previous"
		}).data( "wizard" ).elements.backward.length, 1 );
});

test( "{ branches: string }", function() {
	expect( 2 );

	equals( $w.wizard().data( "wizard" ).elements.branches.length, 4 );
	equals( $w2.wizard({
			branches: ".wizardBranch"
		}).data( "wizard" ).elements.branches.length, 1 );
});

test( "{ enableSubmit: boolean }", function() {
	expect( 2 );

	ok( $w.wizard().data( "wizard" ).elements.submit.is( ":disabled" ) );
	ok( $w2.wizard({
			enableSubmit: true
		}).data( "wizard" ).elements.submit.is( ":enabled" ) );
});

test( "{ forward: string }", function() {
	expect( 2 );

	equals( $w.wizard().data( "wizard" ).elements.forward.length, 1 );
	equals( $w2.wizard({
			forward: ".next"
		}).data( "wizard" ).elements.forward.length, 1 );
});

test( "{ header: string }", function() {
	expect( 2 );

	equals( $w.wizard().data( "wizard" ).elements.header.length, 1 );
	equals( $w2.wizard({
			header: "h2"
		}).data( "wizard" ).elements.header.length, 1 );
});

test( "{ initialStep: number }", function() {
	expect( 2 );

	equals( $w.wizard().wizard( "stepIndex" ), 0 );
	equals( $w2.wizard({
			initialStep: 1
		}).wizard( "stepIndex" ), 1 );
});

test( "{ initialStep: string }", function() {
	expect( 1 );

	equals( $w2.wizard({
			initialStep: "step2"
		}).wizard( "stepIndex" ), 1 );
});

test( "{ initialStep: array }", function() {
	expect( 2 );

	equals( $w.wizard({
			initialStep: [ 1, "branch-1" ]
		}).wizard( "stepIndex" ), 2 );

	$w.wizard( "destroy" );

	// Start on step 1 but maintain history of how we got there
	same( $w.wizard({
			initialStep: [ 1, [ 0, 1 ] ]
		}).wizard( "state" ).stepsActivated, [ 0, 1 ] );
});

test( "{ stateAttribute: string }", function() {
	expect( 1 );

	equals( $w2.wizard({
			stateAttribute: "state"
		}).wizard( "forward" ).wizard( "stepIndex" ), 2 );
});

test( "{ stepClasses: object }", function() {
	expect( 5 );

	ok( $w.wizard({
			stepClasses: {
				current: "cur"
			}
		}).wizard( "step" ).hasClass( "cur" ),
		"Current step has class 'cur'" );

	equals( $w2.wizard({
			backward: ".previous",
			forward: ".next",
			stepClasses: {
				exclude: "wizardExclude",
				stop: "wizardStop",
				submit: "wizardSubmit",
				unidirectional: "wizardNoBackward"
			},
			initialStep: 3
		}).wizard( "state" ).stepsPossible, 3,
		"Step with class 'wizardExclude' is not included in stepsPossible" );

	ok( $w2.data( "wizard" ).elements.forward.is( ":disabled" ),
		"Forward is disabled on step with class 'wizardStop'" );
	ok( $w2.wizard( "forward" ).data( "wizard" ).elements.submit.is( ":enabled" ),
		"Submit is enabled on a step with the class 'wizardSubmit'" );
	ok( $w2.data( "wizard" ).elements.backward.is( ":disabled" ),
		"Backward is disabled on a step with the class 'wizardNoBackward'" );
});

test( "{ steps: string }", function() {
	expect( 2 );

	equals( $w.wizard().data( "wizard" ).elements.steps.length, 8 );
	equals( $( "#wizard3" ).wizard({
			steps: ".wizardStep"
		}).data( "wizard" ).elements.branches.length, 1 );
});

test( "{ submit: string }", function() {
	expect( 2 );

	equals( $w.wizard().data( "wizard" ).elements.submit.length, 1 );
	equals( $( "#wizard3" ).wizard({
			submit: ".process"
		}).data( "wizard" ).elements.submit.length, 1 );
});

test( "{ transitions: object }", function() {
		expect( 5 );

		var $w4 = $( "#wizard4" );

		equals( $w2.wizard({
				stateAttribute: "state"
			}).wizard( "stepIndex" ), 0 );

		equals( $w2.wizard( "forward" ).wizard( "stepIndex" ), 2 );

		equals( $w4.wizard({
				transitions: {
					findNext: function( step ) {
						return step.find( "[name=next]" ).val();
					}
				}
			}).wizard( "stepIndex" ), 0 );

		equals( $w4.wizard( "forward" ).wizard( "stepIndex" ), 2,
			"Step with state 'findNext' transitioned correctly" );
		equals( $w4.wizard( "forward" ).wizard( "stepIndex" ), 3,
			"Default method is still present" );
});

test( "{ unidirectional: boolean }", function() {
	expect( 2 );

	ok( $w.wizard().wizard( "forward" ).data( "wizard" ).elements.backward.is( ":enabled" ),
		"Backward button is enabled on non-unidirectional wizard" );

	ok( $w2.wizard({
			backward: ".previous",
			unidirectional: true
		}).wizard( "forward" ).data( "wizard" ).elements.backward.is( ":disabled" ),
		"Backward button is disabled on unidirectional wizard" );
});

})( jQuery );