/**
 * A jQuery UI wizard that supports branching.
 *
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-ui-wizard/
 * @version 0.2.0
 *
 * Dual licensed under the MIT and BSD licenses.
 */

(function( $, undefined ) {

var count = 0,
	classes = {},
	selectors = {},
	click = "click",
	submit = "submit",
	disabled = "disabled",
	namespace = "ui-wizard",

	// Used to detect if stepsWrapper is an HTML fragment or a selector
	rhtmlstring = /^(?:[^<]*(<[\w\W]+>)[^>]*$)/,

	// Determine if an object is an Event object
	isEvent = function( obj ) {
		return obj && obj instanceof $.Event;
	};

$.each( "branch form header step".split( " " ), function() {
	selectors[ this ] = "." + ( classes[ this ] = namespace + "-" + this );
});

$.widget( namespace.replace( "-", "." ), {
	options: {
		actions: {},
		actionAttribute: "data-action",
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
		defaultAction: function( $step ) {
			return this.index( $step.nextAll( selectors.step ) );
		},
		enableSubmit: false,
		forward: ".forward",
		header: "> :header:first",
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
		unidirectional: false,

		/* events */
		afterBackward: null,
		afterForward: null,
		afterSelect: null,
		beforeBackward: null,
		beforeForward: null,
		beforeSelect: null,
		beforeSubmit: null
	},

	_action: function( callback ) {
		var o = this.options,
			action = this._$step.attr( o.actionAttribute ),
			func = action ? o.actions[ action ] : o.defaultAction,
			response = $.isFunction( func ) ? func.call( this, this._$step ) : action;

		// An action function can return false or undefined to opt out of
		// calling select on the response value. Useful for asynchronous actions.
		if ( response !== false && response !== undefined && $.isFunction( callback ) ) {
			callback.call( this, response );
		}

		return response;
	},

	_create: function() {
		this._stepIndex = -1;
		this.element.addClass( namespace +
			" ui-widget ui-widget-content ui-corner-all" );
	},

	_find: function( step, branch ) {
		var stepIndex;

		// Most common use case is selecting a step by index
		if ( typeof step === "number" ) {
			stepIndex = branch !== undefined ?
				this.index( step, branch, true ) : this.index( step );

		// Otherwise, we could be selecting a step or branch by ID, DOM
		// element or jQuery object. In this case, the 'branch' argument
		// could become a step index.
		} else if ( step != null ) {
			step = this._search( step, this._$steps.add( this._$branches ) );

			if ( step !== null && step.length ) {
				if ( step.hasClass( classes.branch ) ) {
					step = this.steps( step ).eq(
						typeof branch === "number" ? branch : 0 );
				}

				stepIndex = this.index( step );
			}
		}

		if ( this.isValidStepIndex( stepIndex ) ) {
			return stepIndex;
		} else {
			throw new Error( 'Could not find step: ' +
				'step="' + step + '", ' +
				'branch="' + branch + '"; ' +
				'returned: "' + stepIndex + '"'
			);
		}
	},

	_init: function() {
		var o = this.options,
			self = this;

		this._activated = { steps: [], branches: [] };
		this._stepsComplete = this._stepsPossible = this._stepsRemaining =
			this._percentComplete = this._stepCount = 0;

		this._$header = this.element.find( o.header ).addClass( classes.header +
			" ui-widget-header ui-helper-reset ui-corner-all" );
		this._$steps = this.element.find( o.steps ).hide().addClass( classes.step +
			" ui-widget-content ui-corner-all" );
		this._$step = this._$steps.eq( 0 );
		this._stepCount = this._$steps.length;

		this._$branch = $( o.stepsWrapper ).addClass( o.branches.substr( 1 ) );

		if ( !this._$branch.attr( "id" ) ) {
			this._$branch.attr( "id", namespace + "-" + count++ );
		}

		// Wrap steps with the provided HTML string fragment
		if ( rhtmlstring.test( o.stepsWrapper ) ) {
			this._$steps.eq( 0 ).parent().wrapInner( this._$branch );
		}

		this._$branches = this.element.find( o.branches ).addClass( classes.branch );

		this._$form = ( this.element[ 0 ].elements ? this.element :
			this.element.find( "form" ) || this.element.closest( "form" ) )
			.addClass( classes.form ).unbind( submit ).bind( submit, function( event ) {
				return self._trigger( "beforeSubmit", event );
			});

		this._$forward = this._$form.find( o.forward )
			.unbind( click ).bind( click, function( event ) {
				event.preventDefault();
				self.forward( event );
			});

		this._$backward = this._$form.find( o.backward )
			.unbind( click ).bind( click, function( event ) {
				event.preventDefault();
				self.backward( event );
			});

		this._$submit = this._$form.find( o.submit )
			.unbind( click ).bind( click, function( event ) {
				event.preventDefault();
				self._$form.trigger( submit );
			});

		this.select( o.initialStep );
	},

	_search: function( needle, haystack ) {
		var $found = null,
			$haystack = haystack instanceof jQuery ? haystack : $( haystack ),
			type = typeof needle;

		if ( needle !== undefined && $haystack.length ) {
			if ( type === "number" ) {
				$found = $haystack.eq( needle );
			} else if ( type === "string" ) {
				$found = $( needle.charAt( 0 ) === "#" ? needle : "#" + needle );
			} else if ( type === "object" ) {
				if ( needle instanceof jQuery && needle.length ) {
					needle = needle[ 0 ];
				}

				// Make sure we have a DOM object
				if ( needle.nodeType ) {
					$haystack.each(function() {
						if ( this === needle ) {
							$found = $( this );
							return false;
						}
					});
				}
			}
		}

		return $found;
	},

	_select: function( stepIndex, event ) {
		if ( stepIndex == null || stepIndex === this._stepIndex ) {
			return;
		}

		var $step = this._$steps.eq( stepIndex ),
			$branch = $step.closest( selectors.branch ),
			movingForward = stepIndex > this._stepIndex,
			uiHash = {
				step: $step,
				branch: $branch,
				stepIndex: stepIndex,
				movingForward: movingForward
			};

		if ( !this._trigger( "beforeSelect", event, uiHash )
			|| movingForward && !this._trigger( "beforeForward", event, uiHash )
			|| !movingForward && !this._trigger( "beforeBackward", event, uiHash ) ) {
			return;
		}

		var o = this.options,
			branch = $branch.attr( "id" ),
			lastStepIndex = this.index( this.steps( $branch ).filter( ":last" ) );

		if ( this._$step ) {
			this._$step.removeClass( o.stepClasses.current )
				.animate( o.animations.hide.properties,
					// Fixes #3583 - http://bugs.jquery.com/ticket/3583
					$.extend( {}, o.animations.hide.options ) );
		}

		$step.addClass( o.stepClasses.current )
			.animate( o.animations.show.properties,
				// Fixes #3583 - http://bugs.jquery.com/ticket/3583
				$.extend( {}, o.animations.show.options ) );

		if ( stepIndex === 0 || o.unidirectional
			|| $step.hasClass( o.stepClasses.unidirectional ) ) {
			this._$backward.attr( disabled, true );
		} else {
			this._$backward.removeAttr( disabled );
		}

		if ( ( stepIndex === lastStepIndex
			&& !$step.attr( o.actionAttribute ) )
			|| $step.hasClass( o.stepClasses.stop ) ) {
			this._$forward.attr( disabled, true );
		} else {
			this._$forward.removeAttr( disabled );
		}

		if ( this._$form.length && ( o.enableSubmit
			|| $step.hasClass(o.stepClasses.submit ) ) ) {
			this._$submit.removeAttr( disabled );
		} else {
			this._$submit.attr( disabled, true );
		}

		this._updateActivated( stepIndex, branch, movingForward );

		this._$step = $step;
		this._$branch = $branch;
		this._stepIndex = stepIndex;

		this._updateProgress();

		this._trigger( "afterSelect", event, uiHash );
		this._trigger( movingForward ? "afterForward" : "afterBackward", event, uiHash );
	},

	_step: function( step, branch, index, relative ) {
		// Allow for the omission of branch argument
		if ( typeof branch === "boolean" ) {
			relative = index;
			index = branch;
			branch = undefined;
		}

		var $steps = branch !== undefined ? this.steps( branch ) : this._$steps,
			$step = this._search( step, $steps );

		// If index is true, we return the step index instead of the step itself
		if ( index === true ) {
			return $step && $step.length ?
				// If relative is true, the index will be relative to the branch
				// containing the step, instead of relative to all steps.
				( relative === true ? $steps : this._$steps ).index( $step ) : -1;
		}

		return $step;
	},

	_updateActivated: function( stepIndex, branch, movingForward ) {
		if ( movingForward ) {
			this._activated.steps.push( stepIndex );

			if ( $.inArray( branch, this._activated.branches ) < 0 ) {
				this._activated.branches.push( branch );
			}
		} else {
			var spliceIndex = $.inArray( stepIndex, this._activated.steps ) + 1;

			// Don't remove the initial step
			if ( spliceIndex > 0 ) {
				this._activated.steps.splice( spliceIndex );
			}

			if ( branch !== this._$branch.attr( "id" ) ) {
				var currentBranchIndex = $.inArray( branch, this._activated.branches );

				// Don't remove the default branch
				if ( currentBranchIndex > 0 ) {
					this._activated.branches.splice( currentBranchIndex, 1 );
				}
			}
		}
	},

	_updateProgress: function() {
		var o = this.options;

		this._stepsComplete = Math.max( 0, this.stepsActivated()
			.filter(function() {
				return !$( this ).hasClass( o.stepClasses.exclude );
			}).length - 1 );

		this._stepsPossible = Math.max( 0, this.branchesActivated()
			.children( selectors.step ).filter(function() {
				return !$( this ).hasClass( o.stepClasses.exclude );
			}).length - 1 );

		this._stepsRemaining = this._stepsPossible - this._stepsComplete;
		this._percentComplete = 100 * this._stepsComplete / this._stepsPossible;
	},

	backward: function( event, howMany ) {
		// Allow omission of the event argument
		if ( event == null || !isEvent( event ) ) {
			howMany = event;
		}

		if ( typeof howMany !== "number" || howMany < 1 ) {
			howMany = 1;
		}

		var index = this._activated.steps.length - ( howMany + 1 ),
			stepIndex = this._activated.steps[ index > 0 ? index : 0 ];

		this._select( stepIndex, event );
	},

	branch: function( branch ) {
		return arguments.length ?
			this._search( branch, this._$branches ) :
			this._$branch;
	},

	branches: function( branch ) {
		return arguments.length ?
			this.branch( branch ).children( selectors.branch ) :
			this._$branches;
	},

	branchesActivated: function() {
		var i = 0,
			length = this._activated.branches.length,
			result = [];

		for ( ; i < length; i++ ) {
			result.push( this.branch( this._activated.branches[ i ] )[ 0 ] );
		}

		return $( result );
	},

	form: function() {
		return this._$form;
	},

	forward: function( event, howMany ) {
		if ( event == null || !isEvent( event ) ) {
			howMany = event;
		}

		this._action(function( response ) {
			this.select( event, response );
		});
	},

	index: function( step, branch, relative ) {
		return arguments.length ?
			this._step( step, branch, true, relative ) :
			this._stepIndex;
	},

	isValidStep: function( step ) {
		return this.isValidStepIndex( this.index( step ) );
	},

	isValidStepIndex: function( stepIndex ) {
		return typeof stepIndex === "number"
			&& stepIndex >= 0
			&& stepIndex < this._stepCount;
	},

	percentComplete: function() {
		return this._percentComplete;
	},

	select: function( event, step, branch ) {
		// Allow omission of the event argument
		if ( event == null || !isEvent( event ) ) {
			branch = step;
			step = event;
		}

		this._select( this._find( step, branch ), event );
	},

	step: function( step, branch ) {
		return arguments.length ?
			this._step( step, branch ) :
			this._$step;
	},

	stepCount: function() {
		return this._stepCount;
	},

	steps: function( branch ) {
		return arguments.length ?
			this.branch( branch ).children( selectors.step ) :
			this._$steps;
	},

	stepsActivated: function() {
		var i = 0,
			length = this._activated.steps.length,
			result = [];

		for ( ; i < length; i++ ) {
			result.push( this.step( this._activated.steps[ i ] )[ 0 ] );
		}

		return $( result );
	},

	stepsComplete: function() {
		return this._stepsComplete;
	},

	stepsPossible: function() {
		return this._stepsPossible;
	},

	stepsRemaining: function() {
		return this._stepsRemaining;
	}
});

})( jQuery );
