/*
commonWidgetTests( "wizard", {
	defaults: {
		actions: {},
		actionAttribute: "data-action",
		actionDefault: function( $step ) {
			return this.index( $step.nextAll( selectors.step ) );
		},
		animations: {
			show: {
				properties: {
					opacity: "show"
				},
				options: {
					duration: 0
				}
			},
			hide: {
				properties: {
					opacity: "hide"
				},
				options: {
					duration: 0
				}
			}
		},
		branches: ".branch",
		backward: ".backward",
		enableSubmit: false,
		forward: ".forward",
		headers: "> :header:first",
		initialStep: 0,
		stepClasses: {
			current: "current",
			exclude: "exclude",
			stop: "stop",
			submit: "submit",
			unidirectional: "unidirectional"
		},
		steps: ".step",
		stepsWrapper: "<div>",
		submit: ":submit",
		unidirectional: false
	}
});
*/
