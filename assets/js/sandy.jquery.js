(function ($) {
  "use strict";

  jQuery(document).on('ready', function () {
    
    $(document).on('click', '.action-list-item', function(){
      app.utils.changeMenu();
    });
  });

}(jQuery));