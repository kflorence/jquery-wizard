/*
 * wizard unit tests
 */
(function( $ ) {

module( "wizard: core" );

test( "widget method - empty collection", function() {
	$( "#nonExist" ).wizard();
	ok( !$( ".ui-wizard" ).length, "Not initialized on an empty collection" );
});

test( "widget method", function() {
	var wizard = $( "#wizard" ).wizard().wizard("widget")[0];
	same( $( "#wizard" )[0], wizard );
});

test( "wizard classes", function() {
	expect( 5 );

	var $wizard = $( "#wizard" ).wizard();

	ok( $wizard.hasClass( "ui-wizard" ), "Wizard has ui-wizard class" );

	$.each({
		header: "> :header:first",
		form: "form",
		step: ".step",
		branch: ".branch"
	}, function(k, v) {
		ok( $wizard.find( v ).hasClass( "ui-wizard-" + k ),
			"Wizard (" + v + ") has ui-wizard-" + k + " class" );
	});
});

})( jQuery );
