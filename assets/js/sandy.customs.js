(function ($) {
  "use strict";
    InstantClick.init('mousedown');
    Object.values(app.utils).filter(s => typeof s === 'function').forEach(s => s());

    jQuery('[app-sandy-prevent]').attr('data-no-instant', true);
    InstantClick.on('change', function() {
      jQuery('[app-sandy-prevent]').attr('data-no-instant', true);
      Object.values(app.utils).filter(s => typeof s === 'function').forEach(s => s());
    });
}());