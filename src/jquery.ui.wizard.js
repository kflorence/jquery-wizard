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
      wizard: "merlin",
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
      actions: {}
    },

    /**
     * Set up the wizard.
     *
     * @private
     */
    _create: function() {
      var self = this;

      this._$wizard = $(this.element).addClass(this.options.wizard);
      this._$forward = $(this.options.forward);
      this._$backward = $(this.options.backward);
      this._$finish = $(this.options.finish);

      if (this._$forward.length) {
        this._$forward.bind(click, function(e) {
          self.forward();
        });
      }

      if (this._$backward.length) {
        this._$backward.bind(click, function(e) {
          self.backward();
        });
      }

      if (this._$finish.length) {
        this._$finish.bind(click, function(e) {
          self.finish();
        });
      }

      this.update();

      this.select(this.options.initialStep);
    },

    _currentIndex: -1,

    /**
     * Contains the index for each step the user has visited, in order.
     */
    _path: [],

    /**
     * Looks for a transition function to tell us where to go next.
     *
     * @returns {number}
     *    Returns the index of the step to transition to, or -1 if no index
     *    was provided.
     *
     * @private
     */
    _transition: function() {
      var index, action, actionFunc, response, responseType;

      // We need an action to tell us what to do next
      if ((action = this._$currentStep.attr(this.options.action))) {

        // See if there is an action function with this name
        if ((actionFunc = this.options.actions[action])) {
          response = actionFunc.call(this, this._$currentStep);
        } else {
          response = action;
        }

        // Response can be a step index, a step ID or a branch ID. If response
        // is a branch, select the first step in that branch.
        responseType = typeof response;

        if (responseType === "number") {
          response = this._search(response, this._$steps);
        } else if (responseType === "string") {
          response = this._search(response, this._$steps.add(this._$branches));
        }

        if (response.length) {
          // Branch found, use first step
          if (response.hasClass(this.options.branch.substr(1))) {
            index = this.index(this.firstStep(response));
          }
          // Step found
          else if (response.hasClass(this.options.step.substr(1))) {
            index = this.index(response);
          }
        }
      }

      return index;
    },

    _search: function(search, $context) {
      var $element, searchType = typeof search;

      // Search by index
      if (searchType === "number") {
        $element = $context.eq(search);
      }

      // Search by string
      else if (searchType === "string") {
        $element = $context.filter(
          search.charAt(0) == "#" ? search : "#" + search
        );
      }

      // Search by jQuery object
      else if (searchType === "object"
        && search.hasOwnProperty
        && search instanceof jQuery) {
        $element = search;
      }

      return $element;
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
        lastStep = this.index(this.lastStep($branch));

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
     * 
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

    firstStep: function(context) {
      return (context ? $(context) : this._$wizard)
        .children(this.options.step).filter(":first");
    },

    /**
     * Move the wizard forward. Uses a transition function if one is found,
     * otherwise uses the next step in the current branch.
     */
    forward: function() {
      var step = this._transition();

      if (!this.isValidIndex(step)) {
        step = this.index(this._$currentStep.nextAll(this.options.step));
      }

      this.select(step);
    },

    index: function(step, andStep) {
      var searchType = typeof search, $step = this.step(step);

      // The only sure way to determine whether or not we have found a step
      // in the wizard is to select an element and test for length. We check
      // for these first because if we pass undefined to index, as of jQuery
      // 1.4 it will return the index of the element calling the function.
      step = $step && $step.length ? this._$steps.index($step) : -1;

      // Returns only the index by default. Returns the step associated with
      // the index if andElement flag is true -- mostly used internally.
      return andStep ? { step : step, $step : $step } : step;
    },

    isValidIndex: function(index) {
      return index !== undefined && index >= 0 && index < this._stepCount;
    },

    lastStep: function(context) {
      return (context ? $(context) : this._$wizard)
        .children(this.options.step).filter(":last");
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
    select: function(step) {
      var selected = this.index(step, true);

      if (this.isValidIndex(selected.step)
        && selected.step !== this._currentStep) {
        this._update(selected.step, selected.$step);
      }
    },

    size: function() {
      return this._stepCount;
    },

    step: function(step) {
      return this._search(step, this._$steps);
    },

    /**
     * Updates the elements found within the wizard.
     */
    update: function() {
      this._$steps = this._$wizard.find(this.options.step);
      this._$branches = this._$wizard.find(this.options.branch);
      this._stepCount = this._$steps.length;
    }
  });
})(jQuery);
