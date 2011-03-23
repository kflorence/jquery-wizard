// vim: set noexpandtab:

/**
 * A jQuery UI wizard that supports branching.
 *
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-ui-wizard/
 * @version 0.1.0
 *
 * Dual licensed under the MIT and BSD licenses.
 */
(function($, undefined) {
	var options, classes, elements,
		// Globalize re-used values for better minification
		__null = null,
		__true = true,
		__false = false,
		__number = "number",
		__default = "default",
		click = "click",
		submit = "submit",
		disabled = "disabled",
		backward = "backward",
		forward = "forward",
		first = "first",
		last = "last";

	$.widget("ui.wizard", {
		options: {
			step: 0,
			actions: {
				_default: function() {
					return this.index(this._$step.nextAll(classes.step));
				}
			},
			actionAttr: "data-action",
			validateOn: ":input",
			elements: {
				step: ".step",
				branch: ".branch",
				forward: "." + forward,
				backward: "." + backward,
				submit: ":" + submit
			},
			classes: {
				stop: "stop",
				start: "start",
				submit: submit,
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
			var $found, index,
				action = this._$step.attr(options.actionAttr) || "_" + __default,
				func = options.actions[action],
				response = $.isFunction(func) ? func.call(this, this._$step) : action;

			if (!this._validates(this._$step)) {
				return;
			}

			$found = this._search(response, typeof response == __number
				? this._$steps : this._$steps.add(this._$branches));

			if ($found !== undefined && $found.length) {
				if ($found.hasClass(elements.branch.substr(1))) {
					$found = this.steps($found).filter(":" + first);
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

			// Aids minification and convenience
			options = this.options;
			classes = options.classes;
			elements = options.elements;

			this._index = -1;
			this._progress = 0;
			this._activated = {
				steps: [],
				branches: []
			};

			this.update();

			// Add branch class to step container for default branch
			this._$steps.hide().parent().addClass(elements.branch.substr(1));

			this._$forward = $(elements.forward).unbind(click)
				.bind(click, function(event) {
					self.forward();
					event.preventDefault();
				}
			);

			this._$backward = $(elements.backward).unbind(click)
				.bind(click, function(event) {
					self.backward();
					event.preventDefault();
				}
			);

			this._$submit = $(elements.submit).unbind(click)
				.bind(click, function(event) {
					return self.submit(event);
				}
			);

			this.select(options.step);
		},

		_search: function(needle, haystack) {
			var $found, $haystack = $(haystack), type = typeof needle;

			if (needle !== undefined && $haystack.length) {
				if (type == __number) {
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
				forward = index > this._index,
				$branch = $step.parent(elements.branch),
				branch = $branch.attr("id") || __default,
				// Fixes #3583 - http://bugs.jquery.com/ticket/3583
				hideOptions = $.extend({}, options.animations.hide.options),
				showOptions = $.extend({}, options.animations.show.options),
				maxBranchIndex = this.index(
					$branch.children(elements.step).filter(":" + last)
				);

			if (this._$step) {
				if (!forward) {
					this._activated.steps.pop();

					if (branch !== this._branch) {
						var idx = $.inArray(this._branch, this._activated.branches);

						// Don't remove initial branch
						if (idx > 0) {
							this._activated.branches.splice(idx, 1);
						}
					}
				}

				this._$step.animate(
					options.animations.hide.properties, hideOptions
				).removeClass(classes.current);
			}

			if (forward || !this._$step) {
				this._activated.steps.push(index);

				if ($.inArray(branch, this._activated.branches) < 0) {
					this._activated.branches.push(branch);
				}
			}

			$step.animate(
				options.animations.show.properties, showOptions
			).addClass(classes.current);

			if ($step.hasClass(classes.start) || index === 0) {
				this._$backward.addClass(classes.disabled).attr(disabled, __true);
			} else {
				this._$backward.removeClass(classes.disabled).removeAttr(disabled);
			}

			if ($step.hasClass(classes.stop)
				|| (!$step.attr(options.actionAttr) && index === maxBranchIndex)) {
				this._$forward.addClass(classes.disabled).attr(disabled, __true);

				this._progress = 100;
			} else {
				this._$forward.removeClass(classes.disabled).removeAttr(disabled);

				var possible = 0;
				$.each(this._activated.branches, function(i, branch) {
					possible += self.steps(branch).length;
				});

				this._progress = Math.round(
					((this._activated.steps.length - 1) / (possible - 1)) * 100
				);
			}

			if ($step.hasClass(classes.submit)) {
				this._$submit.removeClass(classes.disabled).removeAttr(disabled);
			} else {
				this._$submit.addClass(classes.disabled).attr(disabled, __true);
			}

			this._$step = $step;
			this._index = index;
			this._$branch = $branch;
			this._branch = branch;

			this._trigger("select", __null, {
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
			if (index === __true) {
				return $step && $step.length
					// If relative is true, the index will be relative to the branch
					// containing the step, instead of relative to all steps.
					? (relative === __true ? $steps : this._$steps).index($step)
					: -1;
			}

			return $step;
		},

		_validates: function($scope) {
			var $inputs;

			if (this._enabled.validate
				|| (this._enabled.validate = !!this._$wizard.data("validator"))) {
				$scope = $scope && $scope.length ? $scope : this._$wizard;
				$inputs = $scope.find(options.validateOn);

				if ($inputs.length && !$inputs.valid()) {
					return __false;
				}
			}

			return __true;
		},

		activated: function(key) {
			return arguments.length ? this._activated[key] : this._activated;
		},

		backward: function(steps) {
			this.select(this._activated.steps[this._activated.steps.length - 2
				+ (typeof steps == __number ? steps : 0)]);
		},

		branch: function(branch) {
			return arguments.length ? this._search(branch, this._$branches)
				: this._$branch;
		},

		forward: function() {
			var action;

			if ((action = this._action())) {
				this._select(action.index, action.step);
			}
		},

		index: function(step, branch, relative) {
			return arguments.length ? this._step(step, branch, __true, relative)
				: this._currentStep;
		},

		isValidIndex: function(index) {
			return typeof index == __number && index >= 0 && index < this._length;
		},

		isValidStep: function(step) {
			return this.isValidIndex(this.index(step));
		},

		progress: function() {
			return this._progress;
		},

		select: function(step, branch) {
			var index = this.index(step, branch);

			if (this.isValidIndex(index)) {
				if (index !== this._index) {
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
			return this._length;
		},

		step: function(step, branch) {
			return arguments.length ? this._step(step, branch)
				: this._$step;
		},

		steps: function(branch) {
			return arguments.length ? this.branch(branch).children(elements.step)
				: this._$steps;
		},

		submit: function(event) {
			return this._validates() &&
				this._trigger(submit, event || _null, {
					form: this._$form,
					wizard: this._$wizard
				});
		},

		update: function() {
			this._$steps = this._$wizard.find(elements.step);
			this._$branches = this._$wizard.find(elements.branch).andSelf();
			this._length = this._$steps.length;

			this._trigger("update", __null, {
				steps: this._$steps,
				branches: this._$branches,
				length: this._length
			});
		}
	});
})(jQuery);
