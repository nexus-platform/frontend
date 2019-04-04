function toggleTooltip(hide) {
    var sender = $(event)[0].srcElement;
    var tooltip = $(sender).next('.tooltip');
    tooltip.css({
        transform: 'translate3d(' + /*e.pageX*/$(sender).position().left + 'px, ' + ($(sender).position().top - 30) + 'px, 0px)'
    });
    tooltip.attr('aria-hidden', hide);
};

/*$('.has-tooltip').on({
  'mouseover': function (e) {
    var tooltip = $(this).next('.tooltip');
    tooltip.css({
        transform: 'translate3d(' + $(this).position().left + 'px, 44px, 0px)'
    });
    tooltip.attr('aria-hidden', false);
  },
  'mouseout': function () {
    var tooltip = $(this).next('.tooltip');
    tooltip.attr('aria-hidden', true);
  }
});*/
