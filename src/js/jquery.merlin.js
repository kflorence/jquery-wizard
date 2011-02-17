/**
 * @fileOverview jquery.merlin.js
 *
 * A simple, jQuery form wizard plugin.
 *
 * @author Kyle Florence <kyle[dot]florence[at]gmail[dot]com>
 * @website https://github.com/kflorence/jquery-merlin/
 * @version 0.1.0
 *
 * Dual licensed under the MIT and BSD licenses.
 */
;(function($, undefined) {
  $.plugin("merlin", {
    options: {
      next: ".next",
      previous: ".previous",
      submit: ".submit",
      step: ".step",
      branch: ".branch",
      current: "current",
      touched: "touched",
      disabled: "disabled",
      start: 0
    },

    _initialize: function() {
      var self = this;

      $.extend(this, {
        $wizard:  $(this.element),
        $next: $(this.options.next),
        $previous: $(this.options.previous),
        $submit: $(this.options.submit)
      });

      this.$wizard.addClass("merlin");

      // Next button
      this.$next.bind("click", function(e) {
        self.next();
      });

      // Previous button
      this.$previous.bind("click", function(e) {
        self.previous();
      });

      this._update(this.options.start);
    },

    _update: function(step) {
      var self = this, o = this.options;

      // In case a step has been added/removed from the DOM
      this.$steps = this.$wizard.find(o.step);
      this.$branches = this.$wizard.find(o.branch);

      // Max is the highest step we can go to
      this.max = this.$steps.length;

      // Total is the total number of steps on the current branch
      this.total = this.$branches.length ? this.$steps.filter(function() {
        return self.branch ? $(this).parent(o.branch).attr("id") === self.branch
          : $(this).parent(o.branch).length === 0;
      }).length : this.max;

      // Update the current step
      this.current = step;
console.log(this.current, this.total, this.max);
      // Remove active step, hide all steps
      this.$steps.removeClass(o.current).hide();

      // Make active step the current step and show it
      this.$steps.eq(this.current).addClass(o.current + " " + o.touched).show();

      // First step
      if (step === 0) {
        this.$previous.addClass(o.disabled).attr("disabled", true);
      } else {
        this.$previous.removeClass(o.disabled).removeAttr("disabled");
      }

      // Last step
      if (step === (this.total - 1)) {
        this.$next.addClass(o.disabled).attr("disabled", true);
        this.$submit.removeClass(o.disabled).removeAttr("disabled");
      } else {
        this.$next.removeClass(o.disabled).removeAttr("disabled");
        this.$submit.addClass(o.disabled).attr("disabled", true);
      }
    },

    current: function() {
      return this.current;
    },

    select: function(step) {
      console.log(step);
      if (step > -1 && step < this.max) {
        this._update(step);
      }
    },

    next: function() {
      this.select(this.$steps.index(
        this.$steps.eq(this.current).nextAll(this.options.step).get(0)
      ));
    },

    previous: function() {
      this.select(this.$steps.index(
        this.$steps.eq(this.current).prevAll(this.options.step).get(0)
        ));
    },

    total: function() {
      return this.total;
    }
  });
})(jQuery);
