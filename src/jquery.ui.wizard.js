/**
 * A jQuery UI wizard that supports branching.
 *
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-ui-wizard/
 * @version 0.2.1
 *
 * Dual licensed under the MIT and BSD licenses.
 */

(function( $, undefined ) {

var count = 0,
	selector = {},
	className = {},

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
			return this.index( $step.nextAll( selector.step ) );
		},
		enableSubmit: false,
		forward: ".forward",
		fastForward: true,
		header: ":header:first",
		initialStep: 0,
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

	_action: function( $step ) {
		if ( $step || ( $step = this.wizard.step ) ) {
			var action = $step.attr( this.options.actionAttribute ),
				func = action ? this.options.actions[ action ] : this.options.defaultAction;

			return $.isFunction( func ) ? func.call( this, $step ) : action;
		} else {
			throw new Error( 'Unexpected state encountered: step not selected.' );
		}
	},

	_create: function() {
		var self = this,
			o = self.options,
			$element = self.element
				.addClass( namespace + " " + widgetClasses ),
			$elements = self.elements = {},
			$form = $element[ 0 ].elements ? $element :
				$element.find( form ) || $element.closest( form ),
			$steps = $element.find( o.steps );

		$.extend( $elements, {
			form: $form.addClass( className.form ),
			submit: $form.find( o.submit ),
			forward: $form.find( o.forward ),
			backward: $form.find( o.backward ),
			header: $element.find( o.header ).addClass( className.header + " " + headerClasses ),
			steps: $element.find( o.steps ).hide().addClass( className.step + " " + stepClasses ),
			stepsWrapper: $steps.parent().addClass( className.wrapper + " " + o.branches.substr( 1 ) ),
			branches: $element.find( o.branches ).addClass( className.branch )
		});

		if ( !$elements.stepsWrapper.attr( id ) ) {
			// stepsWrapper must have an ID as it also functions as the default branch
			$elements.stepsWrapper.attr( id, namespace + "-" + ++count );
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
			stepCount: $elements.steps.length,
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

	_fastForward: function( toIndex ) {
		var response,
			trail = [],
			uiHash = this._uiHash( this.wizard.stepIndex );

		// We are assuming that we won't overstep toIndex on the way there
		while( uiHash.stepIndex < toIndex ) {
			// Faulty actions return undefined.  This section will need updating
			// when asynchronous actions are fully supported
			if ( ( response = this._action( uiHash.step ) ) !== undefined ) {
				// Invalid responses will yield a null uiHash
				if ( ( uiHash = this._uiHash( this._index( response ) ) ) !== null ) {
					trail.push( uiHash );
					continue;
				}
			}

			break;
		}

		if ( uiHash.stepIndex === toIndex ) {
			while ( ( uiHash = trail.shift() ) !== undefined ) {
				this._updateActivated( uiHash );
			}
			console.log(this.wizard);
		} else {
			throw new Error(
				'Fast forward failed on ' +
				'stepIndex="' + uiHash.stepIndex + '", ' +
				'toIndex="' + toIndex + '"'
			);
		}
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

	_index: function( step, branch ) {
		var stepIndex;

		// Most common use case is selecting a step by index
		if ( typeof step === number ) {
			stepIndex = this.index( step, branch, true );

		// Otherwise, we could be selecting a step or branch by ID, DOM
		// element or jQuery object. In this case, the 'branch' argument
		// could become a step index.
		} else if ( step != null ) {
			step = this._find( step, this.elements.steps.add( this.elements.branches ) );

			if ( step !== null && step.length ) {
				if ( step.hasClass( className.branch ) ) {
					step = this.steps( step ).eq( typeof branch === number ? branch : 0 );
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

	_select: function( stepIndex ) {
		var o = this.options,
			uiHash = this._uiHash( stepIndex ),
			lastStepIndex = this.index( this.steps( uiHash.branch ).filter( ":last" ) ),
			// FIXME
			event = null;

		if ( typeof stepIndex !== number || stepIndex === this.wizard.stepIndex
			|| !this._trigger( beforeSelect, event, uiHash )
			|| uiHash.movingForward && !this._trigger( beforeForward, event, uiHash )
			|| !uiHash.movingForward && !this._trigger( beforeBackward, event, uiHash ) ) {
			return;
		}

		// Use fastForwarding if enabled and going more than one step forward
		if ( uiHash.movingForward && o.fastForward
			&& ( stepIndex - this.wizard.stepIndex ) > 1 ) {
			this._fastForward( stepIndex );

		// Otherwise, just select the one step
		} else {
			this._updateActivated( uiHash );
		}

		if ( this.wizard.step ) {
			this.wizard.step.removeClass( o.stepClasses.current )
				.animate( o.animations.hide.properties,
					// Fixes #3583 - http://bugs.jquery.com/ticket/3583
					$.extend( {}, o.animations.hide.options ) );
		}

		uiHash.step.addClass( o.stepClasses.current )
			.animate( o.animations.show.properties,
				// Fixes #3583 - http://bugs.jquery.com/ticket/3583
				$.extend( {}, o.animations.show.options ) );

		if ( stepIndex === 0 || o.unidirectional
			|| uiHash.step.hasClass( o.stepClasses.unidirectional ) ) {
			this.elements.backward.attr( disabled, true );
		} else {
			this.elements.backward.removeAttr( disabled );
		}

		if ( ( stepIndex === lastStepIndex && !uiHash.step.attr( o.actionAttribute ) )
			|| uiHash.step.hasClass( o.stepClasses.stop ) ) {
			this.elements.forward.attr( disabled, true );
		} else {
			this.elements.forward.removeAttr( disabled );
		}

		if ( o.enableSubmit || uiHash.step.hasClass(o.stepClasses.submit ) ) {
			this.elements.submit.removeAttr( disabled );
		} else {
			this.elements.submit.attr( disabled, true );
		}

		// Calculate steps complete/possible excluding steps with the exclude class
		var f = function() { return !$( this ).hasClass( o.stepClasses.exclude ); },
			c = ( this.stepsActivated().filter( f ).length - 1 ),
			p = ( this.branchesActivated().children( selector.step ).filter( f ).length - 1 );

		$.extend( this.wizard, uiHash, {
			stepsComplete: c,
			stepsPossible: p,
			stepsRemaining: ( p - c ),
			percentComplete: ( 100 * c / p )
		});

		this._trigger( afterSelect, event, this.wizard );
		this._trigger( uiHash.movingForward ? afterForward : afterBackward, event, this.wizard );
	},

	_step: function( step, branch, index, relative ) {
		var $steps = branch === undefined ? this.elements.steps : this.steps( branch ),
			$step = this._find( step, $steps );

		// If index is true, we return the step index instead of the step itself
		if ( index === true ) {
			return $step && $step.length ?
				// If relative is true, the index will be relative to the branch
				// containing the step, instead of relative to all steps.
				( relative === true ? $steps : this.elements.steps ).index( $step ) : -1;
		}

		return $step;
	},

	_uiHash: function( stepIndex ) {
		if ( this.isValidStepIndex( stepIndex ) ) {
			var $step = this.elements.steps.eq( stepIndex ),
				$branch = $step.closest( selector.branch );

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

	_updateActivated: function( uiHash ) {
		if ( uiHash.movingForward ) {
			this.wizard.stepsActivated.push( uiHash.stepIndex );

			if ( $.inArray( uiHash.branchLabel, this.wizard.branchesActivated ) < 0 ) {
				this.wizard.branchesActivated.push( uiHash.branchLabel );
			}
		} else {
			var spliceIndex = $.inArray( uiHash.stepIndex, this.wizard.stepsActivated ) + 1;

			// Don't remove the initial step
			if ( spliceIndex > 0 ) {
				this.wizard.stepsActivated.splice( spliceIndex );
			}

			if ( uiHash.branchLabel !== this.wizard.branchLabel ) {
				var branchIndex = $.inArray( uiHash.branchLabel, this.wizard.branchesActivated );

				// Don't remove the default branch
				if ( branchIndex > 0 ) {
					this.wizard.branchesActivated.splice( branchIndex, 1 );
				}
			}
		}
	},

	backward: function( howMany ) {
		var stepsActivated = this.wizard.stepsActivated;

		this._select( stepsActivated[ Math.max( 0,
			( stepsActivated.length - 1 ) -
			( typeof howMany === number && howMany > 0 ? howMany : 1 ) ) ] );
	},

	branch: function( branch ) {
		return arguments.length ?
			this._find( branch, this.elements.branches ) : this.elements.branch;
	},

	branches: function( branch ) {
		return arguments.length ?
			this.branch( branch ).children( selector.branch ) : this.elements.branches;
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
		this.element.removeClass( namespace + " " + widgetClasses );
		this.elements.form.removeClass( className.form );
		this.elements.header.removeClass( className.header + " " + headerClasses );
		this.elements.steps.show().removeClass( className.step + " " + stepClasses );
		this.elements.stepsWrapper.removeClass( className.wrapper + " " + o.branches.substr( 1 ) );
		this.elements.branches.removeClass( className.branch );

		$.Widget.prototype.destroy.call( this );
	},

	form: function() {
		return this.elements.form;
	},

	forward: function( howMany ) {
		var response;

		if ( ( response = this._action() ) !== undefined ) {
			this.select( response );
		}
	},

	index: function( step, branch, relative ) {
		return arguments.length ? this._step( step, branch, true, relative ) : this.wizard.stepIndex;
	},

	isValidStep: function( step ) {
		return this.isValidStepIndex( this.index( step ) );
	},

	isValidStepIndex: function( stepIndex ) {
		return typeof stepIndex === number && stepIndex >= 0
			&& stepIndex < this.wizard.stepCount;
	},

	percentComplete: function() {
		return this.wizard.percentComplete;
	},

	select: function( step, branch ) {
		this._select( this._index( step, branch ) );
	},

	step: function( step, branch ) {
		return arguments.length ? this._step( step, branch ) :
			this.wizard.$step;
	},

	stepCount: function() {
		return this.wizard.stepCount;
	},

	steps: function( branch ) {
		return arguments.length ?
			this.branch( branch ).children( selector.step ) : this.elements.steps;
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
	}
});

})( jQuery );
