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
  var disabled = "disabled";

  $.plugin("merlin", {
    options: {
      /* Elements */
      step: ".step",
      branch: ".branch",
      next: "button.next",
      previous: "button.previous",
      submit: "button.submit",
      /* Classes */
      wizard: "merlin",
      disabled: "disabled",
      currentStep: "current",
      touchedStep: "touched",
      submitStep: "submit",
      disableNext: "disableNext",
      disablePrevious: "disablePrevious",
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

    _initialize: function() {
      var self = this, o = this.options,
        $wizard = $(this.element);

      $.extend(this, {
        progress: [],
        $wizard: $wizard,
        $next: $(o.next),
        $previous: $(o.previous),
        $submit: $(o.submit)
      });

      // Add wizard class
      $wizard.addClass(o.wizard);

      // Next button
      this.$next.bind("click", function(e) {
        self.next();
      });

      // Previous button
      this.$previous.bind("click", function(e) {
        self.previous();
      });

      this._update(o.initialStep);
    },

    _update: function(step) {
      var self = this, o = this.options,
      $step, $steps = this.$wizard.find(o.step);

      // Step is not the current step
      if (this.$step && this.step !== step) {
        // Going forwards
        if (this.step < step) {
          this.progress.push(step);
        }

        // Going backwards
        else {
          // Remove from touched elements
          this.$step.removeClass(o.touchedStep);

          // Remove from progress
          this.progress.pop();
        }

        // Hide previous step
        this.$step.removeClass(o.currentStep).animate(
          o.outAnimation.properties, $.extend({}, o.outAnimation.options)
        );
      }
console.log(this.progress);
      // Store new values
      $.extend(this, {
        step: step,
        $step: $step,
        steps: $steps.length,
        $steps: $steps
      });

      // Show current step
      this.$step.addClass(o.currentStep + " " + o.touchedStep).animate(
        o.inAnimation.properties, $.extend({}, o.inAnimation.options)
      );

      // Disable previous
      if ((step === 0 && !o.continuous)
        || $step.hasClass(o.disablePrevious)) {
        this.$previous.addClass(o.disabled).attr(disabled, true);
      } else {
        this.$previous.removeClass(o.disabled).removeAttr(disabled);
      }

      // Disable next
      if ((step === (this.steps - 1) && !o.continuous)
        || $step.hasClass(o.disableNext)) {
        this.$next.addClass(o.disabled).attr(disabled, true);
      } else {
        this.$next.removeClass(o.disabled).removeAttr(disabled);
      }

      // Submit step
      if ($step.hasClass(o.submitStep)) {
        this.$submit.removeClass(o.disabled).removeAttr(disabled);
      } else {
        this.$submit.addClass(o.disabled).attr(disabled, true);
      }
    },

    _transition: function() {
      var state, currentState = this.$step.attr("id"),
        transition = this.options.transitions[currentState];

      if (transition) {
        state = transition.call(this, this.$step);
      }

      return state;
    },

    select: function(step) {
      // In the case that an ID is used...
      if (typeof step === "string") {
        step = $steps.index(($step = $(step)).get(0));
      } else {
        $step = $steps.eq(step);
      }

      if (this.$steps.eq(step).length) {
        this._update(step);
      }
    },

    next: function() {
      var next = this._transition() || this.$steps.index(
          this.$steps.eq(this.step).nextAll(this.options.step).get(0)
        );

      if (next) {
        this.select(next);
      }
    },

    previous: function() {
      var previous = this.progress.pop();

      if (previous) {
        this.select(previous);
      }
    }
  });
})(jQuery);
