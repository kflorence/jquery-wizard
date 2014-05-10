/*
 * wizard defaults unit tests
 */

(function( $ ) {

	var defaultsToTest = {
		defaults: {
			animations: {
				show: {
					options: {
						duration: 0
					},
					properties: {
						opacity: "show"
					}
				},
				hide: {
					options: {
						duration: 0
					},
					properties: {
						opacity: "hide"
					}
				}
			},
			backward: ".backward",
			branches: ".branch",
			disabled: false,
			enableSubmit: false,
			forward: ".forward",
			header: ":header:first",
			initialStep: 0,
			stateAttribute: "data-state",
			stepClasses: {
				current: "current",
				exclude: "exclude",
				stop: "stop",
				submit: "submit",
				unidirectional: "unidirectional"
			},
			steps: ".step",
			submit: ":submit",
			transitions: {},
			unidirectional: false,

			/* callbacks */
			afterBackward: null,
			afterDestroy: null,
			afterForward: null,
			afterSelect: null,
			beforeBackward: null,
			beforeDestroy: null,
			beforeForward: null,
			beforeSelect: null,
			create: null
		}
	};

	commonWidgetTests( "wizard", defaultsToTest );

})( jQuery );