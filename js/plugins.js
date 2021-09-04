// Avoid `console` errors in browsers that lack a console.
(function() {
  var method;
  var noop = function () {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());

// Place any jQuery/helper plugins in here.
$(document).ready(function () {
  $('.dismiss, .overlay').on('click', function () {
      // hide sidebar
      $('#sidebar1, #sidebar2, #sidebar3').removeClass('active');
  });

  $('#sidebarCollapse1').on('click', function () {
      // open sidebar
      $('#sidebar1').addClass('active');
      $('#sidebar2, #sidebar3').removeClass('active');
  });

  $('#sidebarCollapse2').on('click', function () {
    // open sidebar
    $('#sidebar2').addClass('active');
    $('#sidebar1, #sidebar3').removeClass('active');
  });

  $('#sidebarCollapse3').on('click', function () {
    // open sidebar
    $('#sidebar3').addClass('active');
    $('#sidebar1, #sidebar2').removeClass('active');
  });
});

(function() {
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
      window.cancelAnimationFrame =
        window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame)
      window.requestAnimationFrame = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
      };

  if (!window.cancelAnimationFrame)
      window.cancelAnimationFrame = function(id) {
          clearTimeout(id);
      };
}());