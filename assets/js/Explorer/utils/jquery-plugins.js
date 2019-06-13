import $ from 'jquery';

$.fn.textWidth = function (text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').hide().appendTo(document.body);
    $.fn.textWidth.fakeEl.text(text || this.val() || this.text()).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};

$.fn.flash = function (duration, nTimes, cb) {
    var fadeDur = duration ? (duration / 2) : null;

    _flash($(this), nTimes || 1);

    function _flash($elem, nTimes) {
        $elem.fadeOut(fadeDur).fadeIn(fadeDur,
            nTimes > 1
                ? (function () {
                    _flash($elem, nTimes - 1);
                })
                : (cb || null)
        )
    }
};
