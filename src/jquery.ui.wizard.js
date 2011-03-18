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
;(function($, undefined) {
  // For better minification
  var options,
    classes,
    elements,
    click = "click",
    disabled = "disabled",
    num = "number";

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
        disabled: "disabled",
        submitStep: "submitStep",
        currentStep: "currentStep",
        noForward: "noForward",
        noBackward: "noBackward"
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

    /**
     * Looks for an action function to tell us where to go next.
     *
     * @returns {Object}
     *
     * @private
     */
    _action: function() {
      var action, actionFunc, response, $step, step;

      // Test currentStep's inputs against the validator, if enabled.
      if ((this._enabled.validate = !!this._$wizard.data("validator"))) {
        var $inputs = this._$currentStep.find(":input");

        // If the step contains inputs and they are invalid, stay put.
        if ($inputs.length && !$inputs.valid()) {
          return false;
        }
      }

      // Look for an action to help determine where to go next
      if ((action = this._$currentStep.attr(options.action))) {
        if ((actionFunc = options.actions[action])) {
          // Action function found, use return value from function
          response = actionFunc.call(this, this._$currentStep);
        } else {
          // No function found, use action as response
          response = action;
        }
      } else {
        action = "defaultAction";
        response = options.defaultAction.call(this, this._$currentStep);
      }

      // Response can be a step, a step index, a step ID, a branch or a
      // branch ID. If response is a branch, the index of the first step
      // of that branch will be used.
      $step = this._search(response, typeof response == num
        ? this._$steps : this._$steps.add(this._$branches));

      // At this point, we should have found a jQuery object
      if ($step !== undefined && $step.length) {
        if ($step.hasClass(elements.branch.substr(1))) {
          // Branch found, use first step in branch
          $step = this.steps($step).filter(":first");
        }

        step = this.index($step);
      }

      // We should have a valid index at this point. If we don't, we have
      // encountered an unexpected state within the plugin.
      if (!this.isValidStep(step)) {
        throw new Error(
          'Unexpected state encountered: ' +
          'action="' + action + '", ' +
          'response="' + response + '", ' +
          'step="' + step + '"'
        );

        // Return undefined
        return;
      }

      // Return an object containing the index of the next step, and a jQuery
      // object containing the next step element.
      return { step : step, $step : $step };
    },

    /**
     * Called on widget creation. This is only called once.
     *
     * @private
     */
    _create: function() {
      this._enabled = {};
      this._$wizard = this.element;

      // There may not be a form element
      this._$form = this.element[0].elements.length
        ? this.element : this.element.find("form");
    },

    /**
     * Initialize. Called any time the plugin is called with no method.
     */
    _init: function() {
      var self = this;

      options = this.options;
      classes = options.classes;
      elements = options.elements;

      this.update();

      this._path = [];
      this._currentStep = -1;
      this._$steps.hide();

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

    /**
     * Look for an element inside of another element.
     */
    _search: function(needle, haystack) {
      var $found, $haystack = $(haystack), type = typeof needle;

      if (type != "undefined" && $haystack.length) {
        // Search by index
        if (type == num) {
          $found = $haystack.eq(needle);
        }

        // Search by string (ID)
        else if (type == "string") {
          $found = $haystack.filter(
            needle.charAt(0) == "#" ? needle : "#" + needle
          );
        }

        // Search by object (DOM, jQuery)
        else if (type == "object") {
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

    /**
     * Update the wizard to reflect the selection of a new step.
     *
     * @param {number} step
     *    The index of the new step.
     * @param {jQuery} $step
     *    The jQuery object represeting the new step.
     *
     * @private
     */
    _select: function(step, $step) {
      var self = this,
        forward = step > this._currentStep,
        // The current branch
        $branch = $step.parent(),
        // The last step on the current branch
        lastStep = this.index(this.steps($branch).filter(":last"));

      if (this._$currentStep) {
        if (!forward) {
          this._path.pop();
        }

        // Hide currently displayed step
        this._$currentStep.animate(
          options.animations.hide.properties,
          // Fixes http://bugs.jquery.com/ticket/3583
          $.extend({}, options.animations.hide.options)
        ).removeClass(classes.currentStep);
      }

      // Add new step if going forward or if it's the first step
      if (forward || !this._$currentStep) {
        this._path.push(step);
      }

      // Update pointers to current step
      this._currentStep = step;
      this._$currentStep = $step;

      // Show the new step
      this._$currentStep.animate(
        options.animations.show.properties,
        // Fixes http://bugs.jquery.com/ticket/3583
        $.extend({}, options.animations.show.options)
      ).addClass(classes.current);

      // The backward button will be disabled if we are on the first step
      // and are not in continuous mode, or if the current step has the
      // "noBackward" class.
      if (step === 0 || this._$currentStep.hasClass(classes.noBackward)) {
        this._$backward.addClass(classes.disabled).attr(disabled, true);
      } else {
        this._$backward.removeClass(classes.disabled).removeAttr(disabled);
      }

      // The forward button will be disabled if we are on the last possible
      // step and are not in continuous mode, or if the current step has the
      // "noForward" class.
      if (this._$currentStep.hasClass(classes.noForward)
        || (step === lastStep && !this._$currentStep.attr(options.action))) {
        this._$forward.addClass(classes.disabled).attr(disabled, true);
      } else {
        this._$forward.removeClass(classes.disabled).removeAttr(disabled);
      }

      // The submit step is only enabled on steps with the "submitStep" class.
      if (this._$currentStep.hasClass(classes.submitStep)) {
        this._$submit.removeClass(classes.disabled).removeAttr(disabled);
      } else {
        this._$submit.addClass(classes.disabled).attr(disabled, true);
      }
    },

    /**
     * Find the step in a branch. Optionally, return the index for that step
     * instead of the step itself, either absolutely (index of step relative
     * to all steps) or relatively (index of step relative to the steps in the
     * current branch).
     */
    _step: function(step, branch, index, relative) {
      // Allow for the omission of branch
      if (typeof branch === "boolean") {
        relative = index;
        index = branch;
        branch = undefined;
      }

      // Find the step within the specified branch, or within all steps if
      // a specific branch was not given.
      var $steps = branch ? this.steps(branch) : this._$steps,
        $step = this._search(step, $steps);

      // Return the index of the step instead of the step itself
      if (index === true) {
        return $step && $step.length
          ? (relative === true ? $steps : this._$steps).index($step)
          : -1;
      }

      return $step;
    },

    /**
     * Move the wizard backwards. This will go to the previously visited step.
     */
    backward: function() {
      this.select(this._path[this._path.length - 2]);
    },

    /**
     * Find a branch in the wizard
     */
    branch: function(branch) {
      return this._search(branch, this._$branches);
    },

    /**
     * Move the wizard forward. Uses a transition function if one is found,
     * otherwise uses the next step in the current branch.
     */
    forward: function() {
      var action;

      if ((action = this._action())) {
        this._select(action.step, action.$step);
      }
    },

    /**
     * Convenience method for returning the index of a step.
     */
    index: function(step, branch, relative) {
      return arguments.length ? this._step(step, branch, true, relative)
        : this._currentStep;
    },

    /**
     * Checks whether a step is valid.
     */
    isValidStep: function(step) {
      if (typeof step !== num) {
        step = this.index(step);
      }

      return step !== undefined && step >= 0 && step < this._steps;
    },

    /**
     * Returns the current path of steps in the order that the user progressed
     * through them.
     */
    path: function(index) {
      return arguments.length ? this._path[index] : this._path;
    },

    /**
     * Selects a step in the wizard.
     *
     * @param {number|String} step
     *    The index or string ID of the step to select.
     */
    select: function(step, branch) {
      var index = this.index(step, branch);

      if (this.isValidStep(index)) {
        if (index !== this._currentStep) {
          this._select(index, this._$steps.eq(index));
        }
      } else {
        throw new Error('Unable to find step "' + step + '"');
      }
    },

    /**
     * The number of steps in the wizard.
     */
    size: function() {
      return this._steps;
    },

    step: function(step, branch) {
      return arguments.length ? this._step(step, branch)
        : this._$currentStep;
    },

    /**
     * Return all the steps in a branch.
     */
    steps: function(branch) {
      return arguments.length ? this.branch(branch).find(elements.step)
        : this._$steps;
    },

    /**
     * Finish the wizard. Triggers the finish event.
     */
    submit: function() {
      if (this._$form.length) {
        if ($.isFunction(options.submit)) {
          options.submit.apply(this, arguments);
        } else {
          this._$form.submit();
        }
      }
    },

    /**
     * Updates the elements found within the wizard.
     */
    update: function() {
      this._$steps = this._$wizard.find(elements.step);
      this._$branches = this._$wizard.find(elements.branch).andSelf();
      this._steps = this._$steps.length;
    }
  });
})(jQuery);
