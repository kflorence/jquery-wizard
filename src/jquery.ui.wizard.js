// vim: set noexpandtab:
/**
 * @fileOverview jquery.ui.wizard.js
 *
 * A jQuery UI wizard that supports branching.
 *
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-merlin/
 * @version 0.1.0
 *
 * Dual licensed under the MIT and BSD licenses.
 */
(function($, undefined) {
	// For better minification
	var options, classes, elements,
		click = "click", disabled = "disabled", num = "number";

	$.widget("ui.wizard", {
		options: {
			step: 0,
			submit: null,
			action: "data-action",
			actions: {},
			defaultAction: null,
			elements: {
				step: ".step",
				branch: ".branch",
				forward: ".forward",
				backward: ".backward",
				submit: ":submit"
			},
			classes: {
				stop: "stop",
				start: "start",
				submit: "submit",
				current: "current",
				disabled: disabled
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
			}
		},

		_action: function() {
			var action, actionFunc, response, $found, index;

			if ((this._enabled.validate = !!this._$wizard.data("validator"))) {
				var $inputs = this._$currentStep.find(":input");

				if ($inputs.length && !$inputs.valid()) {
					return;
				}
			}

			if ((action = this._$currentStep.attr(options.action))) {
				if ((actionFunc = options.actions[action])) {
					response = actionFunc.call(this, this._$currentStep);
				} else {
					response = action;
				}
			} else {
				action = "defaultAction";
				response = options.defaultAction.call(this, this._$currentStep);
			}

			$found = this._search(response, typeof response == num
				? this._$steps : this._$steps.add(this._$branches));

			if ($found !== undefined && $found.length) {
				if ($found.hasClass(elements.branch.substr(1))) {
					$found = this.steps($found).filter(":first");
				}

				index = this.index($found);
			}

			if (!this.isValidIndex(index)) {
				throw new Error(
					'Unexpected state encountered: ' +
					'action="' + action + '", ' +
					'response="' + response + '", ' +
					'index="' + index + '"'
				);

				return;
			}

			return { index: index, step: $found };
		},

		_create: function() {
			this._enabled = {};
			this._$wizard = this.element;
			this._$form = this.element[0].elements.length
				? this.element : this.element.find("form");
		},

		_init: function() {
			var self = this;

			options = this.options;
			classes = options.classes;
			elements = options.elements;

			this.update();

			this._path = [];
			this._currentIndex = -1;

			// Add branch class to step container for default branch
			this._$steps.hide().parent().addClass(elements.branch.substr(1));

			this._$forward = $(elements.forward).unbind(click)
				.bind(click, function(event) {
					event.preventDefault();
					self.forward();
				}
			);

			this._$backward = $(elements.backward).unbind(click)
				.bind(click, function(event) {
					event.preventDefault();
					self.backward();
				}
			);

			this._$submit = $(elements.submit).unbind(click)
				.bind(click, function(event) {
					self.submit();
				}
			);

			if (!$.isFunction(options.defaultAction)) {
				options.defaultAction = function($step) {
					return this.index($step.nextAll(classes.step));
				};
			}

			this.select(options.step);
		},

		_search: function(needle, haystack) {
			var $found, $haystack = $(haystack), type = typeof needle;

			if (type != "undefined" && $haystack.length) {
				if (type == num) {
					$found = $haystack.eq(needle);
				} else if (type == "string") {
					$found = $haystack.filter(
						needle.charAt(0) == "#" ? needle : "#" + needle
					);
				} else if (type == "object") {
					// Extract DOM object from jQuery object
					if (needle.hasOwnProperty
						&& needle instanceof jQuery
						&& needle.length) {
						needle = needle.get(0);
					}

					// Make sure we have a DOM object
					if (needle.nodeType) {
						$found = $haystack.filter(function() {
							return this === needle;
						});
					}
				}
			}

			return $found;
		},

		_select: function(index, $step) {
			var self = this,
				forward = index > this._currentIndex,
				$branch = $step.parent(options.elements.branch),
				$last = this.steps($branch).filter(":last"),
				lastIndex = this.index($last),
				// Fixes #3583 - http://bugs.jquery.com/ticket/3583
				hideOptions = $.extend({}, options.animations.hide.options),
				showOptions = $.extend({}, options.animations.show.options);

			if (this._$currentStep) {
				if (!forward) {
					this._path.pop();
				}

				this._$currentStep.animate(
					options.animations.hide.properties, hideOptions
				).removeClass(classes.current);
			}

			if (forward || !this._$currentStep) {
				this._path.push(index);
			}

			$step.animate(
				options.animations.show.properties, showOptions
			).addClass(classes.current);

			if ($step.hasClass(classes.start) || index === 0) {
				this._$backward.addClass(classes.disabled).attr(disabled, true);
			} else {
				this._$backward.removeClass(classes.disabled).removeAttr(disabled);
			}

			if ($step.hasClass(classes.stop)
				|| (index === lastIndex && !$step.attr(options.action))) {
				this._$forward.addClass(classes.disabled).attr(disabled, true);
				this._progress = (index / lastIndex + 1) * 100;
			} else {
				this._$forward.removeClass(classes.disabled).removeAttr(disabled);
				this._progress = (index / this._totalSteps) * 100;
			}

			if ($step.hasClass(classes.submit)) {
				this._$submit.removeClass(classes.disabled).removeAttr(disabled);
			} else {
				this._$submit.addClass(classes.disabled).attr(disabled, true);
			}

			this._$currentStep = $step;
			this._currentIndex = index;
			this._$currentBranch = $branch;

			this._trigger("selected", undefined, {
				step: $step,
				branch: $branch,
				index: index,
				progress: this._progress
			});
		},

		_step: function(step, branch, index, relative) {
			// Allow for the omission of branch argument
			if (typeof branch === "boolean") {
				relative = index;
				index = branch;
				branch = undefined;
			}

			var $steps = branch ? this.steps(branch) : this._$steps,
				$step = this._search(step, $steps);

			// If index is true, we return the step index instead of the step itself
			if (index === true) {
				return $step && $step.length
					// If relative is true, the index will be relative to the branch
					// containing the step, instead of relative to all steps.
					? (relative === true ? $steps : this._$steps).index($step)
					: -1;
			}

			return $step;
		},

		backward: function() {
			this.select(this._path[this._path.length - 2]);
		},

		branch: function(branch) {
			return arguments.length ? this._search(branch, this._$branches)
				: this._$currentBranch;
		},

		forward: function() {
			var action;

			if ((action = this._action())) {
				this._select(action.index, action.step);
			}
		},

		index: function(step, branch, relative) {
			return arguments.length ? this._step(step, branch, true, relative)
				: this._currentStep;
		},

		isValidIndex: function(index) {
			return typeof index == num && index >= 0 && index < this._totalSteps;
		},

		isValidStep: function(step) {
			return this.isValidIndex(this.index(step));
		},

		path: function(index) {
			return arguments.length ? this._path[index] : this._path;
		},

		progress: function() {
			return this._progress;
		},

		select: function(step, branch) {
			var index = this.index(step, branch);

			if (this.isValidIndex(index)) {
				if (index !== this._currentIndex) {
					this._select(index, this._$steps.eq(index));
				}
			} else {
				throw new Error(
					'Unable to find step: ' +
					'step="' + step + '", ' +
					'branch="' + branch + '", ' +
					'index="' + index + '"'
				);
			}
		},

		size: function() {
			return this._totalSteps;
		},

		step: function(step, branch) {
			return arguments.length ? this._step(step, branch)
				: this._$currentStep;
		},

		steps: function(branch) {
			return arguments.length ? this.branch(branch).find(elements.step)
				: this._$steps;
		},

		submit: function() {
			if (this._$form.length) {
				if ($.isFunction(options.submit)) {
					options.submit.apply(this, arguments);
				} else {
					this._$form.submit();
				}
			}
		},

		update: function() {
			this._$steps = this._$wizard.find(elements.step);
			this._$branches = this._$wizard.find(elements.branch).andSelf();
			this._totalSteps = this._$steps.length;
		}
	});
})(jQuery);
