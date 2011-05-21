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
	aps = Array.prototype.slice,

	// Re-use strings for better minification
	id = "id",
	form = "form",
	click = "click",
	number = "number",
	submit = "submit",
	disabled = "disabled",

	afterBackward = "afterBackward",
	afterForward = "afterForward",
	afterSelect = "afterSelect",
	beforeBackward = "beforeBackward",
	beforeForward = "beforeForward",
	beforeSelect = "beforeSelect",
	beforeSubmit = "beforeSubmit",

	namespace = "ui-wizard",
	stepClasses = "ui-widget-content ui-corner-all",
	headerClasses = "ui-widget-header ui-helper-reset ui-corner-all",
	widgetClasses = "ui-widget ui-widget-content ui-corner-all";

// Generate selectors and classNames for common wizard elements
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
			step: null,
			stepCount: $steps.length,
			stepIndex: -1,
			stepsComplete: 0,
			stepsPossible: 0,
			stepsRemaining: 0,
			stepsActivated: [],
			percentComplete: 0,
			branch: null,
			branchLabel: "",
			branchesActivated: []
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

		var stepIndex,
			self = this,

			// If determinate, toIndex determines how many steps to take
			// Otherwise, move forward until we reach or pass 'toIndex'
			index = determinate ? 0 : self.wizard.stepIndex,
			stepsTaken = [];

		if ( !$.isFunction( callback ) ) {

			// By default, fastForward will select the step returned on
			// successful completion
			callback = function( stepIndex ) {
				self._select( self.state( stepIndex ) );
			};
		}

		function forward() {
			if ( index < toIndex ) {
				self.transition( stepIndex, function( step, branch ) {
					if ( ( stepIndex = self.stepIndex( step, branch ) ) !== undefined
						&& $.inArray( stepIndex, stepsTaken ) < 0 ) {
						index = determinate ? ++index : stepIndex;
						stepsTaken.push( stepIndex );
						forward();

					} else {
						complete( "Invalid step or recursion detected", step );
					}
				});

			} else {
				complete();
			}
		}

		function complete( error, step ) {
			if ( index === toIndex ) {
				var i = 0,
					l = stepsTaken.length;

				for ( ; i < l; i++ ) {
					self._updateActivated( self.state( stepsTaken[ i ] ) );
				}

				callback.call( self, stepIndex );

			} else {
				self._error( "FastForward failed: " + error, step );
			}
		}

		forward();
	},

	_find: function( needle, haystack ) {
		var $found = null,
			$haystack = haystack instanceof jQuery ? haystack : $( haystack ),
			type = typeof needle;

		if ( needle !== undefined && $haystack.length ) {
			if ( type === number ) {
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

	_select: function( state ) {
		var o = this.options,
			stepIndex = this.wizard.stepIndex,
			lastStepIndex = this.stepIndex( this.steps( state.branch ).filter( ":last" ) ),
			// FIXME: events aren't passed in here, but they should be
			event = null;

		if ( typeof state.stepIndex !== number || state.stepIndex === stepIndex ||
			!this._trigger( beforeSelect, event, state ) || stepIndex !== -1 && (
				state.movingForward && !this._trigger( beforeForward, event, state ) ||
				!state.movingForward && !this._trigger( beforeBackward, event, state )
			) ) {

			return;
		}

		this._updateActivated( state );

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

		if ( state.stepIndex === 0 || o.unidirectional ||
			state.step.hasClass( o.stepClasses.unidirectional ) ) {
			this.elements.backward.attr( disabled, true );

		} else {
			this.elements.backward.removeAttr( disabled );
		}

		if ( ( state.stepIndex === lastStepIndex && !state.step.attr( o.state ) ) ||
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

		// Calculate steps complete/possible excluding steps with the exclude class
		var f = function() { return !$( this ).hasClass( o.stepClasses.exclude ); },
			c = ( this.stepsActivated().filter( f ).length - 1 ),
			p = ( this.branchesActivated().children( selector.step ).filter( f ).length - 1 );

		state = $.extend( this.wizard, state, {
			stepsComplete: c,
			stepsPossible: p,
			stepsRemaining: ( p - c ),
			percentComplete: ( 100 * c / p )
		});

		this._trigger( afterSelect, event, state );

		if ( stepIndex !== -1 ) {
			this._trigger( state.movingForward ? afterForward : afterBackward, event, state );
		}
	},

	_updateActivated: function( state ) {
		var wizard = this.wizard;

		if ( state.movingForward ) {

			// No duplicate steps
			if ( $.inArray( state.stepIndex, wizard.stepsActivated ) < 0 ) {
				wizard.stepsActivated.push( state.stepIndex );
			}

			// No duplicate branches
			if ( $.inArray( state.branchLabel, wizard.branchesActivated ) < 0 ) {
				wizard.branchesActivated.push( state.branchLabel );
			}

		} else {
			var spliceIndex = $.inArray( state.stepIndex, wizard.stepsActivated ) + 1;

			// Don't remove the initial step
			if ( spliceIndex > 0 ) {
				wizard.stepsActivated.splice( spliceIndex );
			}

			if ( state.branchLabel !== wizard.branchLabel ) {
				var branchIndex = $.inArray( state.branchLabel, wizard.branchesActivated );

				// Don't remove the default branch
				if ( branchIndex > 0 ) {
					wizard.branchesActivated.splice( branchIndex, 1 );
				}
			}
		}
	},

	backward: function( howMany ) {

		// Can't go backward on first step
		if ( this.wizard.stepIndex === 0 ) {
			return;
		}

		var stepsActivated = this.wizard.stepsActivated,
			stepsActivatedIndex = Math.max( 0,
				( stepsActivated.length - 1 ) -
				( typeof howMany === number && howMany > 0 ? howMany : 1 ) );

		this._select( this.state( stepsActivated[ stepsActivatedIndex ] ) );
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
		var arr = this.wizard.branchesActivated,
			i = 0,
			l = arr.length,
			result = [];

		for ( ; i < l; i++ ) {
			result.push( this.branch( arr[ i ] )[ 0 ] );
		}

		return $( result );
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

		// Already on the last step
		if ( this.wizard.stepIndex === ( this.wizard.stepCount - 1 ) ) {
			return;
		}

		// TODO: normalize to max index
		howMany = typeof howMany === number && howMany > 0 ? howMany : 1;

		if ( howMany > 1 ) {
			this._fastForward( howMany, true );

		} else {
			this.transition(function( stepIndex ) {
				this._select( this.state( stepIndex ) );
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
		var state = this.state( step, branch );

		// Do we need to fastForward?
		if ( state.movingForward
			&& this.options.fastForward
			&& ( state.stepIndex - this.wizard.stepIndex ) > 1 ) {
			this._fastForward( state.stepIndex );

		} else {
			this._select( state );
		}
	},

	state: function( step, branch ) {

		// With no arguments, return the current state
		if ( !arguments.length ) {
			return this.wizard;
		}

		var $step = this.step( step, branch ),
			stepIndex = this.stepIndex( $step );

		if ( this.isValidStepIndex( stepIndex ) ) {
			var $branch = $step.parent();

			return {
				step: $step,
				stepIndex: stepIndex,
				branch: $branch,
				branchLabel: $branch.attr( id ),
				movingForward: stepIndex > this.wizard.stepIndex
			};
		}

		return null;
	},

	step: function( step, branch ) {

		// With no arguments, return current step
		if ( !arguments.length ) {
			return this.wizard.step;
		}

		var $step;

		// Searching for a step by index
		if ( typeof step === number ) {
			$step = this._find( step,
				// Search within branch, if defined, otherwise search all steps
				branch !== undefined ? this.steps( branch ) : this.elements.steps );

		// Searching for a step or branch by string ID, DOM element or jQuery object
		} else if ( step != null ) {
			$step = this._find( step, this.elements.steps.add( this.elements.branches ) );
		}

		if ( $step && $step.length ) {
			if ( $step.hasClass( className.branch ) ) {
				// If a branch is found, the arguments are essentially flip-flopped
				$step = this._find( branch || 0, this.steps( $step ) );
			}

		} else {
			this._error( "Could not find step" );
		}

		return $step;
	},

	stepIndex: function( step, branch, relative ) {
		// With no arguments, return current step index
		if ( !arguments.length ) {
			return this.wizard.stepIndex;
		}

		var $step;

		// Speed it up if we are given a jQuery object or DOM element
		if ( ( step instanceof jQuery && step.length ) || step.nodeType ) {
			$step = step;

		} else {
			$step = this.step( step, branch );
		}

		return ( relative ? $step.siblings( selector.step ) : this.elements.steps )
			// Relative to the steps within a branch, or all steps
			.index( $step );
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
		var arr = this.wizard.stepsActivated,
			i = 0,
			l = arr.length,
			result = [];

		for ( ; i < l; i++ ) {
			result.push( this.step( arr[ i ] )[ 0 ] );
		}

		return $( result );
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
			$step = step === undefined ? self.wizard.step : self.step( step );

		if ( !$.isFunction( action ) || !$step || !$step.length ) {
			return;
		}

		var state = $step.attr( o.state ),
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
