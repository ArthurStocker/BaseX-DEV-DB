/*
 * CSS-TRICKS Persistent Header/Footer
 *
 */
function UpdatePersistView() {
    $('#persist-view-top').each(function() {
        var el = $('.persist-area', this),
            offset = el.offset(),
            height = el.height(),
            scrollTop = $(window).scrollTop(),
            persistSrc = $('.persist-src', this),
            persistCtrl = $('.persist-ctrl', this),
            persistData = $('.persist-data', persistCtrl);

            if ((scrollTop > offset.top)) { /* && (scrollTop < offset.top + el.height()) */
                persistCtrl.css({
                    "visibility": "visible"
                });
            } else {
                persistCtrl.css({
                    "visibility": "hidden"
                });
            };
            
            persistData.css({
                "width": persistSrc.width()
            });
    });

    $('#persist-view-bottom').each(function() {
        var el = $('.persist-area', this),
            offset = el.offset(),
            height = el.height(),
            scrollTop = $(window).scrollTop() + $(window).height(),
            persistSrc = $('.persist-src', this),
            persistCtrl = $('.persist-ctrl', this),
            persistData = $('.persist-data', persistCtrl);

            if ((scrollTop < offset.top + height)) { /* && (scrollTop < offset.top + el.height()) */
                persistCtrl.css({
                    "visibility": "visible"
                });
            } else {
                persistCtrl.css({
                    "visibility": "hidden"
                });
            };

            persistData.css({
                "width": persistSrc.width()
            });
    });
}

// DOM Ready
$(function() {
    var persistData;

    $('#persist-view-top').each(function() {
        persistData = $('.persist-area', this);
        persistData.addClass("persist-src");
        persistData
            .before(persistData.clone())
            .css({
            "top": "0px",
            "width": persistData.width(),
            "z-index": "899999"
        })
            .addClass("persist-ctrl")
            .removeClass("persist-src");
    });

    $('#persist-view-bottom').each(function() {
        persistData = $('.persist-area', this);
        persistData.addClass("persist-src");
        persistData
            .before(persistData.clone())
            .css({
            "bottom": "0px",
            "width": persistData.width(),
            "z-index": "899999"
        })
            .addClass("persist-ctrl")
            .removeClass("persist-src");
    });

    $(window)
        .scroll(UpdatePersistView)
        .trigger("scroll");
});