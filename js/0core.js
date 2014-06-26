window.S = (function($) {
  var S = {};
  S.wait = setTimeout;
  if(!$)
    console.log('jQuery is missing.');

  return S;
})(jQuery);