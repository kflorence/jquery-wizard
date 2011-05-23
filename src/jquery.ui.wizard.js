/**
 * A jQuery UI wizard that supports branching.
 *
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-ui-wizard/
 * @version 0.2.2
 *
 * Dual licensed under the MIT and BSD licenses.
 */

(function( $, undefined ) {

var count = 0,
	selector = {},
	className = {},

	// Reference commonly used methods
	aps = Array.prototype.slice,

	// Commonly used strings
	id = "id",
	form = "form",
	click = "click",
	number = "number",
	submit = "submit",
	disabled = "disabled",

	// Events
	afterBackward = "afterBackward",
	afterForward = "afterForward",
	afterSelect = "afterSelect",
	beforeBackward = "beforeBackward",
	beforeForward = "beforeForward",
	beforeSelect = "beforeSelect",
	beforeSubmit = "beforeSubmit",

	// Classes
	namespace = "ui-wizard",
	stepClasses = "ui-widget-content ui-corner-all",
	headerClasses = "ui-widget-header ui-helper-reset ui-corner-all",
	widgetClasses = "ui-widget ui-widget-content ui-corner-all";

// Generate selectors and class names for common wizard elements
$.each( "branch form header step wrapper".split( " " ), function() {
	selector[ this ] = "." + ( className[ this ] = namespace + "-" + this );
});

$.widget( namespace.replace( "-", "." ), {
	options: {
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
		enableSubmit: false,
		error: function( e ) {
			throw e;
		},
		forward: ".forward",
		fastForward: true,
		header: ":header:first",
		initialStep: 0,
		state: "data-state",
		states: {
			default: function( step ) {
				return this.stepIndex( step.nextAll( selector.step ) );
			}
		},
		stepClasses: {
			current: "current",
			exclude: "exclude",
			stop: "stop",
			submit: "submit",
			unidirectional: "unidirectional"
		},
		steps: ".step",
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

	_create: function() {
		var self = this,
			o = self.options,
			$element = self.element
				.addClass( namespace + " " + widgetClasses ),
			$elements = self.elements = {},
			$form = $element[ 0 ].elements ? $element :
				$element.find( form ) || $element.closest( form ),
			$steps = $element.find( o.steps ),
			$stepsWrapper = $steps.eq( 0 ).parent();

		$.extend( $elements, {
			form: $form.addClass( className.form ),
			submit: $form.find( o.submit ),
			forward: $form.find( o.forward ),
			backward: $form.find( o.backward ),
			header: $element.find( o.header ).addClass( className.header + " " + headerClasses ),
			steps: $element.find( o.steps ).hide().addClass( className.step + " " + stepClasses ),
			branches: $element.find( o.branches ).add( $stepsWrapper ).addClass( className.branch ),
			stepsWrapper: $stepsWrapper.addClass( className.wrapper )
		});

		if ( !$stepsWrapper.attr( id ) ) {
			// stepsWrapper must have an ID as it also functions as the default branch
			$stepsWrapper.attr( id, namespace + "-" + ++count );
		}

		$elements.form.unbind( submit ).bind( submit, function( event ) {
			return self._trigger( beforeSubmit, event );
		});

		$elements.forward.unbind( click ).bind( click, function( event ) {
			event.preventDefault();
			self.forward( event );
		});

		$elements.backward.unbind( click ).bind( click, function( event ) {
			event.preventDefault();
			self.backward( event );
		});

		$elements.submit.unbind( click ).bind( click, function( event ) {
			event.preventDefault();
			self._$form.trigger( submit );
		});

		self.wizard = {
			branch: null,
			branchesActivated: [],
			branchLabel: "",
			branchStepCount: 0,
			isFirstStep: false,
			isFirstStepInBranch: false,
			isLastStep: false,
			isLastStepInBranch: false,
			isMovingForward: false,
			percentComplete: 0,
			step: null,
			stepCount: $steps.length,
			stepIndex: -1,
			stepIndexInBranch: -1,
			stepsActivated: [],
			stepsComplete: 0,
			stepsPossible: 0,
			stepsRemaining: 0
		};

		self.select( o.initialStep );
	},

	_error: function( message, step ) {
		throw message + ( step ? ', on step: "' + step + '"' : '' );
	},

	_fastForward: function( toIndex, determinate, callback ) {

		// Allow omission of determinate argument
		if ( $.isFunction( determinate ) ) {
			callback = determinate;
			determinate = false;
		}

		var self = this,
			index = 0,
			stepIndex = Math.max( 0, self.wizard.stepIndex ),
			stepsTaken = [];

		// FIXME
		if ( !$.isFunction( callback ) ) {

			// By default, fastForward will select the step returned on
			// successful completion
			callback = function( stepIndex ) {
				self._update( self.state( stepIndex ) );
			};
		}

		// Iterate over transitions with the goal of 'index' reaching 'toIndex'
		(function next() {
		 	stepsTaken.push( stepIndex );

			self.transition( stepIndex, function( step, branch ) {
				if ( ( stepIndex = self.stepIndex( step, branch ) ) === undefined ) {
					self._error( "Fastforward failed on invalid step", step );

				} else if ( $.inArray( stepIndex, stepsTaken ) >= 0 ) {
					self._error( "Fastforward failed because of recursion", step );

				} else if ( ( index = determinate ? ++index : stepIndex ) === toIndex ) {
					callback.call( self, stepsTaken );

				} else {
					next();
				}
			});
		})();
	},

	_find: function( needle, haystack, unwrapped ) {
		var found,
			$haystack = haystack instanceof jQuery ? haystack : $( haystack ),
			type = typeof needle;

		if ( needle !== undefined && $haystack.length ) {
			if ( type === number ) {
				found = $haystack.get( needle );

			} else if ( type === "string" ) {
				found = document.getElementById( needle.replace( "#", "" ) );

			} else if ( type === "object" ) {
				if ( needle instanceof jQuery && needle.length ) {
					needle = needle[ 0 ];
				}

				// Make sure we have a DOM object
				if ( needle.nodeType ) {
					$haystack.each(function() {
						if ( this === needle ) {
							return ( found = this ) && false;
						}
					});
				}
			}
		}

		return unwrapped ? found : $( found );
	},

	_findMultiple: function( needles, haystack ) {
		var found = [],
			i = 0,
			l = needles.length;

		for ( ; i < l; i++ ) {
			found.push( this._find( needles[ i ], haystack, true ) );
		}

		return $( found );
	},

	// FIXME: events aren't passed in here, but they should be
	_update: function( state, event ) {
		var o = this.options,
			stepIndex = this.wizard.stepIndex,
			isInitialStep =  stepIndex === -1;

		if ( state === null ||
			this.wizard.stepIndex === state.stepIndex ||
			!isInitialStep && (
				!this._trigger( beforeSelect, event, state ) ||
				( state.isMovingForward && !this._trigger( beforeForward, event, state ) ) ||
				( !state.isMovingForward && !this._trigger( beforeBackward, event, state ) )
			) ) {

			return;
		}

		if ( this.wizard.step ) {
			this.wizard.step.removeClass( o.stepClasses.current )
				.animate( o.animations.hide.properties,
					// Fixes #3583 - http://bugs.jquery.com/ticket/3583
					$.extend( {}, o.animations.hide.options ) );
		}

		state.step.addClass( o.stepClasses.current )
			.animate( o.animations.show.properties,
				// Fixes #3583 - http://bugs.jquery.com/ticket/3583
				$.extend( {}, o.animations.show.options ) );

		if ( state.isFirstStep || o.unidirectional ||
			state.step.hasClass( o.stepClasses.unidirectional ) ) {
			this.elements.backward.attr( disabled, true );

		} else {
			this.elements.backward.removeAttr( disabled );
		}

		if ( ( state.isLastStepInBranch && !state.step.attr( o.state ) ) ||
			state.step.hasClass( o.stepClasses.stop ) ) {
			this.elements.forward.attr( disabled, true );

		} else {
			this.elements.forward.removeAttr( disabled );
		}

		if ( o.enableSubmit || state.step.hasClass(o.stepClasses.submit ) ) {
			this.elements.submit.removeAttr( disabled );

		} else {
			this.elements.submit.attr( disabled, true );
		}

		this._trigger( afterSelect, event, this.wizard = state );

		if ( !isInitialStep ) {
			this._trigger( state.isMovingForward ? afterForward : afterBackward, event, state );
		}
	},

	backward: function( howMany ) {
		if ( this.wizard.isFirstStep ) {
			return;
		}

		var stepsActivated = this.wizard.stepsActivated,
			stepsActivatedIndex = Math.max( 0,
				( stepsActivated.length - 1 ) -
				( typeof howMany === number && howMany > 0 ? howMany : 1 ) );

		this._update( this.state( stepsActivated[ stepsActivatedIndex ] ) );
	},

	branch: function( branch ) {
		return arguments.length ?
			this._find( branch, this.elements.branches ) :
			this.elements.branch;
	},

	branches: function( branch ) {
		return arguments.length ?
			this.branch( branch ).children( selector.branch ) :
			this.elements.branches;
	},

	branchesActivated: function() {
		return $( this._findMultiple( this.wizard.branchesActivated, this.elements.branches ) );
	},

	destroy: function() {
		var $elements = this.elements;

		this.element.removeClass( namespace + " " + widgetClasses );

		$elements.form.removeClass( className.form );
		$elements.header.removeClass( className.header + " " + headerClasses );
		$elements.steps.show().removeClass( className.step + " " + stepClasses );
		$elements.stepsWrapper.removeClass( className.wrapper );
		$elements.branches.removeClass( className.branch );

		$.Widget.prototype.destroy.call( this );
	},

	form: function() {
		return this.elements.form;
	},

	forward: function( howMany ) {
		if ( this.wizard.isLastStep ) {
			return;
		}

		// TODO: normalize to max index
		howMany = typeof howMany === number && howMany > 0 ? howMany : 1;

		if ( howMany > 1 ) {
			// FIXME
			this._fastForward( howMany, true );

		} else {
			this.transition(function( stepIndex ) {
				this._update( this.state( stepIndex ) );
			});
		}
	},

	isValidStep: function( step ) {
		return this.isValidStepIndex( this.stepIndex( step ) );
	},

	isValidStepIndex: function( stepIndex ) {
		return typeof stepIndex === number
			&& stepIndex >= 0
			&& stepIndex < this.wizard.stepCount;
	},

	percentComplete: function() {
		return this.wizard.percentComplete;
	},

	select: function( step, branch ) {
		this._update( this.state( step, branch ) );
	},

	state: function( step, branch ) {
		var $step,
			self = this;

		// With no arguments, return the current state
		if ( !arguments.length ) {
			return self.wizard;
		}

		// TODO: Find the stepIndex here

		if ( !( $step = self.step( step, branch ) ) ) {
			return null;
		}

		var wizard = self.wizard,
			$branch = $step.parent(),
			branchLabel = $branch.attr( id ),
			stepIndex = self.stepIndex( $step ),
			branchesActivated = wizard.branchesActivated.concat(),
			branchStepCount = $branch.children( selector.step ).length,
			isMovingForward = stepIndex > wizard.stepIndex,
			stepIndexInBranch = self.stepIndex( stepIndex, true ),
			stepsActivated = wizard.stepsActivated.concat();

		// FIXME
		/*
		function updateActivated() {
			if ( isMovingForward ) {
				if ( $.inArray( stepIndex, stepsActivated ) < 0 ) {
					stepsActivated.push( stepIndex );
				}

				if ( $.inArray( branchLabel, branchesActivated ) < 0 ) {
					branchesActivated.push( branchLabel );
				}

			} else {
				var spliceIndex = $.inArray( stepIndex, stepsActivated ) + 1;

				if ( spliceIndex > 0 ) {
					stepsActivated.splice( spliceIndex );
				}

				if ( branchLabel !== wizard.branchLabel ) {
					var branchIndex = $.inArray( branchLabel, branchesActivated );

					if ( branchIndex > 0 ) {
						branchesActivated.splice( branchIndex, 1 );
					}
				}
			}
		}

		// Do we need to fastForward?
		if ( isMovingForward
			&& self.options.fastForward
			&& ( stepIndex - wizard.stepIndex ) > 1 ) {

			this._fastForward( state );
		} else {

		}
		*/

		// Filters out steps with the 'exclude' class
		function filter() {
			return !$( this ).hasClass( self.options.stepClasses.exclude );
		}

		var stepsComplete = this._findMultiple( stepsActivated, this.elements.steps )
				.filter( filter ).length - 1,
			stepsPossible = this._findMultiple( branchesActivated, this.elements.branches )
				.children( selector.step ).filter( filter ).length - 1;

		return {
			branch: $branch,
			branchesActivated: branchesActivated,
			branchLabel: $branch.attr( id ),
			branchStepCount: branchStepCount,
			isFirstStep: stepIndex === 0,
			isFirstStepInBranch: stepIndexInBranch === 0,
			isLastStep: stepIndex === wizard.stepCount - 1,
			isLastStepInBranch: stepIndexInBranch === branchStepCount - 1,
			isMovingForward: stepIndex > wizard.stepIndex,
			percentComplete: ( 100 * stepsComplete / stepsPossible ),
			step: $step,
			stepIndex: stepIndex,
			stepIndexInBranch: stepIndexInBranch,
			stepsActivated: stepsActivated,
			stepsComplete: stepsComplete,
			stepsPossible: stepsPossible,
			stepsRemaining: ( stepsPossible - stepsComplete )
		}
	},

	step: function( step, branch ) {
		var $step;

		// With no arguments, return current step
		if ( !arguments.length ) {
			return this.wizard.step;
		}

		// Searching for a step by index
		if ( typeof step === number ) {
			$step = this._find( step,
				// Search within branch, if defined, otherwise search all steps
				branch !== undefined ? this.steps( branch ) : this.elements.steps );

		// Searching for a step or branch by string ID, DOM element or jQuery object
		} else if ( step != null ) {
			$step = this._find( step, this.elements.steps.add( this.elements.branches ) );

			if ( $step && $step.hasClass( className.branch ) ) {

				// If a branch is found, the arguments are essentially flip-flopped
				$step = this._find( branch || 0, this.steps( $step ) );
			}
		}

		return $step;
	},

	stepIndex: function( step, branch, relative ) {
		var $step;

		// With no arguments, return current step index
		if ( !arguments.length ) {
			return this.wizard.stepIndex;
		}

		// Allow omission of branch argument
		if ( typeof branch === "boolean" ) {
			relative = branch;
			branch = undefined;
		}

		// Speed it up if we are given a jQuery object or DOM element
		if ( ( step instanceof jQuery && step.length ) || step.nodeType ) {
			$step = step;

		} else {
			$step = this.step( step, branch );
		}

		return $step ?
			// The returned index can be relative to a branch, or to all steps
			( relative ? $step.siblings( selector.step ).andSelf() : this.elements.steps )
				.index( $step )
			: -1;
	},

	stepCount: function() {
		return this.wizard.stepCount;
	},

	steps: function( branch ) {
		return arguments.length ?
			this.branch( branch ).children( selector.step ) :
			this.elements.steps;
	},

	stepsActivated: function() {
		return $( this._findMultiple( this.wizard.stepsActivated, this.elements.steps ) );
	},

	stepsComplete: function() {
		return this.wizard.stepsComplete;
	},

	stepsPossible: function() {
		return this.wizard.stepsPossible;
	},

	stepsRemaining: function() {
		return this.wizard.stepsRemaining;
	},

	transition: function( step, action ) {

		// Allow omission of step argument
		if ( $.isFunction( step ) ) {
			action = step;
			step = undefined;
		}

		var self = this,
			o = self.options;
			$step = step === undefined ? self.wizard.step : self.step( step ),
			state = $step.attr( o.state ),
			transition = state ? o.states[ state ] : o.states[ "default" ];

		if ( $.isFunction( transition ) ) {
			try {
				state = transition.call( self, $step, function() {

					// Ensures the action function is called in the right context
					return action.apply( self, aps.call( arguments ) );
				});

			} catch ( error ) {
				if ( $.isFunction( o.error ) ) {
					o.error.call( self, error );
				}
			}
		}

		// A state of 'undefined' or 'false' will halt immediate action
		// waiting instead for the transition function to handle the call
		if ( state !== undefined && state !== false ) {

			// State can be array like [ step, branch ] or vice versa
			action.apply( self, $.isArray( state ) ? state : [ state ] );
		}

		// The immediate response
		return state;
	}
});

})( jQuery );
