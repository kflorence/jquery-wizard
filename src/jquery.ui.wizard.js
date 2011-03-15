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
  var click = "click", disabled = "disabled";

  $.widget("ui.wizard", {
    options: {
      /* Selectors */
      step: ".step",
      branch: ".branch",
      forward: ".forward",
      backward: ".backward",
      finish: ".finish",
      /* Classes */
      wizard: "ui-wizard",
      disabled: "disabled",
      current: "current",
      submit: "submit",
      noForward: "noForward",
      noBackward: "noBackward",
      /* Animations */
      inAnimation: {
        properties: { opacity: "show" },
        options: { duration: 0 }
      },
      outAnimation: {
        properties: { opacity: "hide" },
        options: { duration: 0 }
      },
      /* Misc */
      continuous: false,
      initialStep: 0,
      /* Transition Actions */
      action: "data-action",
      actions: {},
      defaultAction: null
    },

    /**
     * Set up the wizard. Only called once.
     *
     * @private
     */
    _create: function() {
      var self = this;

      this._path = [];
      this._currentIndex = -1;
      this._validate = false;

      this._$wizard = $(this.element).addClass(this.options.wizard);
      this._$forward = $(this.options.forward);
      this._$backward = $(this.options.backward);
      this._$finish = $(this.options.finish);

      this._$forward.bind(click, function(e) {
        self.forward();
      });

      this._$backward.bind(click, function(e) {
        self.backward();
      });

      this._$finish.bind(click, function(e) {
        self.finish();
      });

      if (this.element.elements) {
        console.log("form!");
      }
    },

    /**
     * Update the wizard. Public constructor.
     */
    _init: function() {
      if (!$.isFunction(this.options.defaultAction)) {
        this.options.defaultAction = function($step) {
          return this.index($step.nextAll(this.options.step));
        };
      }

      this.update();
      this._$steps.hide();
      this.select(this.options.initialStep);
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

      // If validation is enabled, make sure we can proceed
      if (this._validate || this._$wizard.data("validator")) {
        this._validate = true;

        // Validate the inputs on the current step. If invalid, do not proceed.
        if (!this._$currentStep.find(":input").valid()) {
          return false;
        }
      }

      // Look for an action to help determine where to go next
      if ((action = this._$currentStep.attr(this.options.action))) {
        if ((actionFunc = this.options.actions[action])) {
          // Action function found, use return value from function
          response = actionFunc.call(this, this._$currentStep);
        } else {
          // No function found, use action as response
          response = action;
        }
      } else {
        action = "defaultAction";
        response = this.options.defaultAction.call(this, this._$currentStep);
      }

      // Response can be a step, a step index, a step ID, a branch or a
      // branch ID. If response is a branch, the index of the first step
      // of that branch will be used.
      $step = this._search(response, typeof response == "number"
        ? this._$steps : this._$steps.add(this._$branches));

      // At this point, we should have found a jQuery object
      if ($step !== undefined && $step.length) {
        if ($step.hasClass(this.options.branch.substr(1))) {
          // Branch found, use first step in branch
          $step = this.steps($step).filter(":first");
        }

        step = this.index($step);
      }

      // We should have a valid index at this point. If we don't, we have
      // encountered an unexpected state within the plugin.
      if (!this.isValid(step)) {
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
     * Look for an element inside of another element.
     */
    _search: function(needle, haystack) {
      var $found, $haystack = $(haystack), type = typeof needle;

      if (type != "undefined" && $haystack.length) {
        // Search by index
        if (type == "number") {
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
     * Update the wizard for the new step.
     *
     * @param {number} step
     *    The index of the new step.
     * @param {jQuery} $step
     *    The jQuery object represeting the new step.
     *
     * @private
     */
    _update: function(step, $step) {
      var self = this,
        forward = step > this._currentStep,
        // The current branch
        $branch = $step.parent(),
        // The last step on the current branch
        lastStep = this.index(this.steps($branch).filter(":last"));

      // Proceed only if we have already set the current step
      if (this._$currentStep) {
        // Remove current step if going backwards
        if (!forward) {
          this._path.pop();
        }

        // Hide currently displayed step
        this._$currentStep.animate(
          this.options.outAnimation.properties,
          // Fixes http://bugs.jquery.com/ticket/3583
          $.extend({}, this.options.outAnimation.options)
        ).removeClass(this.options.current);
      }

      // Add new step if going forward or if it's the first step
      if (forward || !this._$currentStep) {
        this._path.push(step);
      }

      // Update pointers to current step
      this._$currentStep = $step;
      this._currentStep = step;

      // Show the new step
      this._$currentStep.animate(
        this.options.inAnimation.properties,
        // Fixes http://bugs.jquery.com/ticket/3583
        $.extend({}, this.options.inAnimation.options)
      ).addClass(this.options.current);

      // The backward button will be disabled if we are on the first step
      // and are not in continuous mode, or if the current step has the
      // "noBackward" class.
      if ((step === 0 && !this.options.continuous)
        || this._$currentStep.hasClass(this.options.noBackward)) {
        this._$backward.addClass(this.options.disabled).attr(disabled, true);
      } else {
        this._$backward.removeClass(this.options.disabled).removeAttr(disabled);
      }

      // The forward button will be disabled if we are on the last possible
      // step and are not in continuous mode, or if the current step has the
      // "noForward" class.
      if ((step === lastStep && !this.options.continuous
        && !this._$currentStep.attr(this.options.action))
        || this._$currentStep.hasClass(this.options.noForward)) {
        this._$forward.addClass(this.options.disabled).attr(disabled, true);
      } else {
        this._$forward.removeClass(this.options.disabled).removeAttr(disabled);
      }

      // The submit step is only enabled on steps with the "submitStep" class.
      if (this._$currentStep.hasClass(this.options.submit)) {
        this._$finish.removeClass(this.options.disabled).removeAttr(disabled);
      } else {
        this._$finish.addClass(this.options.disabled).attr(disabled, true);
      }
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
     * Finish the wizard. Triggers the finish event.
     */
    finish: function() {
      console.log("complete");
    },

    /**
     * Move the wizard forward. Uses a transition function if one is found,
     * otherwise uses the next step in the current branch.
     */
    forward: function() {
      var action;

      if ((action = this._action())) {
        this._update(action.step, action.$step);
      }
    },

    /**
     * Convenience method for returning the index of a step.
     */
    index: function(step, branch, relative) {
      return this._step(step, branch, true, relative);
    },

    /**
     * Checks whether a step is valid.
     */
    isValid: function(step) {
      if (typeof step !== "number") {
        step = this.index(step);
      }

      return step !== undefined && step >= 0 && step < this._steps;
    },

    /**
     * Returns the current path of steps in the order that the user progressed
     * through them.
     */
    path: function(index) {
      return index ? this._path[index] : this._path;
    },

    /**
     * Selects a step in the wizard.
     *
     * @param {number|String} step
     *    The index or string ID of the step to select.
     */
    select: function(step, branch) {
      var index = this.index(step, branch);

      if (this.isValid(index)) {
        if (index !== this._currentStep) {
          this._update(index, this._$steps.eq(index));
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
      return this._step(step, branch);
    },

    /**
     * Return all the steps in a branch.
     */
    steps: function(branch) {
      return branch ? this.branch(branch).find(this.options.step) : this._$steps;
    },

    /**
     * Updates the elements found within the wizard.
     */
    update: function() {
      this._$steps = this._$wizard.find(this.options.step);
      this._steps = this._$steps.length;

      // Branches includes the Wizard itself (default branch)
      this._$branches = this._$wizard.find(this.options.branch).andSelf();
    }
  });
})(jQuery);
