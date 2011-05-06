/**
 * A jQuery UI wizard that supports branching.
 *
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-ui-wizard/
 * @version 0.1.0
 *
 * Dual licensed under the MIT and BSD licenses.
 */

(function( $, undefined ) {

var count = 0,
	classes = {},
	click = "click",
	disabled = "disabled",
	namespace = "ui-wizard",

	// Used to detect if stepsWrapper is an HTML fragment or a selector
	rhtmlstring = /^(?:[^<]*(<[\w\W]+>)[^>]*$)/,
	selectors = {},
	submit = "submit";

$.each( "branch form header step".split( " " ), function() {
	selectors [ this ] = "." + ( classes[ this ] = namespace + "-" + this );
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

	_action: function() {
		var $found, index,
			o = this.options,
			action = this._$step.attr( o.actionAttribute ),
			func = action ? o.actions[ action ] : o.defaultAction,
			response = $.isFunction( func ) ? func.call( this, this._$step ) : action;

		if ( response === false ) {
			return;
		}

		$found = this._search( response, typeof response === "number" ?
			this._$steps : this._$steps.add( this._$branches ) );

		if ( $found !== undefined && $found.length ) {
			if ( $found.hasClass( classes.branch ) ) {
				$found = this.steps( $found ).filter( ":first" );
			}

			index = this.index( $found );
		}

		if ( !this.isValidStepIndex( index ) ) {
			throw new Error( 'Unexpected state encountered: ' +
				'action="' + action + '", ' +
				'response="' + response + '", ' +
				'index="' + index + '"' );

			return;
		}

		return index;
	},

	_create: function() {
		this._stepIndex = -1;
		this.element.addClass( namespace +
			" ui-widget ui-widget-content ui-corner-all" );
	},

	_init: function() {
		var o = this.options,
			self = this;

		this._activated = { steps: [], branches: [] };
		this._stepsComplete = this._stepsPossible = this._stepsRemaining =
			this._percentComplete = 0;

		this._$header = this.element.find( o.header ).addClass( classes.header +
			" ui-widget-header ui-helper-reset ui-corner-all" );

		this._$steps = this.element.find( o.steps ).hide().addClass( classes.step +
			" ui-widget-content ui-corner-all" );

		this._stepCount = this._$steps.length;

		this._$branch = $( o.stepsWrapper ).addClass( o.branches.substr( 1 ) );

		if ( !this._$branch.attr( "id" ) ) {
			this._$branch.attr( "id", namespace + "-" + count++ );
		}

		if ( rhtmlstring.test( o.stepsWrapper ) ) {
			// Wrap steps with the provided HTML string fragment
			this._$steps.eq( 0 ).parent().wrapInner( this._$branch );
		}

		this._$branches = this.element.find( o.branches ).addClass( classes.branch );

		this._$form = ( this.element[0].elements ? this.element :
			this.element.find( "form" ) || this.element.closest( "form" ) )
			.addClass( classes.form ).unbind( submit ).bind( submit, function( event ) {
				return self._trigger( "beforeSubmit" );
			});

		this._$forward = this._$form.find( o.forward )
			.unbind( click ).bind( click, function( event ) {
				self.forward( event );
			});

		this._$backward = this._$form.find( o.backward )
			.unbind( click ).bind( click, function( event ) {
				self.backward( event );
			});

		this._$submit = this._$form.find( o.submit )
			.unbind( click ).bind( click, function( event ) {
				self._$form.trigger( submit );
				event.preventDefault();
			});

		this.select( o.initialStep );
	},

	_search: function( needle, haystack ) {
		var $found,
			$haystack = haystack instanceof jQuery ? haystack : $( haystack ),
			type = typeof needle;

		if ( needle !== undefined && $haystack.length ) {
			if ( type === "number" ) {
				$found = $haystack.eq( needle );
			} else if ( type === "string" ) {
				$found = $haystack.filter( needle[ 0 ] == "#" ? needle : "#" + needle );
			} else if ( type === "object" ) {
				if ( needle instanceof jQuery && needle.length ) {
					needle = needle[ 0 ];
				}

				// Make sure we have a DOM object
				if ( needle.nodeType ) {
					$found = $haystack.filter(function() {
						return this === needle;
					});
				}
			}
		}

		return $found;
	},

	_select: function( stepIndex ) {
		var o = this.options,
			$step = this._$steps.eq( stepIndex ),
			$branch = $step.parents( selectors.branch ),
			indexOfLastStepInBranch = this.index(
				$branch.children( o.steps ).filter( ":last" ) ),
			movingForward = stepIndex > this._stepIndex;

		// Allow before triggers to cancel this selection
		if ( !this._trigger( "beforeSelect" )
			|| movingForward && !this._trigger( "beforeForward" )
			|| !movingForward && !this._trigger( "beforeBackward" ) ) {
			return;
		}

		if ( this._$step ) {
			this._$step.animate( o.animations.hide.properties,
					// Fixes #3583 - http://bugs.jquery.com/ticket/3583
					$.extend( {}, o.animations.hide.options ) )
				.removeClass( o.stepClasses.current );
		}

		$step.animate( o.animations.show.properties,
				// Fixes #3583 - http://bugs.jquery.com/ticket/3583
				$.extend( {}, o.animations.show.options ) )
			.addClass( o.stepClasses.current );

		if ( stepIndex === 0 || o.unidirectional
			|| $step.hasClass( o.stepClasses.unidirectional ) ) {
			this._$backward.attr( disabled, true );
		} else {
			this._$backward.removeAttr( disabled );
		}

		if ( ( stepIndex === indexOfLastStepInBranch
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

		this._updateActivated( $step, $branch, stepIndex, movingForward );
		this._updateProgress();

		this._$step = $step;
		this._$branch = $branch;
		this._stepIndex = stepIndex;

		this._trigger( "afterSelect" );

		if ( movingForward ) {
			this._trigger( "afterForward" );
		} else {
			this._trigger( "afterBackward" );
		}
	},

	_step: function( step, branch, index, relative ) {
		// Allow for the omission of branch argument
		if ( typeof branch === "boolean" ) {
			relative = index;
			index = branch;
			branch = undefined;
		}

		var $steps = branch ? this.steps( branch ) : this._$steps,
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

	_updateActivated: function( $step, $branch, stepIndex, movingForward ) {
		var branchID = $branch.attr( "id" );

		if ( movingForward ) {
			this._activated.steps.push( stepIndex );

			if ( $.inArray( branchID, this._activated.branches ) < 0 ) {
				this._activated.branches.push( branchID );
			}
		} else {
			var spliceIndex = $.inArray( stepIndex, this._activated.steps ) + 1;

			// Don't remove the initial step
			if ( spliceIndex > 0 ) {
				this._activated.steps.splice( spliceIndex );
			}

			if ( branchID !== this._$branch.attr( "id" ) ) {
				var currentBranchIndex = $.inArray( branchID, this._activated.branches );

				// Don't remove the default branch
				if ( currentBranchIndex > 0 ) {
					this._activated.branches.splice( currentBranchIndex, 1 );
				}
			}
		}
	},

	_updateProgress: function() {
		var o = this.options,
			complete = this.stepsActivated().filter(function() {
				return !$( this ).hasClass( o.stepClasses.exclude );
			}).length,
			possible = this.branchesActivated().children( o.steps ).filter(function() {
				return !$( this ).hasClass( o.stepClasses.exclude );
			}).length;

		this._stepsComplete = Math.max( 0, complete - 1 );
		this._stepsPossible = Math.max( 0, possible - 1 );
		this._stepsRemaining = this._stepsPossible - this._stepsComplete;
		this._percentComplete = 100 * this._stepsComplete / this._stepsPossible;
	},

	backward: function( event, howMany ) {
		// Allow for the omission of event
		if (typeof event === "number") {
			howMany = event;
			event = undefined;
		}

		this.select( this._activated.steps[
			( this._activated.steps.length - 1 ) -
			( typeof howMany === "number" ? howMany : 1 ) ] );
	},

	branch: function( branch ) {
		return arguments.length ? this._search( branch, this._$branches ) : this._$branch;
	},

	branches: function( branch ) {
		return arguments.length ? this.branch( branch ).children( selectors.branches ) :
			this._$branches;
	},

	branchesActivated: function() {
		var i = 0,
			length = this._activated.branches.length,
			result = [];

		for ( ; i < length; i++ ) {
			result.push( this.branch( this._activated.branches[ i ] ).get( 0 ) );
		}

		return $( result );
	},

	form: function() {
		return this._$form;
	},

	forward: function( event ) {
		this.select( this._action() );
	},

	index: function( step, branch, relative ) {
		return arguments.length ? this._step( step, branch, true, relative ) :
			this._stepIndex;
	},

	isValidStep: function( step ) {
		return this.isValidStepIndex( this.index( step ) );
	},

	isValidStepIndex: function( stepIndex ) {
		return typeof stepIndex === "number" && stepIndex >= 0
			&& stepIndex < this._stepCount;
	},

	percentComplete: function() {
		return this._percentComplete;
	},

	select: function( step, branch ) {
		var stepIndex = typeof step === "number" ?
			step : this.index( step, branch );

		if ( this.isValidStepIndex( stepIndex ) ) {
			if ( stepIndex !== this._stepIndex ) {
				this._select( stepIndex );
			}

		// Ignore 'undefined' as it may be returned from an action
		} else if ( step !== undefined ) {
			throw new Error( 'Cannot move to step: ' +
				'step="' + step + '", ' +
				'stepIndex="' + stepIndex + '", ' +
				'branch="' + branch + '"'
			);
		}
	},

	step: function( step, branch ) {
		return arguments.length ? this._step( step, branch ) : this._$step;
	},

	stepCount: function() {
		return this._stepCount;
	},

	steps: function( branch ) {
		return arguments.length ? this.branch( branch ).children( selectors.step ) :
			this._$steps;
	},

	stepsActivated: function() {
		var i = 0,
			length = this._activated.steps.length,
			result = [];

		for ( ; i < length; i++ ) {
			result.push( this.step( this._activated.steps[ i ] ).get( 0 ) );
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
