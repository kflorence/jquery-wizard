/**
 * @fileOverview jquery.merlin.js
 *
 * A lightweight jQuery wizard plugin.
 *
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-merlin/
 * @version 0.1.0
 *
 * Dual licensed under the MIT and BSD licenses.
 */
;(function($, undefined) {
  /* For better minification */
  var click = "click", disabled = "disabled";

  /**
   * Set up the merlin plugin.
   */
  $.plugin("merlin", {
    /**
     * Default options
     */
    options: {
      /* Elements */
      step: ".step",
      branch: ".branch",
      forward: ".forward",
      backward: ".backward",
      complete: ".complete",
      /* Classes */
      wizard: "merlin",
      disabled: "disabled",
      current: "current",
      submit: "submit",
      noForward: "noForward",
      noBackward: "noBackward",
      /* Animations */
      inAnimation: {
        properties: {
          opacity: "show"
        },
        options: {
          duration: 0
        }
      },
      outAnimation: {
        properties: {
          opacity: "hide"
        },
        options: {
          duration: 0
        }
      },
      /* Misc */
      continuous: false,
      initialStep: 0,
      /* Transitions */
      transitions: {}
    },

    /**
     * Set up the wizard.
     *
     * @private
     */
    _initialize: function() {
      var self = this;

      this.$wizard = $(this.element).addClass(this.options.wizard);

      this.$forward = $(this.options.forward);
      this.$backward = $(this.options.backward);
      this.$complete = $(this.options.complete);

      if (this.$forward.length) {
        this.$forward.bind(click, function(e) {
          self.forward();
        });
      }

      if (this.$backward.length) {
        this.$backward.bind(click, function(e) {
          self.backward();
        });
      }

      if (this.$complete.length) {
        this.$complete.bind(click, function(e) {
          self.submit();
        });
      }

      this.update();

      this.select(this.options.initialStep);
    },

    /**
     * Contains the index for each step the user has visited, in order.
     */
    _path: [],

    /**
     * Looks for a transition function to tell us where to go next.
     *
     * @private
     */
    _transition: function() {
      var step, key = this.$step.attr("data-transition") || this.step,
        transition = this.options.transitions[key];

      if (transition) {
        step = transition.call(this, this.$step);
      }

      return step;
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
      var self = this, forward = step > this.step,
        siblings = $step.siblings(this.options.step).length;

      // Proceed only if we have already set the current step
      if (this.$step) {
        // Remove current step if going backwards
        if (!forward) {
          this._path.pop();
        }

        // Hide currently displayed step
        this.$step.animate(
          this.options.outAnimation.properties,
          $.extend({}, this.options.outAnimation.options)
        ).removeClass(this.options.current);
      }

      // Update pointers to current step
      this.step = step;
      this.$step = $step;

      // Add new step if going forward or if it's the first step
      if (forward || !this._path.length) {
        this._path.push(step);
      }

      // Show the new step
      this.$step.animate(
        this.options.inAnimation.properties,
        $.extend({}, this.options.inAnimation.options)
      ).addClass(this.options.current);

      // The backward button will be disabled if we are on the first step
      // and are not in continuous mode, or if the current step has the
      // "noBackward" class.
      if ((step === 0 && !this.options.continuous)
        || this.$step.hasClass(this.options.noBackward)) {
        this.$backward.addClass(this.options.disabled).attr(disabled, true);
      } else {
        this.$backward.removeClass(this.options.disabled).removeAttr(disabled);
      }

      // The forward button will be disabled if we are on the last possible
      // step and are not in continuous mode, or if the current step has the
      // "noForward" class.
      if ((step === siblings && !this.options.continuous)
        || this.$step.hasClass(this.options.noForward)) {
        this.$forward.addClass(this.options.disabled).attr(disabled, true);
      } else {
        this.$forward.removeClass(this.options.disabled).removeAttr(disabled);
      }

      // The submit step is only enabled on steps with the "submitStep" class.
      if ($step.hasClass(this.options.submit)) {
        this.$complete.removeClass(this.options.disabled).removeAttr(disabled);
      } else {
        this.$complete.addClass(this.options.disabled).attr(disabled, true);
      }
    },

    /**
     * Selects a step in the wizard.
     *
     * @param {number|String} step
     *    The index or string ID of the step to select.
     */
    select: function(step) {
      if (step !== undefined) {
        var $step;

        if (typeof step === "string") {
          $step = this.$steps.find(step);
          step = this.$steps.index($step.get(0));
        } else if (typeof step === "number") {
          $step = this.$steps.eq(step);
        }

        if ($step.length && this.step !== step) {
          this._update(step, $step);
        }
      }
    },

    complete: function() {
      console.log("complete");
    },

    /**
     * Move the wizard forward. Uses a transition function if one is found,
     * otherwise uses the next step in the current branch.
     */
    forward: function() {
      this.select(this._transition() || this.$steps.index(
        this.$step.nextAll(this.options.step).get(0))
      );
    },

    /**
     * Move the wizard backwards. This will go to the previous step.
     */
    backward: function() {
      this.select(this._path[this._path.length - 2]);
    },

    /**
     * Returns the current path of steps in the order that the user progressed
     * through them.
     */
    path: function(index) {
      return index ? this._path[index] : this._path;
    },

    /**
     * Updates the steps found within the wizard. Should be called whenever
     * anything is added or removed from the DOM.
     */
    update: function() {
      this.$steps = this.$wizard.find(this.options.step);
      this.steps = this.$steps.length;
    }
  });
})(jQuery);
