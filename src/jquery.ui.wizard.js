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
			actionDefault: function($step) {
				return this.index($step.nextAll(selectors.step));
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
			headers: ".header",
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
		},

		_action: function() {
			if (!this._validates()) {
				return;
			}

			var o = this.options,
				index,
				$found,
				action = this._$step.attr(o.actionAttribute),
				func = action ? o.actions[action] : o.actionDefault,
				response = $.isFunction(func) ? func.call(this, this._$step) : action;

			if (response === false) {
				return;
			}

			$found = this._search(response, typeof response == "number" ?
					this._$steps : this._$steps.add(this._$branches));

			if ($found !== undefined && $found.length) {
				if ($found.hasClass(classes.branch)) {
					$found = this.steps($found).filter(":first");
				}

				index = this.index($found);
			}

			if (!this.isValidStepIndex(index)) {
				throw new Error('Unexpected state encountered: ' +
						'action="' + action + '", ' +
						'response="' + response + '", ' +
						'index="' + index + '"');

				return;
			}

			return { $step: $found, stepIndex: index };
		},

		_create: function() {
			this._stepIndex = -1;
			this._pluginsDetected = {};
			this.element.addClass(namespace +
					" ui-widget ui-widget-content ui-corner-all");
		},

		_init: function() {
			var self = this,
				o = this.options;

			this._activated = { steps: [], branches: [] };
			this._stepsComplete = this._stepsPossible = this._stepsRemaining =
					this._percentComplete = 0;

			this._$form = this.element.find("form").addClass(classes.form);

			this._$headers = this.element.find(o.headers).addClass(classes.header +
					" ui-widget-header ui-helper-reset ui-corner-all");

			this._$steps = this.element.find(o.steps).hide().addClass(classes.step +
					" ui-widget-content ui-corner-all");

			this._stepCount = this._$steps.length;

			this._$defaultBranch = this._$steps.eq(0).parent()
					.wrapInner($(o.stepsWrapper)
						.addClass(o.branches.substr(1))
						.attr("id", namespace + "-" + count++));

			this._$branches = this.element.find(o.branches).addClass(classes.branch);

			this._$forward = $(o.forward, this.element).unbind(click)
					.bind(click, function(e) {
						self.forward();
						e.preventDefault();
					});

			this._$backward = $(o.backward, this.element).unbind(click)
					.bind(click, function(e) {
						self.backward();
						e.preventDefault();
					});

			this._$submit = $(o.submit, this.element).unbind(click)
					.bind(click, function(event) {
						return self.submit(event);
					});

			this.select(o.initialStep);
		},

		_search: function(needle, haystack) {
			var $found,
				$haystack = $.isjQuery(haystack) ? haystack : $(haystack),
				type = typeof needle;

			if (needle !== undefined && $haystack.length) {
				if (type == "number") {
					$found = $haystack.eq(needle);
				} else if (type == "string") {
					$found = $haystack.filter(needle.charAt(0) == "#" ?
							needle : "#" + needle);
				} else if (type == "object") {
					// Extract DOM object from jQuery object
					if ($.isjQuery(needle) && needle.length) {
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
				branchID = $branch.attr("id"),
				// Fixes #3583 - http://bugs.jquery.com/ticket/3583
				hideOptions = $.extend({}, o.animations.hide.options),
				showOptions = $.extend({}, o.animations.show.options),
				movingForward = stepIndex > this._stepIndex,
				indexOfLastStepInBranch = this.index($branch.children(o.steps)
						.filter(":last"));

			if (this._stepIndex > -1) {
				if (!movingForward) {
					this._activated.steps.pop();

					if (branchID !== this._$branch.attr("id")) {
						var currentBranchIndex = $.inArray(branchID, this._activated.branches);

						// Don't remove the default branch
						if (currentBranchIndex > 0) {
							this._activated.branches.splice(currentBranchIndex, 1);
						}
					}
				}

				this._$step.animate(o.animations.hide.properties, hideOptions)
						.removeClass(o.stepClasses.current);
			}

			if (movingForward) {
				this._activated.steps.push(stepIndex);

				if ($.inArray(branchID, this._activated.branches) < 0) {
					this._activated.branches.push(branchID);
				}
			}

			$step.animate(o.animations.show.properties, showOptions)
					.addClass(o.stepClasses.current);

			stepIndex === 0 || o.unidirectional
					|| $step.hasClass(o.stepClasses.unidirectional) ?
					this._$backward.attr(disabled, true) :
					this._$backward.removeAttr(disabled);

			(stepIndex === indexOfLastStepInBranch && !$step.attr(o.actionAttribute))
					|| $step.hasClass(o.stepClasses.stop) ?
					this._$forward.attr(disabled, true) :
					this._$forward.removeAttr(disabled);

			this._$form.length && (o.enableSubmit
					|| $step.hasClass(o.stepClasses.submit)) ?
					this._$submit.removeAttr(disabled) :
					this._$submit.attr(disabled, true);

			$.extend(this, {
				_$step: $step,
				_$branch: $branch,
				_stepIndex: stepIndex
			});

			this._updateProgress();

			this._trigger("select", null, {
				currentStep: this._$step,
				currentBranch: this._$branch,
				currentStepIndex: this._stepIndex,
				stepsComplete: this._stepsComplete,
				stepsPossible: this._stepsPossible,
				stepsRemaining: this._stepsRemaining,
				percentComplete: this._percentComplete
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
				return $step && $step.length ?
					// If relative is true, the index will be relative to the branch
					// containing the step, instead of relative to all steps.
					(relative === true ? $steps : this._$steps).index($step) : -1;
			}

			return $step;
		},

		_updateProgress: function() {
			var self = this,
				o = this.options;

			this._stepsComplete = Math.max(this.stepsActivated().filter(function() {
						return !$(this).hasClass(o.stepClasses.exclude);
					}).length - 1, 0);

			this._stepsPossible = Math.max(this.branchesActivated().children(o.steps)
					.filter(function() {
						return !$(this).hasClass(o.stepClasses.exclude);
					}).length - 1, 0);

			this._stepsRemaining = this._stepsPossible - this._stepsComplete;
			this._percentComplete = 100 * this._stepsComplete / this._stepsPossible;
		},

		_validates: function() {
			if (this._pluginsDetected.validate
					|| (this._pluginsDetected.validate = !!this._$form.data("validator"))
					&& !this._$step.valid()) {
				return false;
			}

			return true;
		},

		backward: function(howMany) {
			var length = this._activated.steps.length,
				index = (length - 1) - (typeof howMany == "number" ? howMany : 1),
				$step = this.step(this._activated.steps[index < 0 ? 0 : index]);

			this._select($step, this._$steps.index($step));
		},

		branch: function(branch) {
			return arguments.length ? this._search(branch, this._$branches) :
					this._$branch;
		},

		branches: function(branch) {
			return arguments.length ? this.branch(branch).children(selectors.branches) :
					this._$branches;
		},

		branchesActivated: function() {
			var self = this,
				$branches = $([]);

			$.each(this._activated.branches, function(i, branchID) {
				$branches = $branches.add(self.branch(branchID));
			});

			return $branches;
		},

		forward: function() {
			var next = this._action();

			next && this._select(next.$step, next.stepIndex);
		},

		index: function(step, branch, relative) {
			return arguments.length ? this._step(step, branch, true, relative) :
					this._stepIndex;
		},

		isValidStep: function(step) {
			return this.isValidIndex(this.index(step));
		},

		isValidStepIndex: function(index) {
			return typeof index == "number" && index >= 0 && index < this._stepCount;
		},

		percentComplete: function() {
			return this._percentComplete;
		},

		select: function(step, branch) {
			var index = this.index(step, branch);

			if (this.isValidStepIndex(index)) {
				if (index !== this._index) {
					this._select(this._$steps.eq(index), index);
				}
			} else {
				throw new Error('Unable to find step: ' +
						'step="' + step + '", ' +
						'branch="' + branch + '", ' +
						'index="' + index + '"');
			}
		},

		step: function(step, branch) {
			return arguments.length ? this._step(step, branch) : this._$step;
		},

		stepCount: function() {
			return this._stepCount;
		},

		steps: function(branch) {
			return arguments.length ? this.branch(branch).children(selectors.step) :
					this._$steps;
		},

		stepsActivated: function() {
			var self = this,
				$steps = $([]);

			$.each(this._activated.steps, function(i, stepIndex) {
				$steps = $steps.add(self.step(stepIndex));
			});

			return $steps;
		},

		stepsComplete: function() {
			return this._stepsComplete;
		},

		stepsPossible: function() {
			return this._stepsPossible;
		},

		stepsRemaining: function() {
			return this._stepsRemaining;
		},

		submit: function(event) {
			return this._validates()
					&& this._trigger("submit", event || null, {
						form: this._$form
					});
		}
	});

	$.extend({
		isjQuery: $.isjQuery || function(obj) {
			// http://ajaxian.com/archives/working-aroung-the-instanceof-memory-leak
			return obj && obj.hasOwnProperty && obj instanceof jQuery;
		}
	});
})(jQuery);
