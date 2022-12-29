var app = {
  cookie: {

    setCookie: function(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
    },

    getCookie: function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    },
    eraseCookie: function (name) {   
        document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    },
  },
  sandyPrism: {
      update: function(text) {
        let result_element = document.querySelector("#highlighting-content");
        // Handle final newlines (see article)
        if(text[text.length-1] == "\n") {
          text += " ";
        }
        // Update code
        result_element.innerHTML = text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;"); /* Global RegExp */
        // Syntax Highlight
        Prism.highlightElement(result_element);
      },

      sync_scroll: function(element) {
        /* Scroll result to scroll coords of event - sync with textarea */
        let result_element = document.querySelector("#highlighting");
        // Get and set x and y
        result_element.scrollTop = element.scrollTop;
        result_element.scrollLeft = element.scrollLeft;
      },

      check_tab: function(element, event) {
        let code = element.value;
        if(event.key == "Tab") {
          /* Tab key pressed */
          event.preventDefault(); // stop normal
          let before_tab = code.slice(0, element.selectionStart); // text before tab
          let after_tab = code.slice(element.selectionEnd, element.value.length); // text after tab
          let cursor_pos = element.selectionEnd + 2; // after tab placed, where cursor moves to - 2 for 2 spaces
          element.value = before_tab + "  " + after_tab; // add tab char - 2 spaces
          // move cursor
          element.selectionStart = cursor_pos;
          element.selectionEnd = cursor_pos;
          app.sandyPrism.update(element.value); // Update text to include indent
        }
      }
  },
  deepExtend: function (a, b) {
    for (const prop in b) {
      if (typeof b[prop] === 'object') {
        a[prop] = b[prop] instanceof Array ? [] : {};
        this.deepExtend(a[prop], b[prop]);
      } else {
        a[prop] = b[prop];
      }
    }
  },
  sleep: function(time){
    return new Promise((resolve) => setTimeout(resolve, time));
  },
  copy: function(text){
    var input = document.createElement('input');
    input.setAttribute('value', text);
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    var result = document.execCommand('copy');
    document.body.removeChild(input);
    return result;
  },
  query: function (options) {
    const config = {
      method: 'GET',
      async: true,
      header: {
        type: 'Content-type',
        value: 'application/json'
      },
      data: ''
    };

    this.deepExtend(config, options);

    return new Promise( function (resolve, reject) {
      const xhttp = new XMLHttpRequest();

      xhttp.onreadystatechange = function() {
        if (xhttp.readyState !== 4) return;

        if (xhttp.status === 200) {
          resolve(xhttp.responseText);
        } else {
          reject({
            status: xhttp.status,
            statusText: xhttp.statusText
          });
        }
      };
  
      xhttp.open(config.method, config.url, config.async);
      xhttp.setRequestHeader(config.header.type, config.header.value);
  
      if (config.method === 'GET') {
        xhttp.send();
      } else if (config.method === 'POST') {
        xhttp.send(config.data);
      }
    });
  },
  querySelector: function (selector, callback) {
    const el = document.querySelectorAll(selector);

    if (el.length) {
      callback(el);
    }
  },

  functions: {
    inputTextCount: function(text_field, limit, count){
        var available = limit - count;
        text_field.text(available);

        if (available < 0) {
          text_field.addClass('exceeded');
        }else{
          text_field.removeClass('exceeded');
        }
    }
  },



  utils: {

    sandy_dialog_modal: function(){
      jQuery('.sandy-upload-modal-dialog').each(function(){
        var opener = jQuery(this).data('popup') + '-open';
        var $dialog_wrapper = jQuery(this);

          var objects = {
            switch: function($type){
              switch($type){
                case 'upload':
                  $dialog_wrapper.find('[name="sandy_upload_media_upload"]').each(function(e){
                    objects.get_image_from_upload(this, e);
                  });
                break;
              }
            },


            get_image_from_upload: function(input, e){
              var $this = jQuery(input);
              var files = e.target.files, filesLength = files.length;


              var video_or_image = function(file, e){
                extension = file.name.substring(file.name.lastIndexOf('.'));
                var video_extension = "mp4, ogg, 3gpp, 3gpp2, flv, mpeg, mpeg-2, mpeg4, ogg, ogm, quicktime, webm, avi";

                if (file.type.match('image.*')) {
                  var html = "<img src='"+ e.target.result +"' class='bio-background-inner lozad image sandy-upload-modal-identifier' alt=''>";
                }else{
                  var html = "<video class=\"video-background image sandy-upload-modal-identifier\" loop=\"\" autoplay=\"\" playsinline=\"\" src'"+ e.target.result +"' muted=\"\"><source></video>";
                }

                objects.update_upload_div(html, true);
              };

              for (var i = 0; i < filesLength; i++) {
                var f = files[i]
                var fileReader = new FileReader();

                fileReader.onload = (function(e) {
                  var file = f;
                  video_or_image(file, e);
                });
                fileReader.readAsDataURL(f);
              }
            },

            get_image_from_url: function(url){

              var filename = url.substring(url.lastIndexOf('/')+1);

              if (objects.is_video(filename)) {

                var html = "<video class=\"video-background image sandy-upload-modal-identifier\" loop=\"\" autoplay=\"\" playsinline=\"\" src'"+ url +"' muted=\"\"><source></video>";
                objects.update_upload_div(html);

              }else{

                var html = "<img src='"+ url +"' class='bio-background-inner lozad image sandy-upload-modal-identifier' alt=''>";
                objects.update_upload_div(html);
              }
            },

            is_video: function(filename){
                var ext = objects.getExtension(filename);
                switch (ext.toLowerCase()) {
                  case 'm4v':
                  case 'ogg':
                  case 'avi':
                  case 'mp4':
                  case 'mov':
                  case 'mpg':
                  case 'mpeg':
                  case '3gpp':
                  case '3gpp2':
                  case 'flv':
                  case 'ogg':
                  case 'webm':
                  return true;
                }
                return false;
            },

            getExtension: function(filename) {
                var parts = filename.split('.');
                return parts[parts.length - 1];
            },

            update_upload_div: function(html, is_upload = false){
              if (is_upload) {
                $dialog_wrapper.find('.is-sandy-upload-modal .sandy-upload-modal-identifier').replaceWith(html);
              }
              if (jQuery(opener).find('.sandy-upload-modal-identifier').length) {
                jQuery(opener).find('.sandy-upload-modal-identifier').replaceWith(html);
              }else{
                jQuery(opener).find('.image').replaceWith(html);
              }
            }
          };


          jQuery(this).on('dialog:open', function(e, $elem) {
            var $dialog = jQuery(this);
            var $input = jQuery(this).find('.sandy-tabs-link input');

            $input.on('change', function(){
              objects.switch(jQuery(this).val());
            });

            jQuery(this).find('[name="sandy_upload_media_upload"]').on('change', function(e){
              objects.get_image_from_upload(this, e);
            });


            jQuery(this).find('[name=sandy_upload_media_link]').on('change', function(){
              var url = jQuery(this).val();
              objects.get_image_from_url(url);
            });
          });
      });
    },

    popperjs:function(){
      jQuery('[data-popper-init]').each(function(){
        var button = jQuery(this).data('popper-button');
        var button = document.querySelector(button);

        var tooltip = this;
          // magic positioning for you:
          Popper.createPopper(button, tooltip, {
            placement: jQuery(this).data('popper-init'),
          });
      });
    },
    currency_input: function(){

        var currency = jQuery('.currency-payment.is-price');
        currency.each(function(){
            var input = jQuery(this).find('.currency-input');
            var value = jQuery(this).find('.currency-value');
            var price = jQuery(this).find('.currency-result');

            input.on('keyup', function () {
              var inputValue = input.val();
              value.text(inputValue);
              input.text(inputValue);


              value.priceFormat({
                  prefix: '',
                  centsSeparator: '',
                  centsLimit: 0,
                  thousandsSeparator: ','
              });


              input.priceFormat({
                  prefix: '',
                  centsSeparator: '',
                  centsLimit: 0,
                  thousandsSeparator: ','
              });
            });
        });
    },
    pinInput: function(){
      jQuery('.pin-input input').each(function(){
        jQuery(this).on('input', function(e){

          if (this.value.length == 1) {
            jQuery(this).next('input').focus();
          }

          if (jQuery(this).val() == '') {
            jQuery(this).prev('input').focus();
            jQuery(this).prev('input').val('');
          }
        });

        jQuery(this).on('keydown', function(e){
            if(e.which == 8) {
              jQuery(this).val('');
              jQuery(this).prev('input').focus();
              jQuery(this).prev('input').val('');
            }
        });
      });
    },
    niceselect: function(){
      jQuery(document).ready(function() {
        jQuery('.nice-select').niceSelect();
      });
    },
    jscounter: function(){

      var counters = jQuery('.js-counter');
      counters.each(function () {
          var counter = jQuery(this),
              minus = counter.find('.js-counter-minus'),
              plus = counter.find('.js-counter-plus'),
              input = counter.find('.js-counter-input');
          minus.on('click', function () {
              var count = parseInt(input.val()) - 1;
              count = count < 1 ? 1 : count;
              input.val(count);
          });
          plus.on('click', function () {
              input.val(parseInt(input.val()) + 1);
          });
          input.blur(function () {
              if (input.val() == "") {
                  input.val("0");
              }
          });
          input.bind("change keyup input click", function () {
              input.val(input.val().replace(/[^\d]/, ""));
          });
      });
    },
    smoothScroll: function(){
      // Add smooth scrolling on all links inside the navbar
      jQuery(".sandy-smooth-href").on('click', function (event) {
        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
          // Prevent default anchor click behavior
          event.preventDefault();

          // Store hash
          var hash = this.hash;

          // Using jQuery's animate() method to add smooth page scroll
          // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
          jQuery('html, body').animate({
            scrollTop: jQuery(hash).offset().top
          }, 800, function () {

            // Add hash (#) to URL when done scrolling (default click behavior)
            window.location.hash = hash;
          });
        }  // End if
      });
    },
    rateyo: function(){

      var rating = jQuery(".js-rating");
      rating.each(function (index) {
        var _this = jQuery(this),
            readOnly = _this.data('read');

        jQuery(this).rateYo({
          rating: jQuery(this).data("rating"),
          fullStar: true,
          readOnly: readOnly,
          starWidth: "19px",
          spacing: "4px",
          normalFill: "#B1B5C3",
          ratedFill: "#FFD166",
          starSvg: '<svg width="19" height="18" viewBox="0 0 19 18" xmlns="http://www.w3.org/2000/svg"><path d="M6.49075 5.87586L9.19442 0.468508C9.29094 0.275471 9.56642 0.275471 9.66293 0.468508L12.3666 5.87586C12.4054 5.95351 12.4802 6.00687 12.5663 6.01834L18.3319 6.7871C18.547 6.81577 18.6359 7.07849 18.4825 7.2319L14.2421 11.4723C14.1802 11.5342 14.1533 11.623 14.1705 11.7089L15.3237 17.4749C15.3664 17.6886 15.1446 17.858 14.9497 17.7605L9.54581 15.0586C9.47207 15.0217 9.38529 15.0217 9.31155 15.0586L3.90765 17.7605C3.71271 17.858 3.49096 17.6886 3.5337 17.4749L4.6869 11.7089C4.70408 11.623 4.6772 11.5342 4.61528 11.4723L0.374865 7.2319C0.221458 7.07849 0.310398 6.81577 0.525446 6.7871L6.29111 6.01834C6.37715 6.00687 6.45193 5.95351 6.49075 5.87586Z" fill-opacity="1"/></svg>'
        });


          jQuery(this).rateYo("option", "onSet", function (rating, rateYoInstance) {
            jQuery(_this.data('input-id')).val(rating);
          });
      });
    },
    lightbox: function(){
      jQuery('.sandy-fancybox').fancybox({
        buttons: ['fullScreen', 'close'],
        loop: true
      });
    },
    cookie: function(){

      if (!app.cookie.getCookie('allowCookies')) {
          jQuery('.is-cookie').addClass('show');
      }

      jQuery('.is-cookie .noti-close-btn').click(()=>{
          app.cookie.setCookie('allowCookies','1',7);
          jQuery('.is-cookie').remove();
      });
    },
    prismLoad: function(){
      jQuery('.prism-wrap textarea').each(function(e){
        app.sandyPrism.update(this.value);
      });
    },
    plugins: function(){
      jQuery('.switch-is-customize .profile-background-types-wrapper').each(function(){
        jQuery(this).click(function(){
          jQuery('.switch-is-customize .profile-background-types-wrapper').find('input').prop('checked', false);
          jQuery(this).find('input').prop('checked', true);
        });
      });

    var toggle = jQuery('.sidebar__toggle'),
        page = jQuery('.page'),
        sidebar = jQuery('.sidebar'),
        headerToggle = jQuery('.header__toggle'),
        logo = jQuery('.header__logo'),
        close = jQuery('.sidebar__close');

    sidebar.removeClass('active');
    page.removeClass('wide');
    logo.removeClass('hidden');
    jQuery('body').removeClass('no-scroll');
    jQuery('html').removeClass('no-scroll');

    toggle.off().on('click', function () {
      if (sidebar.hasClass('small')) {
          sidebar.removeClass('small');
          page.removeClass('full');
          localStorage.setItem("admin-sidebar-small", 0);
      }else{
          sidebar.addClass('small');
          page.addClass('full');
          localStorage.setItem("admin-sidebar-small", 1);
      }
      setTimeout(function () {
        jQuery('.owl-carousel').trigger('refresh.owl.carousel');
      }, 200);
    });
    var checkstorage = localStorage.getItem('admin-sidebar-small');
    if (checkstorage === '1') {
      sidebar.addClass('small');
      page.addClass('full');
    }else{
      sidebar.removeClass('small');
      page.removeClass('full');
    }

    headerToggle.off().on('click', function () {
      sidebar.addClass('active');
      //page.addClass('toggle');
      page.addClass('wide');
      logo.addClass('hidden');
      jQuery('body').addClass('no-scroll');
      jQuery('html').addClass('no-scroll');
    });

    close.off().on('click', function () {
      sidebar.removeClass('active');
      //page.removeClass('toggle');
      page.removeClass('wide');
      logo.removeClass('hidden');
      jQuery('body').removeClass('no-scroll');
      jQuery('html').removeClass('no-scroll');
    });
  },
  mixEditRoute: function(){
    jQuery('.context-block-edit .context-block-edit-single').each(function(){
      var $route = jQuery(this).data('edit-route');

      //jQuery(this).find('.context-block-edit-body').find('a').attr('href', $route);
      jQuery(this).find('.context-block-edit-body').find('a').attr('app-sandy-prevent', '');
      
      jQuery(this).find('.context-block-edit-body').find('a').removeAttr('iframe-trigger');
      jQuery(this).find('.context-block-edit-body').find('a').removeAttr('target');
    });
  },
  
  bio_pwa: function(){
    var wrapper = jQuery('.bio-installation-bar-wrapper');

    jQuery(wrapper).each(function(){
      var notification_prompt = jQuery(this).find('.notification-bar.is-install-app');
      var bio_id = jQuery(this).data('id');

      var $wrapper = jQuery(this);
      var is_mobile = {
          Android: function() {return navigator.userAgent.match(/Android/i);},
          iOS: function() {return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
          Windows: function() {return navigator.userAgent.match(/Windows Phone/i);},
          any: function() {return (isMobile.Android() || isMobile.iOS() || isMobile.Windows());}
      };


      var storage = {
        key: "can_show_bio_pwa_" + bio_id,
        can_show: function(){
          if (localStorage.getItem(this.key) === null) {return true;}
          return false;
        },

        hide: function(){
          $wrapper.remove();
          localStorage.setItem(this.key, true);

        }
      };


      // Check if we should show PWA
      if (!storage.can_show()) {
        return false;
      }

      // Check for OS
      if (is_mobile.Android()) {
        $wrapper.find('.is-android').removeClass('hide');
      }

      if (is_mobile.iOS()) {
        $wrapper.find('.is-ios').removeClass('hide');
      }


      jQuery($wrapper).find('.noti-close-btn').click(()=>{
        storage.hide();
      });
    });



    jQuery('.bio-push-bar-wrapper').each(function(){
      var bio_id = jQuery(this).data('id');

      var $wrapper = jQuery(this);

      jQuery(window).scroll(function() {
          var scroll = jQuery(window).scrollTop();
          if (scroll >= 400) {
            $wrapper.addClass('hidden');
          }else{
            $wrapper.removeClass('hidden');
          }
      });

      var storage = {
        key: "can_show_bio_push_" + bio_id,
        can_show: function(){
          if (localStorage.getItem(this.key) === null) {return true;}
          return false;
        },

        hide: function(){
          $wrapper.remove();
          localStorage.setItem(this.key, true);
        }
      };


      // Check if we should show PWA
      if (!storage.can_show()) {
        return false;
      }


      $wrapper.find('.is-allow-push').removeClass('hide');


      jQuery($wrapper).find('.noti-close-btn').click(()=>{
        storage.hide();
      });

      jQuery($wrapper).find('.sandy-expandable-btn').click(() => {
        initFirebaseMessagingRegistration();
        storage.hide();
      });
    });



  },
  mix_settings:function(){
    jQuery(document).on("click", ".time-ampm-select", function () {
      jQuery(this).closest(".time-ampm-w").find(".active").removeClass("active");
      jQuery(this).addClass("active");
      var e = jQuery(this).data("ampm-value");
      jQuery(this).closest(".os-time-group").find(".ampm-value-hidden-holder").val(e);
    });

    jQuery(".weekday-schedule-w .sandy-switch .sandy-switch-input").each(function(){
      var object = {
          Cfunction: function(type, $this, tt = false){
              if(type){
                  var o = jQuery($this).closest(".weekday-schedule-w").removeClass("day-off");

                  if(tt){
                      o.addClass("is-editing");
                  }
              }else{

                  var o = jQuery($this).closest(".weekday-schedule-w").addClass("day-off");
                  if(tt){
                      o.removeClass("is-editing");
                  }
              }
          }
      };

      
      if(jQuery(this).is(':checked')){
          object.Cfunction(true, this);
          }else{
          object.Cfunction(false, this);
      }

      jQuery(this).on("change", function (e) {
          if(jQuery(this).is(':checked')){
              object.Cfunction(true, this, true);
          }else{
              object.Cfunction(false, this, true);
          }
      });
    });


    jQuery('.sidebar-toggle').off().on('click', function(){
        jQuery('.header-side').toggleClass('active');
    });
    jQuery('.open-mix-sidebar').off().on('click', function(){
      if (jQuery('#menu-sidebar').hasClass('active')) {
        jQuery('#menu-sidebar').removeClass('active');

        jQuery('.sidebar-backdrop').remove();
      }else{
        jQuery('#menu-sidebar').addClass('active');
        jQuery('body').append('<div class="sidebar-backdrop"></div>');

        jQuery('.sidebar-backdrop').addClass('show');
      }

    });

    jQuery(document).off().on('click', '.sidebar-backdrop', function(){
        jQuery('#menu-sidebar').removeClass('active');

        jQuery('.sidebar-backdrop').remove();
    });

    
  },

  bio_settings: function(){

    var switch_flag = function (flag) {
        var src = flag;
        jQuery('.flag-img-tag').attr('src', src);
        jQuery('.flag-img-tag').show();
    }

    var sw = jQuery('.contact-country-change');
    if(sw.length > 0){
      switch_flag(jQuery(sw).find(':selected').attr('data-flag'));
      sw.on('change', function () {
        var flag = jQuery(this).find(':selected').attr('data-flag');
        switch_flag(flag);
      });
    }

    jQuery('.-card-radio-focus-label').each(function(){
      var input = jQuery(this).find('input');
      var $this = jQuery(this);
      var $focus = jQuery($this.data('focus-i'));

      var objects = {
        refresh: function($i){
          
          $focus.addClass('active');
          $focus.css({
            'transform': `translateX(${$i.offsetLeft}px) translateY(${$i.offsetTop}px)`,
            'width': `${$i.offsetWidth}px`,
            'height': `${$i.offsetHeight}px`,
          });
        }
      };

      if (input.is(':checked')) {
        objects.refresh($this[0]);
      }

      var lastWidth = jQuery(window).width();
      jQuery(window).resize(function(){
        if(jQuery(window).width()!=lastWidth){
          if (input.is(':checked')) {
            objects.refresh($this[0]);
          }
            //execute code here.
            lastWidth = jQuery(window).width();
        }
      });
      input.on('change', function(){
        if (jQuery(this).is(':checked')) {
          objects.refresh($this[0]);
        }
      });
    });
    jQuery(document).ready(function() {
      jQuery('[data-toggle-fullscreen]').off().on('click', function(){
        var video = jQuery(this).data('toggle-fullscreen');
        var elem = jQuery(video)[0];

        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { /* Safari */
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { /* IE11 */
          elem.msRequestFullscreen();
        }
      });
      jQuery('.header-side .navbar-item').off().on('click', function(){
        jQuery('.header-side').removeClass('active');
      });
      
      jQuery('.javascript-history-back').off().on('click', function () {
        window.history.back();
      });
    });
   /* var initSelect2 = function(){

        jQuery(document).ready(function() {

          jQuery('.yetti-select2').select2({
              templateResult: yettiSelect2,
              templateSelection: yettiSelect2
          });
          
          jQuery('.yetti-select2').on('change', function (e) {
            var $this = jQuery(e.target);
            window.livewire.emit('useElement', {'id': e.target.value, 'index': $this.data('index'), 'block_id': $this.data('block_id')});
          });

          function yettiSelect2(opt) {
              if (!opt.id) {
                  return opt.text;
              }
              var optimage = jQuery(opt.element).data('image');
              var date = jQuery(opt.element).data('date');
              var iclass = jQuery(opt.element).data('icon');
              var $opt = jQuery(
              `<div class="meta-app px-0 justify-between py-2">
                  <div class="thumbnail h-avatar is-elem md is-video remove-before bg-gray-300 rounded-xl">
                      <i class="`+ iclass +` text-black"></i>
                  </div>
                  <div class="content text-right">
                      <p class="title text-xs font-bold">`+ jQuery(opt.element).text() +`</p>
                      <span class="text-gray-400">Added `+ date +`</span>
                  </div>
              </div>`
              );
              return $opt;
          };
      });
    }

    initSelect2();
  
    jQuery(document).ready(function () {
      window.livewire.on('select2', () => {
        initSelect2();
      });
    });*/

    jQuery(document).off().on('click', '.ws-head', function () {
      var e = jQuery(this).closest(".weekday-schedule-w");
      e.toggleClass("is-editing").removeClass("day-off"), e.find(".os-toggler").removeClass("off"), e.find("input.is-active").val(1);
    });

    jQuery(document).on('click', '.yetti-popup-close, .yetti-popup-overlay', function(){
      var closer = jQuery(this).closest('.yetti-popup');
      closer.removeClass('active');
    });
    jQuery(document).on('click', '.yetti-popup-opener', function(){
      var opener = jQuery(this).closest('.yetti-popup-wrapper').find('.yetti-popup');
      opener.addClass('active');
    });
    var userHasScrolled = false;
    window.onscroll = function (e){
        userHasScrolled = true;
    }
    objects = {
      scrolled_into_view: function(e) {
        var t = e.getBoundingClientRect(),
            n = t.top,
            o = t.bottom;
        return !0 === userHasScrolled ? n < window.innerHeight && o >= 30 : n < window.innerHeight + 140 && o >= 0
      },

      animate_block: function(){
        Array.from(document.querySelectorAll(".bio-margin")).forEach(function(t) {
            objects.scrolled_into_view(t) && t.classList.add("fadeInUp");
        });
      }
    };


    jQuery('.context-head').each(function(){
      window.innerWidth || document.documentElement.clientWidth;
      var e = this.offsetHeight;


      jQuery('.bio-menu').each(function(){
        var t = this;
        window.pageYOffset >= e ? jQuery(this).addClass('stick') : jQuery(this).removeClass('stick');
        objects.animate_block();
        
        window.addEventListener("scroll", function() {
            window.pageYOffset >= e ? t.classList.add("stick") : t.classList.remove("stick");
            objects.animate_block();
        });
      });
    });


    jQuery(document).click(function() {
      jQuery('.default-bio-banner').removeClass('active');
    });

    jQuery(window).scroll(function() {
      jQuery('.default-bio-banner').removeClass('active');
    });

    jQuery('.default-bio-banner').off().on('click', function(){
      jQuery(this).addClass('active');

      return false;
    });
  },
  customBioSlider: function(){
    
    var prevArrow = '<button type="button" class="slick-prev"><svg width="14" height="14" class="svg-icon orion-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="angle-right-1"><path data-name="layer1" stroke-miterlimit="10" d="M39 20.006L25 32l14 12.006" stroke-linejoin="round" stroke-linecap="round"></path></svg></button>',
    nextArrow = '<button type="button" class="slick-next"><svg width="14" height="14" class="svg-icon orion-svg-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="angle-right-1"><path data-name="layer1" stroke-miterlimit="10"  d="M26 20.006L40 32 26 44.006" stroke-linejoin="round" stroke-linecap="round"></path></svg></button>';


    jQuery(document).ready(function () {
      jQuery('.js-slide-features').slick({
        slidesToShow: 1,
        dots: true,
        arrows: false,
        speed: 500,
        infinite: false,
        arrows: true,
        prevArrow: prevArrow,
        nextArrow: nextArrow
      });

      jQuery('.js-slide-welcome-profile').slick({
        slidesToShow: 1,
        dots: true,
        arrows: false,
        speed: 500,
        infinite: false,
        arrows: true,
        prevArrow: prevArrow,
        nextArrow: nextArrow,
        adaptiveHeight: true
      });

      jQuery('.js-slider-stars').slick({
        autoplay: true,
        autoplaySpeed: 1000,
        slidesToShow: 5,
        dots: true,
        arrows: false,
        speed: 500,
        infinite: false,
        responsive: [{
          breakpoint: 1340,
          settings: {
            slidesToShow: 3
          }
        }, {
          breakpoint: 1023,
          settings: {
            slidesToShow: 2.4
          }
        }, {
          breakpoint: 767,
          settings: {
            slidesToShow: 2.4,
            infinite: false,
          }
        }, {
          breakpoint: 600,
          settings: {
            slidesToShow: 2,
            infinite: false,
          }
        }]
      });
    });

    var bioSwiperWrapper = jQuery('.bio-swiper-wrapper');
    bioSwiperWrapper.each(function(){
      var $this = jQuery(this);
      var left_arrow_offset, left_arrow = $this.find('.slide-left');
      var right_arrow = $this.find('.slide-right');
      var sliderA = $this.find('a');
      sliderA.each(function(e) {
          left_arrow_offset = jQuery(this).width();
      });
      var sliderAFunction = function(){
        return $this.find('.bio-swiper-slide').width();
      };

      var sliderAFunctionChange = sliderAFunction();

      window.addEventListener("resize", function() {
          sliderAFunctionChange = sliderAFunction();
      });
      var sliderALength = sliderA.length * left_arrow_offset,
          sliderAFMinus = sliderALength - sliderAFunctionChange;

      var objects = {
        sliderWidth: function($elem){
          var sliderAFMinus = sliderALength - sliderAFunctionChange;
          var leftWidth = jQuery($elem).scrollLeft();
          var o = sliderAFMinus - 20;

          if (leftWidth < o) {
            left_arrow.removeClass('hidden');
            right_arrow.removeClass('hidden');
          }

          if (leftWidth <= 20) {
            left_arrow.addClass('hidden');
            right_arrow.removeClass('hidden');
          }

          if (leftWidth >= o) {
            left_arrow.removeClass('hidden');
            right_arrow.addClass('hidden');
          }
        }
      };

      jQuery(this).find('.bio-swiper-slide').on( 'scroll', function(){
        objects.sliderWidth(jQuery(this));
      });

      jQuery('.slide-right').each(function(){
        jQuery(this).click(function(e){
          var sliderWidth = bioSwiperWrapper.find('.bio-swiper-slide').width();

          e.target.closest(".bio-swiper-wrapper").querySelector(".bio-swiper-slide").scrollBy({
              left: sliderWidth,
              behavior: "smooth"
          });
        });
      });

      jQuery('.slide-left').each(function(){
        jQuery(this).click(function(e){
          var sliderWidth = bioSwiperWrapper.find('.bio-swiper-slide').width();

          e.target.closest(".bio-swiper-wrapper").querySelector(".bio-swiper-slide").scrollBy({
              left: "-".concat(sliderWidth),
              behavior: "smooth"
          });
        });
      });

    });
  },

  bio: function(){


    if (jQuery('#sandy-embed-dialog').length > 0) {
      var dialogEl = document.getElementById('sandy-embed-dialog');
      var dialog = new A11yDialog(dialogEl);

      dialog.on('show', function (element, event) {
        var _self_id = event.currentTarget.getAttribute('data-sandy-embed');
        var _get_data = eval(_self_id);

        //console.log(item);
        //var docelement = document.querySelector()

        if (_get_data.h) {
          var dialog_content = element.querySelector('.sandy-embed-dialog-content');
          dialog_content.innerHTML = '';
          dialog_content.classList.remove('sandy-embed-dialog-iframe-fill');

          var o = document.createRange().createContextualFragment(_get_data.h);
          dialog_content.append(o);

          if (-1 !== _get_data.h.indexOf("<iframe")) {
            dialog_content.classList.add('sandy-embed-dialog-iframe-fill');
          }



          element.querySelector('.sandy-embed-dialog-content-wrapper .sandy-embed-dialog-source').innerHTML = 'View on ' + _get_data.w;
          element.querySelector('.sandy-embed-dialog-content-wrapper .sandy-embed-dialog-source').setAttribute('href', _get_data.fw);
        }
        return;
      });


      dialog.on('hide', function (element, event) {
        element.querySelector('.sandy-embed-dialog-content').innerHTML = '';
      });
    }

    if (jQuery('body').hasClass('bio-body')) {
      /*
      jQuery(window).scroll(function() {
          var scroll = jQuery(window).scrollTop();
          if (scroll >= 400) {
            jQuery('.bio-menu').addClass('stick');
          }else{
            jQuery('.bio-menu').removeClass('stick');
          }
      });
      const simpleBar = new SimpleBar(document.getElementById('content'));
      simpleBar.getScrollElement().addEventListener('scroll', function(e){
        var scroll = simpleBar.getScrollElement().scrollTop;


        if (scroll >= 400) {
          jQuery('.bio-menu').addClass('stick');
        }else{
          jQuery('.bio-menu').removeClass('stick');
        }
      });*/
    }
  },

  bioDark: function(){
    var objects = {
      toggleDark: function(route){
        if(jQuery('body.bio-body').hasClass('is-dark')){

          jQuery('body.bio-body').find('.bio-dark svg').hide();
          jQuery('body.bio-body').find('.bio-dark .night').show();

          axios.post(route, {dark: 0});
          localStorage.setItem("darkMode", 0);
          jQuery('body.bio-body').removeClass('is-dark');
        }else{
          jQuery('body.bio-body').find('.bio-dark svg').hide();
          jQuery('body.bio-body').find('.bio-dark .light').show();

          localStorage.setItem("darkMode", 1);
          axios.post(route, {dark: 1});
          jQuery('body.bio-body').addClass('is-dark');
        }
      }
    };
    jQuery('body.bio-body .bio-dark').each(function(){
      var input = jQuery(this).find('input');
      var darkModeClass = 'dark';

      input.on('change', function(){
        objects.toggleDark(jQuery(this).data('route'));
      });
    });
  },

  docs: function(){

    jQuery('[data-change-type]').each(function(){
      var $value = jQuery(this).data('change-type');
      var $input = jQuery(this).data('change-input');

      jQuery(this).click(function(){
        jQuery($input).val($value);
      });
    });

  },

  sandyToast: function(){
    jQuery('.sandy-fixed-toast').each(function(){
      var $toast = jQuery(this);
      setTimeout(function () {
        $toast.removeClass('hide');
      }, 500);

      setTimeout(function () {
        $toast.addClass('hide');
        //$toast.addClass('transition-all duration-200 ease-out opacity-0 transform -translate-y-2');
      }, 3000);

      setTimeout(function () {
        $toast.remove();
      }, 3500);
    });
    jQuery('.sandy-toast').each(function(){

      var $toast = jQuery(this);

      setTimeout(function () {
        $toast.addClass('hide');
      }, 6000);

      jQuery(this).find('.close').click(function(){
        $toast.addClass('hide');
      });
    });
  },

  copyData: function(){
    jQuery('[data-copy]').click(function(){
      var copy = jQuery(this).data('copy');
      var afterCopy = jQuery(this).data('after-copy');
      var PrevText = jQuery(this).html();

      app.copy(copy);

      jQuery(this).html(afterCopy);
      
      app.sleep(2000).then(() => {
        jQuery(this).html(PrevText);
      });
    });
  },

  plans: function (){
    var base = jQuery('#plan-base');
    var duration = 'monthly';
    var payment_method = 'none';

    if (!base.length) {
      return false;
    }

    var objects = {
      duration: function(){
        jQuery(document).on('change', '[data-duration]', function(){
          duration = jQuery(this).val();
          var price = jQuery(this).data('price');
          var duration_name = jQuery(this).data('duration');

          jQuery('.proceed-form').find('[name=duration]').val(duration);
          jQuery('.data-total').find('span').html(price);

          jQuery('.data-duration').find('.name').html(duration_name);
          jQuery('.data-duration').find('small').find('span').html(duration);
        });
      },

      payment_method: function(){
        var payi = jQuery('[data-payment-method]');
        if(payi.is(':checked')){
          
          var payment_method = payi.val();
          var payment_method_name = payi.data('payment-method'); 


          jQuery('.proceed-form').find('[name=gateway]').val(payment_method);
          jQuery('.data-payment-method').html(payment_method_name);
        }
        jQuery(document).on('change', '[data-payment-method]', function(){
          payment_method = jQuery(this).val();
          var payment_method_name = jQuery(this).data('payment-method'); 


          jQuery('.proceed-form').find('[name=gateway]').val(payment_method);
          jQuery('.data-payment-method').html(payment_method_name);
        })
      },
    };

    objects.duration();
    objects.payment_method();
  },

  sandyHtml2Canvas: function(){
    jQuery(document).on('click', '.html-to-canvas-download', function(){
      var $html = jQuery(this).data('html');
      var $name = jQuery(this).data('name');

      html2canvas(document.querySelector($html)).then(function(canvas) {
          var myImage = canvas.toDataURL("image/png");

          var link = document.createElement("a");
          link.download = $name;
          link.href = myImage;
          link.click();

          link.remove();
      });
    });
  },
  sandyaccordion: function(){



    
    var item = jQuery('.yetti-links-v2.is-accordion');
    item.each(function(){
      var $this = jQuery(this);
      var head = $this.find('.yetti-links-v2-inner'),
      body = $this.find('.yetti-links-v2-body');

      head.off().on('click', function (e) {
        var thisHead = jQuery(this);
        $this.toggleClass('active');
        body.slideToggle();
      });
    });

    var item = jQuery('.sandy-accordion');
    item.each(function(){
      var $this = jQuery(this);
      var head = $this.find('.sandy-accordion-head'),
      body = $this.find('.sandy-accordion-body');

      head.off().on('click', function (e) {
        var thisHead = jQuery(this);
        $this.toggleClass('active');
        body.slideToggle();
      });
    });
  },

  sandyPricing: function(){
    jQuery('.change-pricing-selector').each(function(){
      jQuery(this).find('[data-price-change]').click(function(e){
        e.stopPropagation();
        e.preventDefault();

        var $change = jQuery(this).data('price-change');

        jQuery('.pricing-price-content').find('[data-price-selector]').hide();

        jQuery('.pricing-price-content').find($change).show();

        jQuery('[data-price-change]').removeClass('active');
        jQuery(this).addClass('active');
      });
    });
  },
  lozad: function(){
    var observer = lozad();
    observer.observe();
  },
  sandyIndex: function(){
    sal();
    jQuery('.trans-index-dropdown form [name="locale"]').on('change', function(){
      jQuery(this).closest('form').submit();
    });
    
    jQuery('[data-video-blob]').each(function(){
      var blob_url = jQuery(this).attr('data-video-blob');
      jQuery(this).attr('src', blob_url);

      
      var URL = window.URL || window.webkitURL;
      var file = new Blob([blob_url], {"type" : "video\/mp4"});
      var value = URL.createObjectURL(file);
      
      jQuery(this).attr('src', value);
      this.load();
    });

    jQuery('.index-header-item').each(function(){
      var $headerUser = jQuery(this);

      jQuery(this).find('.index-header-head').off().on('click', function(e){
        e.stopPropagation();

        $headerUser.toggleClass('active');
      });

      jQuery(this).find('.index-header-body').on('click', function (e) {
        e.stopPropagation();
      });

      jQuery('html, body').on('click', function () {
        $headerUser.removeClass('active');
      });
    });


    jQuery('.index-form-register').each(function(){
      var $label = jQuery(this).find('label');
      var $input = jQuery(this).find('input');

      $input.on('focus', function(){
        $label.addClass('focus');
      });

      $input.on('blur', function(){
        if (jQuery(this).val() === '') {
          $label.removeClass('focus');
        }
      });

      $input.each(function(){
        if (jQuery(this).val() === '') {
          $label.removeClass('focus');
        }else{
          $label.addClass('focus');
        }
      });
    });
    var footerHead = jQuery('.footer-head'),
        footerBody = jQuery('.footer-body');
    footerHead.off().on('click', function () {
      jQuery(this).toggleClass('active');
      jQuery(this).next().slideToggle();
    });

    var feature_row = jQuery('.feature-row');

    feature_row.each(function(){

      jQuery(this).click(function(){
        feature_row.removeClass('open-feature');
        var skin = jQuery(this).data('feature-skin');
        var image = jQuery(this).data('feature-img');

        jQuery(this).addClass('open-feature');

        jQuery('.screenshot').attr("data-background-image", image);

        jQuery('.screenshot').each(function(){
          jQuery(this).css('opacity', '0');
          jQuery(this).css('transform', 'translateX(20%)');
        });

        app.sleep(900).then(() => {
          jQuery('.screenshot').each(function(){
            jQuery(this).css('background-image', 'url('+ image +')');
            jQuery(this).css('opacity', '1');
            jQuery(this).css('transform', 'none');
          });

          jQuery('[data-features]').removeClass();
          jQuery('[data-features]').addClass(skin);
        });
      });
    });
  jQuery(window).scroll(function() {
      var scroll = jQuery(window).scrollTop();

      if (scroll >= 50) {
          jQuery(".sticky").addClass("nav-sticky");
          jQuery(".-sticky").addClass("nav-sticky");
          jQuery("body").addClass("fixed-header");
      } else {
          jQuery(".sticky").removeClass("nav-sticky");
          jQuery(".-sticky").removeClass("nav-sticky");
          jQuery("body").removeClass("fixed-header");
      }
  });
  var header = jQuery('.js-header'),
      items = header.find('.js-header-item'),
      burger = header.find('.js-header-burger'),
      wrapper = header.find('.js-header-wrapper');

  burger.removeClass('active');
  wrapper.removeClass('visible');

    burger.off().on('click', function (e) {
      e.stopPropagation();
      burger.toggleClass('active');
      wrapper.toggleClass('visible');
    });
  },

  sandyChart: function (){
      // colors
    var blue = '#A0D7E7';
    var blueLight = '#0e97b5';
    var purple = '#6C5DD3';
    var white = '#ffffff';
    var blueOpacity = '#e6efff';
    var blueLight = '#50B5FF';
    var pink = '#FFB7F5';
    var orangeOpacity = '#fff5ed';
    var yellow = '#FFCE73';
    var green = '#7FBA7A';
    var red = '#FF754C';
    var greenOpacity = '#ecfbf5';
    var gray = '#808191';
    var grayOpacity = '#f2f2f2';
    var grayLight = '#E2E2EA';
    var borderColor = "#E4E4E4";
    // var text = "#171725";

    // charts
    Apex.chart = {
      fontFamily: 'Inter, sans-serif',
      fontSize: 13,
      fontWeight: 500,
      foreColor: gray
    };

    // chart earning
    jQuery('.chart-line').each(function(){
        // Options
        var _self_id = jQuery(this).attr('data-chart'),
                      _get_data = eval(_self_id);
     
        var options = {
          labels: _get_data.labels,
          series: _get_data.series,
          colors: _get_data.colors ? _get_data.colors : [grayOpacity, blue],
          chart: {
            height: '100%',
            type: 'line',
            toolbar: {
              show: false
            }
          },
          grid: {
            borderColor: borderColor,
            strokeDashArray: 0,
            xaxis: {
              lines: {
                show: false
              }
            },
            yaxis: {
              lines: {
                show: false
              }
            },
            padding: {
              top: 0,
              left: 15,
              right: 0,
              bottom: 0
            }
          },
          stroke: {
            width: 2,
            curve: 'smooth'
          },
          xaxis: {
            axisBorder: {
              show: false
            },
            axisTicks: {
              show: false
            },
            tooltip: {
              enabled: false
            },

            labels: {
              style: {
                colors: _get_data.textColor ? _get_data.textColor : '#fff'
              }
            }
          },
          yaxis: {
            axisBorder: {
              color: borderColor
            },
            axisTicks: {
              show: false
            },
            tooltip: {
              enabled: false
            },
            labels: {
              style: {
                colors: _get_data.textColor ? _get_data.textColor : '#fff'
              }
            }
          },
          legend: {
            show: false
          },
          dataLabels: {
            enabled: false
          },
          tooltip: {
            x: {
              show: false
            }
          }
        };

        var $this = jQuery(this);

        if (this != null) {
          new ApexCharts(this, options).render();
        }
      });

              
        jQuery('[data-quick-chart]').each(function(){
          var chart = jQuery(this).data('quick-chart');
          var array = eval(chart);
          var objects = {
              max: function($this){
                  return Math.max.apply(null, $this);
              }
          };

          var color = jQuery(this).data('color');
          
          var w = this.clientWidth;
          var h = this.clientHeight;
          while (this.hasChildNodes()) {
              this.removeChild(this.lastChild);
          }

          var nBars = array.length;
          var barWidth = Math.min(60, (w-5*(nBars+1))/nBars);
          var maxCount = objects.max(array);
          for (var i = 0; i < nBars; i++){
              var bar = document.createElement("div");
              bar.style.width = barWidth+'px';
              var currentHeight = Math.round(0.95*h*parseFloat(array[i])/maxCount);

              if(currentHeight == 0){
                  currentHeight = '1';
              }

              bar.style.height=currentHeight+'px';
              bar.style.position='absolute';
              bar.style.left=0+(barWidth+5)*(i-0)+'px';
              bar.style.backgroundColor = color;
              bar.style.borderRadius='10px 10px 0 0';
              bar.style.bottom='0';
              this.appendChild(bar);
          }
      });
    },
  sandyTooltip: function(){
    jQuery('[data-hover]').each(function(){
      var $message = jQuery(this).attr('data-hover');
      new $.sandy_tooltips($(this), {
        content: $message
      });
    });
  },
  sandyDropdown: function(){
      var dropdowns = $('.dropdown');
    dropdowns.each(function () {
      var dropdown = jQuery(this);
      head = dropdown.find('.dropdown__head'), body = dropdown.find('.dropdown__body');
      head.off().on('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        if (!dropdown.hasClass('active')) {
          dropdowns.removeClass('active');
          dropdown.addClass('active');
        } else {
          dropdowns.removeClass('active');
        }
      });
      body.on('click', function (e) {
        e.stopPropagation();
      });
      jQuery('body').on('click', function () {
        dropdowns.removeClass('active');
      });
    });
  },
  usersThief: function(){
    /*
    jQuery('.users.color-thief').each(function(){
      var $users = jQuery(this);
      const colorThief = new ColorThief();
      var objects = {
        load: function($this){
            var color = colorThief.getColor($this);
            var rgb = 'rgb(' + color + ')';
            $users.css('background', rgb);
        }
      };

      var $img = jQuery(this).find('.user-preview .avatar').find('img');

      $img.each(function(){
        var $this = this;
        jQuery(window).on('load',function () {
            objects.load($this);
        });
        objects.load($this);
      });

    });*/
  },

    selectCheckboxes: function(){
      jQuery(document).on('click', '[data-inputs]', function(){
          var $that = jQuery(this).find('input');
          var $dataClasses = jQuery(this).data('inputs');
          jQuery(''+$dataClasses+':checkbox').each(function() {
              this.checked = $that.is(':checked');

              if($(this).closest('.users')){
                if ($(this).is(':checked')) {
                  $(this).closest('.users').addClass('active');
                }else{
                  $(this).closest('.users').removeClass('active');
                }
              }
          });
      });
      jQuery(document).on('change', '.users-checkbox input', function(){
          if($(this).closest('.users')){
            if ($(this).is(':checked')) {
              $(this).closest('.users').addClass('active');
            }else{
              $(this).closest('.users').removeClass('active');
            }
          }
      });

      $(document).on('click', '.update-all', function(){
         var url = $(this).data('route');
          $.ajaxSetup({
              headers: {
                  'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
              }
          });
          var actions = $('input[name="action[]"]').map(function(){
            if(this.checked){
              return this.value;
            }
          }).get();

          $.ajax({
              type: "POST",
              url: url,
              data: {'action[]':actions},
              dataType: "json",
              success: function (data) {
                if(data.response == 'success'){
                  location.reload();
                }
              }
          });
      });
    },

    sandyTabs: function(){
      var tabs = jQuery('.sandy-tabs');
      tabs.each(function () {
        var thisTabs = jQuery(this),
            nav = thisTabs.find('.sandy-tabs-link'),
            option = thisTabs.find('.option'),
            item = thisTabs.find('.sandy-tabs-item');


        nav.each(function(){
          if (jQuery(this).hasClass('active')) {
            var $index = jQuery(this).index();
            item.hide();
            item.eq($index).fadeIn();
          }
        });

        nav.on('click', function () {
          var thisNav = jQuery(this),
              indexNav = thisNav.index();
          nav.removeClass('active');
          thisNav.addClass('active');
          item.hide();
          item.eq(indexNav).fadeIn();
        });

      });

      jQuery(document).ready(function () {
        var option = jQuery('.sandy-tabs-select .option');

        option.on('click', function () {
          var thisOption = jQuery(this),
              indexOption = thisOption.index();
          jQuery('.sandy-tabs-item').hide();
          jQuery('.sandy-tabs-item').eq(indexOption).fadeIn();
        });
      });
    },
    changeMenu: function(){
      jQuery('.action-list-item').each(function(){
        const getUrl = window.location;
        const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
        var $href = jQuery(this).attr('href');
        jQuery(this).removeClass('active');
        if (getUrl == $href) {
          jQuery(this).addClass('active');;
        }

        jQuery(this).click(function(){
          jQuery('.action-list-item').removeClass('active');
          jQuery(this).addClass('active');
        });
      });

      jQuery('.nav-link').each(function(){
        const getUrl = window.location;
        const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
        var $href = jQuery(this).attr('href');
        jQuery(this).removeClass('active');
        if (getUrl == $href) {
          jQuery(this).addClass('active');;
        }
      });

      jQuery('.sidebar__item').each(function(){
        const getUrl = window.location;
        const baseUrl = getUrl.protocol + "//" + getUrl.host + "/";
        var $href = jQuery(this).attr('href');
        jQuery(this).removeClass('active');
        if (getUrl == $href) {
          jQuery(this).addClass('active');;
        }
      });
    },

    sandyDynamicDiv: function(){
      var objects = {
        reload: function(){
          var x = 0;
          jQuery('[data-dynamic-wrapper] [data-dynamic-item]').each(function(){
            x++
            var items_name = jQuery(this).data('items-name');
            jQuery(this).data('dynamic-item', x);

            jQuery(this).find('.dynamic-X').html(x);

            jQuery(this).find('[data-item-name]').each(function(){
              var name = jQuery(this).data('item-name');

              var dynamic_name = items_name + '[' + x + '][' + name + ']';
              jQuery(this).attr('name', dynamic_name);
            });
          });
        }
      };

      var button = jQuery('[data-dynamic-add]');
      var wrapper = jQuery('[data-dynamic-wrapper]');
      var template = jQuery('[data-dynamic-template]').html();

      jQuery(button).click(function(e){
        e.preventDefault();
        jQuery(wrapper).append(template);

        app.utils.sandyaccordion();
        app.utils.formSelect();
        app.utils.dataCheckboxopen();
        app.utils.sandySelectInit();
        
        objects.reload();
      });

      jQuery(wrapper).on("click", "[data-dynamic-remove]", function(e){
        e.preventDefault();
        jQuery(this).closest('[data-dynamic-item]').remove();

        objects.reload();
      });



      objects.reload();
    },

    checkImages: function(){
      jQuery('img').each(function(){
          jQuery(this).on('error', function() {
              jQuery(this).css('display', 'none');
          });
      });
    },

    inIframe: function(){
      try {
        return window.self !== window.top;
      } catch(e){
        return true;
      }
    },

    isSubmit: function(){
      jQuery('form').on('submit', function(){
        jQuery(this).find('button:not(.no-disabled-btn)').prop('disabled', true);
      });
    },

    sandyIframeModal: function(){
      var objects = {
          showmodal: function(url, el, dialog){
            var $dialog = jQuery(dialog);
            var iframe = $('<iframe />').attr('src', url).hide();

            if ($dialog.hasClass("remove-loader")) {
              iframe.show();
            }

            var append = $dialog.find('.sandy-dialog-body').append(iframe);

            var $data_hidden = jQuery(el).data('take-hidden');
            var $data_get_hidden = jQuery($data_hidden);

            var $data_hidden_fill = jQuery(el).data('hidden-fill');

            iframe.on('load', function(){
              $dialog.find('.sandy-ball-loader').remove();
              $dialog.removeClass('is-loading');
              iframe.show();
              
              if($dialog.hasClass('fit-iframe-height')){
                jQuery(this).height(jQuery(this).contents().height());
                iframe.addClass('w-full');
              }

              jQuery(this).contents().find('body').find($data_hidden_fill).append($data_get_hidden.clone().hide());
            });

            $dialog.find('[data-open-popup]').attr('href', url);
            /*
            $.ajax({
              url: url,
              success: function(res){
                $dialog.find('.sandy-dialog-body').html(res);
              }
            });*/
          },

          preloader: function(dialog){
            var $dialog = jQuery(dialog);
            var $html = '<div class="sandy-ball-loader">   <div class="ball ball-1"></div>   <div class="ball ball-2"></div>   <div class="ball ball-3"></div>   <div class="ball ball-4"></div>   <div class="ball ball-5"></div>   <div class="ball ball-6"></div>   <div class="ball ball-7"></div>   <div class="ball ball-8"></div></div>';
            $dialog.find('.sandy-dialog-body').empty();
            if ($dialog.hasClass("remove-loader")) {
              return false;
            }

            $dialog.addClass('is-loading');
            $dialog.find('.sandy-dialog-body').append($html);
          },

          modalStatus: function(type){
            var opacity = '0';
            if (type === 'close') {
              opacity = '1';
            }

            jQuery('.floaty-bar').css('opacity', opacity);
            jQuery('.header').css('opacity', opacity);
            jQuery('.simplebar-track').css('opacity', opacity);
          }
      };


      jQuery('[data-has-iframe-modal]').each(function(){
          var trigger = jQuery(this).data('popup');
          var $this = jQuery(this);
          jQuery(this).sandyDialog({
              opener: trigger + '-open',
              closer:  trigger + '-close',
              modal: true
          }).on('dialog:open', function(e, $elem) {
            var url = jQuery($elem).attr('href');
            objects.preloader($this);
            objects.modalStatus('show');
            objects.showmodal(url, $elem, $this);
          }).on('dialog:close', function(e, $elem) {
            objects.modalStatus('close');
          });
      });

        jQuery('[data-iframe-modal]').sandyDialog({
          opener: '[iframe-trigger]',
          closer:  '.iframe-trigger-close',
          modal: true
        }).on('dialog:open', function(e, $elem) {
          var url = jQuery($elem).attr('href');

          objects.preloader('[data-iframe-modal]');

          objects.modalStatus('show');
          objects.showmodal(url, $elem, '[data-iframe-modal]');
          jQuery('[data-iframe-modal]').addClass('fadeInUp animated delay-4s');
        }).on('dialog:close', function(e, $elem) {
          objects.modalStatus('close');
          
          jQuery('[data-iframe-modal]').removeClass('fadeInUp animated delay-4s');
        });
    },

    sandyDelete: function(){
      jQuery(document).on('click', '[data-delete]', function(e){
          var $this = jQuery(this);
          e.preventDefault();
          e.stopImmediatePropagation();
         
          let message = jQuery(this).attr('data-delete');
          let title = typeof jQuery(this).data('title') !== 'undefined' ? jQuery(this).data('title') : jQuery('[data-delete-data]').attr('data-title');

          let cancel = typeof jQuery(this).data('cancel') !== 'undefined' ? jQuery(this).data('cancel') : jQuery('[data-delete-data]').attr('data-cancel');

          let confirm = typeof jQuery(this).data('confirm-btn') !== 'undefined' ? jQuery(this).data('confirm-btn') : jQuery('[data-delete-data]').attr('data-confirm-btn');

          let confirm_btn_color = typeof jQuery(this).data('confirm-btn-color') !== 'undefined' ? jQuery(this).data('confirm-btn-color') : 'text-red-500';

          $.confirm(message, {
            title: title,
            cancelButton:cancel,
            ConfirmbtnClass: confirm_btn_color,
            confirmButton: confirm,
            callEvent:function(){
              if ($this.is("[href]")) {
                window.location = $this.attr('href');
              }
              $this.parent('form').submit();
            },
            cancelEvent:function(){
              return false;
            }
          });
      });
    },

    dataBG: function(){
      jQuery('[data-bg]').each(function(){
        var e = jQuery(this).attr('data-bg');
        jQuery(this).css("background-image","url("+e+")");
      });
      jQuery('[bg-style]').each(function(){
        var e = jQuery(this).attr('bg-style');
        jQuery(this).css("background", e);
      });
    },

    sandySelectInit: function(){
      var sandySelect = jQuery('.sandy-select');


      sandySelect.each(function(){
        var $this = jQuery(this);

        jQuery(this).on('click', function () {
          jQuery(this).toggleClass('is-active');
        });

      $this.find('input[type="radio"]').eq(0).each(function(){
        var selectedValue = jQuery(this).siblings('.option-meta').html();
        var $sandySelect = jQuery(this).closest('.sandy-select').find('.select-box');
            $sandySelect.html(selectedValue).find('.text-sticker').hide();
      });

      jQuery(this).find('input[type="radio"]').each(function(){
          var selectedValue = jQuery(this).siblings('.option-meta').html();
          var $sandySelect = jQuery(this).closest('.sandy-select').find('.select-box');

          jQuery(this).on('change', function(){
            $sandySelect.html(selectedValue).find('.text-sticker').hide();
          });

          if (jQuery(this).attr('checked')) {
            $sandySelect.html(selectedValue).find('.text-sticker').hide();
          }
        });
      });

      jQuery(document).click(function(event) {
          if (!jQuery(event.target).closest('.sandy-select').length) {
            jQuery('.sandy-select').removeClass('is-active');
          }
      });
    },
    text_count_limit: function(){
        jQuery('.text-count-limit').each(function(){
          var limit = jQuery(this).attr('data-limit');
          var $text_field = jQuery(this).find('.text-count-field');
          $text_field.text(limit);

          jQuery(this).find('input').each(function(){
            var count = jQuery(this).val().length;
            app.functions.inputTextCount($text_field, limit, count);
          })

          jQuery(this).find('input').bind('keyup', function(e){
            var count = jQuery(this).val().length;
            app.functions.inputTextCount($text_field, limit, count)
          });


          // Text area

          jQuery(this).find('textarea').each(function(){
            var count = jQuery(this).val().length;
            app.functions.inputTextCount($text_field, limit, count);
          })

          jQuery(this).find('textarea').bind('keyup', function(e){
            var count = jQuery(this).val().length;
            app.functions.inputTextCount($text_field, limit, count)
          });
        });
      },

    popup: function(){
      jQuery('[data-popup]').each(function(){
        var data = jQuery(this).data('popup');
        var $this = jQuery(this);
        jQuery(this).sandyDialog({
          opener: data + '-open',
          closer:  data + '-close',
          modal: true
        }).on('dialog:open', function(e, $elem) {

          jQuery('.floaty-bar').css('opacity', '0');
          jQuery('.header').css('opacity', '0');
          jQuery('.simplebar-track').css('opacity', '0');

        }).on('dialog:close', function(e, $elem) {
          jQuery('.floaty-bar').css('opacity', '1');
          jQuery('.header').css('opacity', '1');
          jQuery('.simplebar-track').css('opacity', '1');

          
        });
      });

      

      jQuery('[data-element-pickr]').sandyDialog({
        opener: '.element-pickr-trigger',
        closer:  '.element-pickr-close',
        modal: true
      }).on('dialog:open', function(e, $elem) {
        var $dialog = jQuery(this);
        var $elem = jQuery($elem);

        var $event_id = $elem.data('event-id');
        var $inputs = $dialog.find('[name="elements"]');

        $inputs.off().on('change', function(){
          var $this = jQuery(this);

          var $event_to_fire = new CustomEvent($event_id, {
            "detail": {"route": $this.data('route'), "id": $this.val()}
          });
          document.dispatchEvent($event_to_fire);
        });
      }).on('dialog:close', function(e, $elem) {
        
      });
    },

    avatarCustom: function(){
      jQuery(".avatar-upload-input").change(function() {
        var input = this;
        var $this = jQuery(this);
        var $parent = $this.closest('.avatar-upload');
        if (input.files && input.files[0]) {
          var reader = new FileReader();
          reader.onload = function(e) {
              $parent.find('img').css('display', 'block');
              $parent.find('img').attr("src", ""+e.target.result+"");
              $parent.addClass('active');
          }
          reader.readAsDataURL(input.files[0]);
        }
      });
    },

    nr: function(number, decimals = 0, digits = 1){
      var si = [
        { value: 1, symbol: "" },
        { value: 1E3, symbol: "kB" },
        { value: 1E6, symbol: "MB" },
        { value: 1E9, symbol: "GB" },
        { value: 1E12, symbol: "TB" },
        { value: 1E15, symbol: "P" },
        { value: 1E18, symbol: "E" }
      ];
      var rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
      var i;
      for (i = si.length - 1; i > 0; i--) {
        if (number >= si[i].value) {
          break;
        }
      }
      return (number / si[i].value).toFixed(digits).replace(rx, "$1") + si[i].symbol;
    },

    genericUploadPreview:function(){

      var $sandy_h_avatar = jQuery('.sandy-upload-modal-open');
      jQuery('[data-generic-preview]').each(function(){
        var $parent = jQuery(this);
        var $input = jQuery($parent).find('input[type=file]');

        $input.on("change", function(e) {
              $parent.find('.list-files').empty();
              const $this = jQuery(this);
              var files = e.target.files, filesLength = files.length;
              for (var i = 0; i < filesLength; i++) {
                var f = files[i]
                var fileReader = new FileReader();

                fileReader.onload = (function(e) {
                  var file = f;

                  $parent.find('img, video').css('display', 'block');
                  $parent.find('img, video').attr("src", ""+e.target.result+"");
                  $parent.addClass('active');

                  $parent.find('.image').css('background-image', 'url('+ e.target.result +')');
                  $parent.find('.file-name').html(file.name);
                  
                  if ($parent.hasClass('is-sandy-upload-modal')) {
                    $sandy_h_avatar.find('.image').css('background-image', 'url('+ e.target.result +')');
                    $sandy_h_avatar.find('img, video').attr("src", ""+e.target.result+"");
                    $sandy_h_avatar.find('img, video').css('display', 'block');
                    $sandy_h_avatar.find('.file-name').html(file.name);
                    $sandy_h_avatar.addClass('active');
                  }

                  var item_is_image = jQuery('<div class="list-file"><div class="list-header"><span class="list-title">'+file.name+'</span><span class="list-size">'+ app.utils.nr(file.size, 0, 1) +'</span><span class="list-drag"><i class="sni sni-drag"></i></span></div><main class="list-thumbnail"><img alt="" src="'+e.target.result+'" class=""></main></div>').hide();


                  var item_is_file = jQuery('<div class="list-file"><div class="list-header"><span class="list-title">'+file.name+'</span><span class="list-size">'+ app.utils.nr(file.size, 0, 1) +'</span><span class="list-drag"><i class="sni sni-drag"></i></span></div><main class="list-thumbnail"></main></div>').hide();

                  if (file.type.match('image.*')) {
                    $parent.find('.list-files').append(item_is_image);
                    item_is_image.slideDown('normal'); 
                  }else{
                    $parent.find('.list-files').append(item_is_file);
                    item_is_file.slideDown('normal'); 
                  }
                });
                fileReader.readAsDataURL(f);
              }
            });
      });
    },

    thumbnail: function(){
      /*
      var object = {
        getColorFromBase64: function(image, id){
            const colorThief = new ColorThief();

            img = document.createElement('img');
            img.src = image;
            img.onload = function(){
              colorThief.getPalette(img);
              var color = colorThief.getColor(img);
              img.remove();

              var rgb = 'rgb(' + color + ')';
              object.addCss(id, rgb);
            }
        },

        addCss: function(id, rgb){
              addRule("#"+id+" .thumbnail:after", {
                  background: ""+rgb+" !important",
                  opacity: "0.5"
              });

              addRule("#"+id+" .thumbnail:before", {
                  background: ""+rgb+" !important",
                  opacity: "0.3"
              });
        },
      };


      jQuery('.thumbnail-upload.has-shadow').each(function(){
        $this = jQuery(this);
        object.getColorFromBase64($this.find('img').attr('src'), $this.attr('id'));
      });*/

      jQuery(".thumbnail-upload-input").change(function() {
        var input = this;
        var $this = jQuery(this);
        var $parent = $this.closest('.thumbnail-upload');
        if (input.files && input.files[0]) {
          var reader = new FileReader();
          reader.onload = function(e) {
              $parent.find('img').css('display', 'block');
              $parent.find('img').attr("src", ""+e.target.result+"");
              $parent.addClass('active');
              /*
              if ($parent.hasClass('has-shadow')) {
                object.getColorFromBase64(e.target.result, $parent.attr('id'));
              }*/
          }
          reader.readAsDataURL(input.files[0]);

        }
      });
    },

    playVideo: function(){

      jQuery('.element-single-video-container:not(.is-disabled)').each(function(){
        var $href = jQuery(this).attr('href');

        // CLick

        jQuery(this).click(function(){
          var elem = document.createElement("iframe");
          elem.setAttribute('frameborder', '0');
          elem.setAttribute('allowfullscreen', '');
          elem.setAttribute('src', $href);

          jQuery(this).html('');
          jQuery(this).append(elem);
          jQuery(this).closest('.element-single-video').addClass('is-iframe');
        });
      });
    },

    sandyPlaceholder: function(){
      jQuery('[data-placeholder]').each(function(){
        var placeholder = jQuery(this).data('placeholder');
        var placeholderInput = jQuery(this).data('placeholder-input');
        var objects = {
          placeholderChange: function(input, placeholder){
            jQuery(input).attr('placeholder', placeholder);
          }
        };


        jQuery(this).on('change', function(){
          objects.placeholderChange(placeholderInput, placeholder);
        });
        
        if (jQuery(this).is(':checked')) {
          objects.placeholderChange(placeholderInput, placeholder);
        }

      });
    },

    sandyShowPassword: function(){
      jQuery('.show-hide-password').each(function(){
        var $show = jQuery(this);
        jQuery(this).find('.show-password').on('click', function(e){
          e.preventDefault();
          var $this = jQuery(this);

            if ($show.find('input').attr("type") === "text") {
              $show.find('input').attr('type', 'password');
              $this.find('i').removeClass().addClass('sni sni-eye');
            } else if ($show.find('input').attr("type") === "password") {

              $show.find('input').attr('type', 'text');
              $this.find('i').removeClass().addClass('sni sni-eye-off');
            }
        });
      });
    },

    sortable: function (){
      // dragula
      var options = {

      }
      var containerElement = document.querySelector('.dragula-sortable');

      jQuery('.dragula-sortable').each(function(){
        var $this = jQuery(this);
        var $thisthis = this;
        var $route = jQuery(this).data('route');
        var $handle = $this.data('handle');
        var scrollable = true;

        var listener = function(e) {
            if (! scrollable) {
                e.preventDefault();
            }
        }

        document.addEventListener('touchmove', listener, { passive:false });

        var container = dragula([this], {
          moves: function (el, container, handle) {

            if ($this.find('.' + $handle).length) {
              return handle.classList.contains($handle);
            }

            return true;
          }
        });


        var scroll = autoScroll([window, $thisthis],{
            margin: 150,
            maxSpeed: 10,
            autoScroll: function(){
                return this.down && container.dragging;
            }
        });

        container.on('drag', function(){
          scrollable = false;
        });

        container.on('dragend', function(el, source) {
            scrollable = true;
        });

        container.on('drop', function(){
          scrollable = true;

          let data = [];
          $this.find('.sortable-item').each((i, elm) => {
            let items = {
              id: jQuery(elm).data('id'),
              position: i
            };

            data.push(items);
          });

          $.ajaxSetup({
              headers: {
                  'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
              }
          });

          $.ajax({
              type: "POST",
              url: $route,
              dataType: 'json',
              data: {
                  data: data
              }
          });
        });
      });

      var sortme = {
        reset: function(){

          jQuery('.sortable-arrows').each(function(){

            var i=0;
            jQuery(this).find('.sortable-item').each(function(){
              //$(this).data('sort',i);
              jQuery(this).attr("data-sort", i);
              i++;
            });
          });
        },

        updated: function($wrapper){
          var $this = $wrapper;
          
          var upgrade = $this.find('[data-upgrade-block]');
          $this.find('[data-upgrade-block]').remove();

          var eq = parseInt(upgrade.data('upgrade-block'));
          eq = isNaN(eq) ? 0 : eq - 1;

          $this.find('> .sortable-item').eq(eq).after(upgrade.prop('outerHTML'));

          let data = [];
          $this.find('> .sortable-item').each((i, elm) => {
              let items = {
                  id: jQuery(elm).data('id'),
                  position: i
              };
              data.push(items)
          });
          $.ajaxSetup({
                headers: {
                    'X-CSRF-TOKEN': jQuery('meta[name="csrf-token"]').attr('content')
                }
            });

            $.ajax({
                type: "POST",
                url: $this.data('route'),
                dataType: 'json',
                data: {
                    data: data
                }
          });
        }
      }

      if(jQuery('.sortable-arrows').length > 0){
        

        sortme.reset();
        jQuery('[data-dir]').click(function(e){
          var $wrapper = jQuery(this).closest('.sortable-arrows');
          var $this = jQuery(this), dir = $this.data('dir'), item = jQuery(this).closest('.sortable-item');
          var index = item.data('sort');

          switch (dir) {
            case 'up':
              var prev = item.prev('.sortable-item');
              item.insertBefore(prev);
              sortme.reset();

              //
              sortme.updated($wrapper);
              break;
            case 'down':
              var next = item.next('.sortable-item');
              item.insertAfter(next);
              sortme.reset();

              //
              sortme.updated($wrapper);
              break;
          }
        });

        /*jQuery('.sortable-arrows').each(function(){
          var $wrapper = jQuery(this);


          jQuery('[data-dir]').click(function(e){
            return;
            var $this = jQuery(this), dir = $this.data('dir'), item = jQuery(this).closest('.sortable-item');
            var index = item.data('sort');

            switch (dir) {
              case 'up':
                var prev = item.prev('.sortable-item');
                item.insertBefore(prev);
                sortme.reset();

                //
                sortme.updated($wrapper);
                break;
              case 'down':
                var next = item.next('.sortable-item');
                item.insertAfter(next);
                sortme.reset();

                //
                sortme.updated($wrapper);
                break;
            }
            //var sortOrder = jQuery('ul').sortable('toArray', {attribute: 'data-z'});
            //jQuery('.info').text(sortOrder);
          });
        });*/
      }


      // Sortable
      jQuery('.sortable').each(function(){
          var $this = jQuery(this);
          var $handle = $this.data('handle');
          var $delay = $this.data('delay');
          $delay = parseInt($delay);

          let sort = Sortable.create(this, {
              animation: 150,
              forceFallback: true,
              sort: true,
              scroll: true,
              scrollSensitivity: 100,
              delay: $delay,
              delayOnTouchOnly: true,
              group: false,
              handle: $handle,
              swapThreshold: 5,
              filter: ".disabled",
              preventOnFilter: true,
              containment: "parent",
              onUpdate: (e) => {
                var upgrade = $this.find('[data-upgrade-block]');
                $this.find('[data-upgrade-block]').remove();

                var eq = parseInt(upgrade.data('upgrade-block'));
                eq = isNaN(eq) ? 0 : eq - 1;

                $this.find('> .sortable-item').eq(eq).after(upgrade.prop('outerHTML'));

                  let data = [];
                  $this.find('> .sortable-item').each((i, elm) => {
                      let items = {
                          id: jQuery(elm).data('id'),
                          position: i
                      };
                      data.push(items)
                  });
                  $.ajaxSetup({
                      headers: {
                          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                      }
                  });

                  $.ajax({
                      type: "POST",
                      url: $this.data('route'),
                      dataType: 'json',
                      data: {
                          data: data
                      }
                  });
              },
              onMove: function(e) {
                //console.log(e)
                //return e.related.classList.contains('disabled');
              }
          });
        });
    },

    // Sandy Select to open div

    sandySelectDiv: function(){
      var objects = {

        change: function(e){
          var $this = e;
          var value = $this.find(':selected').attr("value");
          var data = $this.attr('data-sandy-select');

          jQuery(data).find('[data-sandy-open]').hide();
          jQuery(data).find('[data-sandy-open='+ value +']').fadeIn();
        }
      };
      jQuery('[data-sandy-select]').each(function(){
        var $this = jQuery(this);
        objects.change($this);

        $this.on('change', function(){
          objects.change(jQuery(this));
        });
      });
    },

  dataCheckboxopen: function(){
    jQuery('[data-checkbox-wrapper]').each(function(){
      var $wrapper = jQuery(this);
      jQuery(this).find('[data-checkbox-open]').each(function(){
        var $this = jQuery(this);
        var open = jQuery(this).data('checkbox-open');

        if ($this.is(':checked')) {
          jQuery($wrapper).find('[data-checkbox-item]').hide();
          jQuery($wrapper).find(open).show();
        }

        $this.change(function(){
          var open = jQuery(this).data('checkbox-open');

          jQuery($wrapper).find('[data-checkbox-item]').hide();
          jQuery($wrapper).find(open).show();
        });
      });
    });
  },

  sandyLoaderSubmit:function(){
    jQuery('.sandy-loader-flower').each(function(){
      var $form = jQuery(this).closest('form');

      var $html = jQuery(this).html();
      var $append = '<div class="sandy-ball-loader">   <div class="ball ball-1"></div>   <div class="ball ball-2"></div>   <div class="ball ball-3"></div>   <div class="ball ball-4"></div>   <div class="ball ball-5"></div>   <div class="ball ball-6"></div>   <div class="ball ball-7"></div>   <div class="ball ball-8"></div></div>';

      var $this = jQuery(this);

      $form.on('submit', function(){
        $this.html($append);
      });
    });
    
    jQuery('.is-loader-submit').each(function(){
      var $form = jQuery(this).closest('form');

      var $html = jQuery(this).html();
      var $append = '<div class="has-loader white"></div>';

      var $this = jQuery(this);

      $form.on('submit', function(){
        $this.html($append);
      });
    });

  },

    // Form Inputs
  formSelect: function(){

    const form_input = document.querySelectorAll('.form-input');
      for (let el of form_input) {
        if (el.classList.contains('always-active')) continue;
        
        const input = el.querySelector('input'),
              textarea = el.querySelector('textarea'),
              activeClass = 'active';

        let inputItem = undefined;

        if (input) inputItem = input;
        if (textarea) inputItem = textarea;

        if (inputItem) {
          inputItem.addEventListener('focus', function () {
            el.classList.add(activeClass);
          });

          inputItem.addEventListener('keypress', function () {
            el.classList.add(activeClass);
          });

          inputItem.addEventListener('blur', function () {
            if (inputItem.value === '') {
              el.classList.remove(activeClass);
            }
          });

          if (inputItem.value === '') {
              el.classList.remove(activeClass);
          }else{
            el.classList.add(activeClass);
          }
        }
      }
    },


    // Piclr
    pickrColors: function(){
      var pickr_options = {
          components: {

              // Main components
              preview: true,
              opacity: false,
              hue: true,
              comparison: false,

              // Input / output Options
              interaction: {
                  hex: true,
                  rgba: true,
                  hsla: false,
                  hsva: false,
                  cmyk: false,
                  input: true,
                  clear: false,
                  save: false
              }
          }
      };
      jQuery('[pickr]').each(function(){
        var $pickr = jQuery(this);
        var $el = $pickr.find('[pickr-div]').attr('id');
        var $color_input = $pickr.find('[pickr-input]');
        if(!$el) return false;
        var $color_pickr = Pickr.create({
            el: "#"+$el,
            theme:'monolith',
            autoReposition: true,
            position: 'top-end',
            default: $color_input.val(),
            ...pickr_options
        });
        $color_pickr.off().on('change', hsva => {
            $color_input.val(hsva.toHEXA().toString());
            $pickr.find('.pcr-button').css('--pcr-color', hsva.toHEXA().toString());
        });
      });
    }
  },
};