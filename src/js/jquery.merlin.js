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
      this.total = this.$steps.length;
      this.current = step;

      // Activate/deactive steps accordingly
      this.$steps.removeClass(o.current).hide();
      this.$steps.eq(this.current).addClass(o.current).show();

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
      if (step >= 0 && step < this.total) {
        this._update(step);
      }
    },

    next: function() {
      var step = this.current + 1;

      this.select(step);
    },

    previous: function() {
      var step = this.current - 1;

      this.select(step);
    },

    total: function() {
      return this.total;
    }
  });
})(jQuery);
