/*
 * wizard options unit tests
 */

(function( $ ) {

var $w, $w2, $w3, $w4;

module( "wizard: options", {
	setup: function() {
		$w = $( "#wizard" );
		$w2 = $( "#wizard2" );
		$w3 = $( "#wizard3" );
		$w4 = $( "#wizard4" );
	}
});

// TODO make tests for animations

test( "{ backward: string }", function() {
	expect( 2 );

	equal( $w.wizard().data( "kf-wizard" ).elements.backward.length, 1 );
	equal( $w2.wizard({
			backward: ".previous"
		}).data( "kf-wizard" ).elements.backward.length, 1 );
});

test( "{ branches: string }", function() {
	expect( 2 );

	equal( $w.wizard().data( "kf-wizard" ).elements.branches.length, 4 );
	equal( $w2.wizard({
			branches: ".wizardBranch"
		}).data( "kf-wizard" ).elements.branches.length, 1 );
});

test( "{ enableSubmit: boolean }", function() {
	expect( 2 );

	ok( $w.wizard().data( "kf-wizard" ).elements.submit.is( ":disabled" ) );
	ok( $w2.wizard({
			enableSubmit: true
		}).data( "kf-wizard" ).elements.submit.is( ":enabled" ) );
});

test( "{ forward: string }", function() {
	expect( 2 );

	equal( $w.wizard().data( "kf-wizard" ).elements.forward.length, 1 );
	equal( $w2.wizard({
			forward: ".next"
		}).data( "kf-wizard" ).elements.forward.length, 1 );
});

test( "{ header: string }", function() {
	expect( 2 );

	equal( $w.wizard().data( "kf-wizard" ).elements.header.length, 1 );
	equal( $w2.wizard({
			header: "h2"
		}).data( "kf-wizard" ).elements.header.length, 1 );
});

test( "{ initialStep: number }", function() {
	expect( 2 );

	equal( $w.wizard().wizard( "stepIndex" ), 0 );
	equal( $w2.wizard({
			initialStep: 1
		}).wizard( "stepIndex" ), 1 );
});

test( "{ initialStep: string }", function() {
	expect( 1 );

	equal( $w2.wizard({
			initialStep: "step2"
		}).wizard( "stepIndex" ), 1 );
});

test( "{ initialStep: array }", function() {
	expect( 2 );

	equal( $w.wizard({
			initialStep: [ 1, "branch-1" ]
		}).wizard( "stepIndex" ), 2 );

	$w.wizard( "destroy" );

	// Start on step 1 but maintain history of how we got there
	deepEqual( $w.wizard({
			initialStep: [ 1, [ 0, 1 ] ]
		}).wizard( "state" ).stepsActivated, [ 0, 1 ] );
});

test( "{ stateAttribute: string }", function() {
	expect( 1 );

	equal( $w2.wizard({
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

	equal( $w2.wizard({
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

	ok( $w2.data( "kf-wizard" ).elements.forward.is( ":disabled" ),
		"Forward is disabled on step with class 'wizardStop'" );
	ok( $w2.wizard( "forward" ).data( "kf-wizard" ).elements.submit.is( ":enabled" ),
		"Submit is enabled on a step with the class 'wizardSubmit'" );
	ok( $w2.data( "kf-wizard" ).elements.backward.is( ":disabled" ),
		"Backward is disabled on a step with the class 'wizardNoBackward'" );
});

test( "{ steps: string }", function() {
	expect( 2 );

	equal( $w.wizard().data( "kf-wizard" ).elements.steps.length, 8 );
	equal( $w3.wizard({
			steps: ".wizardStep"
		}).data( "kf-wizard" ).elements.branches.length, 1 );
});

test( "{ submit: string }", function() {
	expect( 2 );

	equal( $w.wizard().data( "kf-wizard" ).elements.submit.length, 1 );
	equal( $w3.wizard({
			submit: ".process"
		}).data( "kf-wizard" ).elements.submit.length, 1 );
});

test( "{ transitions: object }", function() {
		expect( 6 );

		var $w4 = $( "#wizard4" );

		equal( $w2.wizard({
				stateAttribute: "state"
			}).wizard( "stepIndex" ), 0 );

		equal( $w2.wizard( "forward" ).wizard( "stepIndex" ), 2 );

		equal( $w4.wizard({
				transitions: {
					findNext: function( state ) {
						return state.step.find( "[name=next]" ).val();
					}
				}
			}).wizard( "stepIndex" ), 0 );

		equal( $w4.wizard( "forward" ).wizard( "stepIndex" ), 2,
			"Step with state 'findNext' transitioned correctly" );
		equal( $w4.wizard( "forward" ).wizard( "stepIndex" ), 3,
			"Default method is still present" );

		stop();
		$w4.wizard( "destroy" ).wizard({
				afterForward: function( event, state ) {
					equal( state.stepIndex, 5,
						"Step with state 'asyncNext' transitioned corectly" );
					start();
				},
				initialStep: 3,
				transitions: {
					asyncNext: function( state, action ) {
						setTimeout(function() {
							action("asyncDestination");
						}, 1);
						return false;
					}
				}
			}).wizard( "forward" );
});

test( "{ unidirectional: boolean }", function() {
	expect( 2 );

	ok( $w.wizard().wizard( "forward" ).data( "kf-wizard" ).elements.backward.is( ":enabled" ),
		"Backward button is enabled on non-unidirectional wizard" );

	ok( $w2.wizard({
			backward: ".previous",
			unidirectional: true
		}).wizard( "forward" ).data( "kf-wizard" ).elements.backward.is( ":disabled" ),
		"Backward button is disabled on unidirectional wizard" );
});

})( jQuery );