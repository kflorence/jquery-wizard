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
  /* For better minification */
  var click = "click", disabled = "disabled";

  $.widget("ui.wizard", {
    options: {
      /* Selectors */
      step: ".step",
      branch: ".branch",
      transition: ".transition",
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
      /* Attributes */
      transitionAttr: "data-transition",
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
    _create: function() {
      var self = this;

      this.$wizard = $(this.element).addClass(this.options.wizard);
      this.$forward = $(this.options.forward);
      this.$backward = $(this.options.backward);
      this.$finish = $(this.options.finish);

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

      if (this.$finish.length) {
        this.$finish.bind(click, function(e) {
          self.finish();
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
     * @returns {number}
     *    Returns the index of the step to transition to, or -1 if no index
     *    was provided.
     *
     * @private
     */
    _transition: function() {
      var index = -1, key, transition;

      if (this.$step && (key = this.$step.attr(this.options.transitionAttr))) {
        if ((transition = this.options.transitions[key])) {
          index = transition.call(this, this.$step);
        }
      }

      return index;
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
        forward = step > this.step,
        // The current branch (may be this.$wizard)
        $branch = $step.parent(),
        // The last step on the current branch
        lastStep = this.$steps.index(
          $branch.children(this.options.step).filter(":last").get(0)
        );

      // Proceed only if we have already set the current step
      if (this.$step) {
        // Remove current step if going backwards
        if (!forward) {
          this._path.pop();
        }

        // Hide currently displayed step
        this.$step.animate(
          this.options.outAnimation.properties,
          // Fixes http://bugs.jquery.com/ticket/3583
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
        // Fixes http://bugs.jquery.com/ticket/3583
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
      if ((step === lastStep && !this.options.continuous)
        || this.$step.hasClass(this.options.noForward)) {
        this.$forward.addClass(this.options.disabled).attr(disabled, true);
      } else {
        this.$forward.removeClass(this.options.disabled).removeAttr(disabled);
      }

      // The submit step is only enabled on steps with the "submitStep" class.
      if ($step.hasClass(this.options.submit)) {
        this.$finish.removeClass(this.options.disabled).removeAttr(disabled);
      } else {
        this.$finish.addClass(this.options.disabled).attr(disabled, true);
      }
    },

    /**
     * Move the wizard backwards. This will go to the previous step.
     */
    backward: function() {
      this.select(this._path[this._path.length - 2]);
    },

    /**
     * TODO should be similar to index in search terms
     */
    branch: function(name) {
      return this.$wizard.find(name.charAt(0) === "#" ? name : "#" + name);
    },

    /**
     * Finish the wizard. Triggers the finish event.
     */
    finish: function() {
      console.log("complete");
    },

    firstStep: function(branch) {
      return (branch ? this.branch(branch) : this.$wizard)
        .children(this.options.step).filter(":first");
    },

    /**
     * Move the wizard forward. Uses a transition function if one is found,
     * otherwise uses the next step in the current branch.
     */
    forward: function() {
      var next = this._transition();

      this.select(next >= 0 ? next
        : this.$steps.index(this.$step.nextAll(this.options.step))
      );
    },

    index: function(search, andElement) {
      var $step, index, searchType = typeof search;

      // Search by index
      if (searchType === "number") {
        $step = this.$steps.eq(search);
      }

      // Search by ID
      else if (searchType === "string") {
        $step = this.$steps.find(
          search.charAt(0) === "#" ? search : "#" + search
        );
      }

      // Search by jQuery object
      else if (searchType === "object"
        && search.hasOwnProperty
        && search instanceof jQuery) {
        $step = search;
      }

      // The only sure way to determine whether or not we have found a step
      // in the wizard is to select an element and test for length. We check
      // for these first because if we pass undefined to index, as of jQuery
      // 1.4 it will return the index of the element calling the function.
      index = $step && $step.length ? this.$steps.index($step) : -1;

      // Returns only the index by default. Returns the step associated with
      // the index if andElement flag is true -- mostly used internally.
      return andElement ? { "index" : index, "element" : $step } : index;
    },

    lastStep: function(branch) {
      return (branch ? this.branch(branch) : this.$wizard)
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
      step = this.index(step, true);

      if ((step.index >= 0)
        && (step.index < this.steps)
        && (step.index !== this.step)) {
        this._update(step.index, step.element);
      }
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
