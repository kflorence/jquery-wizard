/*
 * wizard unit tests
 */
(function( $ ) {

module( "wizard: core" );

test( "widget method - empty collection", function() {
	expect( 1 );

	$( "#nonExist" ).wizard();
	ok( !$( ".ui-wizard" ).length, "Not initialized on an empty collection" );
});

test( "widget method", function() {
	expect( 1 );

	var $wizard = $( "#wizard" ).wizard();
	$wizard = $wizard.wizard( "widget" );

	deepEqual( $( "#wizard" )[0], $wizard[0] );
});

test( "widget form", function() {
	$( ".wizard" ).wizard();
	var $wizard = $( ".wizard" );

	expect( $wizard.length );

	$wizard.each(function() {
		var $this = $( this );

		ok( $this.wizard( "form" ).length,
			"Form found for wizard: #" + $this.attr( "id" ) );
	});
});

test( "wizard classes", function() {
	expect( 5 );

	var $wizard = $( "#wizard" ).wizard();

	ok( $wizard.hasClass( "wizard" ), "Wizard has 'wizard' class" );

	$.each({
		header: "> :header:first",
		form: "form",
		step: ".step",
		branch: ".branch"
	}, function(k, v) {
		ok( $wizard.find( v ).hasClass( "wizard-" + k ),
			"Wizard (" + v + ") has wizard-" + k + " class" );
	});
});

test( "wizard disabled", function() {
	expect( 3 );

	var $wizard = $( "#wizard" ).wizard({
		disabled: true,
		initialStep: 1
	});

	equal( $wizard.wizard( "forward" ).wizard( "stepIndex" ), 1,
		"Forward was cancelled because wizard is disabled" );

	equal( $wizard.wizard( "backward" ).wizard( "stepIndex" ), 1,
		"Backward was cancelled because wizard is disabled" );

	equal( $wizard.wizard( "select", 2 ).wizard( "stepIndex" ), 1,
		"Select was cancelled because wizard is disabled" );
});

test( "wizard update", function() {
	expect( 8 );

	var $wizard = $( "#wizard2" ).wizard({
			backward: ".previous",
			forward: ".next",
			stepClasses: {
				exclude: "wizardExclude",
				stop: "wizardStop",
				submit: "wizardSubmit",
				unidirectional: "wizardNoBackward"
			}
		}),
		wizard = $wizard.data( "kf-wizard" );

	ok( wizard.elements.backward.is( ":disabled" ),
		"Backward button disabled on first step" );

	ok( wizard.elements.forward.is( ":enabled" ),
		"Forward step is enabled on first step" );

	ok( wizard.elements.submit.is( ":disabled" ),
		"Submit step is disabled because 'submit' stepClass is not present and enableSubmit is false" );

	$wizard.wizard( "select", 3 );

	ok( wizard.elements.backward.is( ":enabled" ),
		"Backward button enabled on third step" );

	ok( wizard.elements.forward.is( ":disabled" ),
		"Forward button disabled because of 'stop' stepClass" );

	$wizard.wizard( "select", -1 );

	ok( wizard.elements.backward.is( ":disabled" ),
		"Backward is disabled because of 'unidirectional' stepClass" );

	ok( wizard.elements.forward.is( ":disabled" ),
		"Forward is disabled on last step in branch without a transition state" );

	ok( wizard.elements.submit.is( ":enabled" ),
		"Submit is enabled because of the 'submit' stepClass" );
});

})( jQuery );