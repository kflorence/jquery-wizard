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
	var count = 0, click = "click", disabled = "disabled",
		namespace = "ui-wizard", classes = {}, selectors = {};

	$.each(["branch", "form", "header", "step"], function() {
		selectors[this] = "." + (classes[this] = namespace + "-" + this);
	});

	$.widget(namespace.replace("-", "."), {
		options: {
			actions: {},
			actionAttribute: "data-action",
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
			defaultAction: function($step) {
				return this.index($step.nextAll(selectors.step));
			},
			forward: ".forward",
			headers: ".header",
			initialStep: 0,
			stepAttributes: {
				current: "current",
				stop: "stop",
				submit: "submit"
			},
			steps: ".step",
			submit: ":submit",
			wrappingElement: "<div>"
		},

		_action: function() {
			if (!this._validates()) {
				return;
			}

			var $found, index,
				o = this.options,
				action = this._$step.attr(o.actionAttribute),
				func = action ? o.actions[action] : o.defaultAction,
				response = $.isFunction(func) ? func.call(this, this._$step) : action;

			$found = this._search(response, typeof response == "number"
				? this._$steps : this._$steps.add(this._$branches));

			if ($found !== undefined && $found.length) {
				if ($found.hasClass(classes.branch)) {
					$found = this.steps($found).filter(":first");
				}

				index = this.index($found);
			}

			if (!this.isValidStepIndex(index)) {
				throw new Error(
					'Unexpected state encountered: ' +
					'action="' + action + '", ' +
					'response="' + response + '", ' +
					'index="' + index + '"'
				);

				return;
			}

			return {
				$step: $found,
				stepIndex: index
			};
		},

		_create: function() {
			this._pluginsDetected = {};

			this.element.addClass(namespace
				+ " ui-widget ui-widget-content ui-corner-all");
		},

		_init: function() {
			var self = this, o = this.options;

			this._activated = { $steps: [], $branches: [] };

			this._$form = this.element.find("form").addClass(classes.form);
			this._$branches = this.element.find(o.branches).addClass(classes.branch);
			this._$headers = this.element.find(o.headers)
				.addClass(classes.header + " ui-widget-header ui-helper-reset ui-corner-all");
			this._$steps = this.element.find(o.steps).hide()
				.addClass(classes.step + " ui-widget-content ui-corner-all");
			this._totalSteps = this._$steps.length;

			this._$defaultBranch = this._$steps.eq(0).parent().wrapInner(
				$(o.wrappingElement)
					.addClass(classes.branch)
					.attr("id", namespace + "-" + count++)
			);

			this._$forward = $(o.forward, this.element)
				.unbind(click).bind(click, function(event) {
					self.forward();
					event.preventDefault();
				}
			);

			this._$backward = $(o.backward, this.element)
				.unbind(click).bind(click, function(event) {
					self.backward();
					event.preventDefault();
				}
			);

			this._$submit = $(o.submit, this.element)
				.unbind(click).bind(click, function(event) {
					return self.submit(event);
				}
			);

			this.select(o.initialStep);
		},

		_search: function(needle, haystack) {
			var $found, $haystack = $(haystack), type = typeof needle;

			if (needle !== undefined && $haystack.length) {
				if (type == "number") {
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

		_select: function($step, stepIndex) {
			var self = this,
				o = this.options,
				$branch = $step.parents(selectors.branch),
				// Fixes #3583 - http://bugs.jquery.com/ticket/3583
				hideOptions = $.extend({}, o.animations.hide.options),
				showOptions = $.extend({}, o.animations.show.options),
				movingForward = stepIndex > this._stepIndex,
				indexOfLastStepInBranch = this.index(
					$branch.children(o.steps).filter(":last")
				);

			if (this._$step) {
				if (!movingForward) {
					this._activated.$steps.pop();

					if ($branch !== this._$branch) {
						var currentBranchIndex = $.inArray($branch, this._activated.$branches);

						// Don't remove the default branch
						if (currentBranchIndex > 0) {
							this._activated.$branches.splice(currentBranchIndex, 1);
						}
					}
				}

				this._$step.animate(
					o.animations.hide.properties, hideOptions
				).removeClass(o.stepAttributes.current);
			}

			if (movingForward || !this._$step) {
				this._activated.$steps.push($step);

				if ($.inArray($branch, this._activated.$branches) < 0) {
					this._activated.$branches.push($branch);
				}
			}

			$step.animate(
				o.animations.show.properties, showOptions
			).addClass(o.stepAttributes.current);

			$step.hasClass(o.stepAttributes.start) || stepIndex === 0
				? this._$backward.attr(disabled, true)
				: this._$backward.removeAttr(disabled);

			$step.hasClass(o.stepAttributes.stop)
				|| (!$step.attr(o.actionAttribute)
				&& stepIndex === indexOfLastStepInBranch)
				? this._$forward.attr(disabled, true)
				: this._$forward.removeAttr(disabled);

			$step.hasClass(o.stepAttributes.submit)
				? this._$submit.removeAttr(disabled)
				: this._$submit.attr(disabled, true);

			var totalPossibleSteps = 0;
			$.each(this._activated.$branches, function(i, $branch) {
				totalPossibleSteps += $branch.children(o.steps).length;
			});

			totalPossibleSteps = Math.max(totalPossibleSteps--, 0);

			$.extend(this, {
				_$step: $step,
				_$branch: $branch,
				_stepIndex: stepIndex
			});

			this._trigger("select", null, {
				currentStep: this._$step,
				currentBranch: this._$branch,
				currentStepIndex: this._stepIndex
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

		_validates: function() {
			if (this._pluginsDetected.validate
				|| (this._pluginsDetected.validate = !!this._$form.data("validator"))
				&& !this._$step.valid()) {
				return false;
			}

			return true;
		},

		activatedBranches: function() {
			return this._activated.$branches;
		},

		activatedSteps: function() {
			return this._activated.$steps;
		},

		backward: function(howMany) {
			var length = this._activated.$steps.length,
				index = (length - 1) - (typeof howMany == "number" ? howMany : 1),
				$step = this._activated.$steps[index < 0 ? 0 : index];

			this._select($step, this._$steps.index($step));
		},

		branch: function(branch) {
			return arguments.length ? this._search(branch, this._$branches)
				: this._$branch;
		},

		forward: function() {
			var next = this._action();

			next && this._select(next.$step, next.stepIndex);
		},

		index: function(step, branch, relative) {
			return arguments.length ? this._step(step, branch, true, relative)
				: this._stepIndex;
		},

		isValidStep: function(step) {
			return this.isValidIndex(this.index(step));
		},

		isValidStepIndex: function(index) {
			return typeof index == "number" && index >= 0 && index < this._totalSteps;
		},

		select: function(step, branch) {
			var index = this.index(step, branch);

			if (this.isValidStepIndex(index)) {
				if (index !== this._index) {
					this._select(this._$steps.eq(index), index);
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

		step: function(step, branch) {
			return arguments.length ? this._step(step, branch) : this._$step;
		},

		steps: function(branch) {
			return arguments.length ? this.branch(branch).children(selectors.step)
				: this._$steps;
		},

		submit: function(event) {
			return this._validates() &&
				this._trigger("submit", event || null, {
					form: this._$form
				});
		},

		totalSteps: function() {
			return this._totalSteps;
		}
	});
})(jQuery);
