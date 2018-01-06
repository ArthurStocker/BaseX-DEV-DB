/*
 * Menu Actions
 *
 */
var Actions = {"window-controls": {}, "menu":{}};
//
Actions['window-controls']['menuaction'] = Actions['menu']['menuaction'] = function(e) {
    var el = $(e.target);

    if (el.attr('id') == 'icon') 
        el = $(el).parent();

    $('[class~="menu-item"][data-uuid=' + el.attr('data-uuid') + '][data-unit=' + el.attr('data-unit') +'][data-mode|="menu"]').each(function() {
        $(this).removeClass('active');
        if ($(this).attr('data-mode') == 'menu-item') {
            $(this).find('#icon').removeClass($(this).attr('data-active'));
            $(this).find('#icon').addClass($(this).attr('data-fallow'));
        }
    });
    
    if (el.attr('data-mode') == 'menu-item' || el.attr('data-mode') == 'menu-pulldown') {
        $('[name=' + el.attr('name') + ']').toggleClass('active');
    }
    
    if (el.attr('data-mode') == 'menu-item' || el.attr('data-mode') == 'button') {
        $('[name=' + el.attr('name') + ']').find('#icon').toggleClass(el.attr('data-fallow'));
        $('[name=' + el.attr('name') + ']').find('#icon').toggleClass(el.attr('data-active'));
    }

    $('[class~="menu-item"][data-uuid=' + el.attr('data-uuid') + '][data-unit=' + el.attr('data-unit') +'][data-mode="menu-pulldown"]').each(function() {
        if ($(this).attr('class').indexOf('active') == -1 && $(this).attr('data-state') == 'active')
            Actions['menu']['togglepulldown']({target:this});
    });
    
    if (debug) console.log("%cmenuaction action receved: %o", "color: red; font-weight: bold; font-style: italic", el);

    return false;
}
// Collapsed Pulldown
Actions['menu']['togglepulldown'] = function (e) {
    var el = $(e.target);

    if (el.attr('id') == 'icon') 
        el = $(el).parent();
    
    if (el.attr('data-state') == 'active') {
        $('[data-name=' + el.attr('data-name') + '] .menu-pulldown-view').hide('fast', function() {
            UpdatePersistView()
        });
        $('[data-name=' + el.attr('data-name') + '] > #icon').toggleClass(el.attr('data-fallow'));
        $('[data-name=' + el.attr('data-name') + '] > #icon').toggleClass(el.attr('data-active'));
        $('[data-name=' + el.attr('data-name') + ']').find('li').removeClass('active');
        $('[data-name=' + el.attr('data-name') + ']').attr('data-state', 'fallow');
    } else {
        $('[data-name=' + el.attr('data-name') + '] .menu-pulldown-view').show('fast', function() {
            UpdatePersistView()
        });
        $('[data-name=' + el.attr('data-name') + '] > #icon').toggleClass(el.attr('data-active'));
        $('[data-name=' + el.attr('data-name') + '] > #icon').toggleClass(el.attr('data-fallow'));
        $('[data-name=' + el.attr('data-name') + ']').attr('data-state', 'active');
    }
    
    if (debug) console.log("%ctoggle pulldown: %o", "color: red; font-weight: bold; font-style: italic;", el); //TODO: remove if templating is implemented
}
// 
Actions['menu']['connection'] = function(e) {
    var el = $(e.target);

    if (el.attr('id') == 'icon') 
        el = $(el).parent();
    
    if (el.attr('data-state') == 'active') {
        socket.close();
        el.attr('data-state', 'fallow')
    } else {
        socket.open();
        el.attr('data-state', 'active')
    }
    
    if (debug) console.log("%cconnection action receved: %o", "color: red; font-weight: bold; font-style: italic", el);
}


// 
Actions['menu']['openwindow'] = function(e) {  
    var el = $(e.target);

    if (el.attr('id') == 'icon') 
        el = $(el).parent();
    
    $('[name~="window-view"][data-uuid="' + el.attr('data-target') + '"]').toggleClass('window-view-closed');
    
    if (debug) console.log("%copenwindow action receved: %o %o", "color: red; font-weight: bold; font-style: italic", el, '[name~="window-view"][data-uuid="' + el.attr('data-target') + '"]');
}
// 
Actions['menu']['showgnulicense'] = function(e) {
    var el = $(e.target);

    if (el.attr('id') == 'icon') 
        el = $(el).parent();
        
    if (!licenseloaded) socket.emit('getContentFromURL', {url:el.attr('data-source'), target:el.attr('data-target')})
    licenseloaded = true;
    
    if (debug) console.log("%cshowgnulicense action receved: %o %o", "color: red; font-weight: bold; font-style: italic", el, '[name~="window-view"][data-uuid="' + el.attr('data-target') + '"]');
}

// 
Actions['window-controls']['closewindow'] = function(e) {
    var el = $(e.target);

    if (el.attr('id') == 'icon') 
        el = $(el).parent();
    
    $('[name~="window-view"][data-uuid="' + el.attr('data-target') + '"]').toggleClass('window-view-closed'); 
    
    if (debug) console.log("%cclosewindow action receved: %o %o", "color: red; font-weight: bold; font-style: italic", el, '[name~="window-view"][data-uuid="' + el.attr('data-target') + '"]');
}


/*
 * Init Window
 *
 */
function initMessage(selector, target) {
    $(selector + ' [name=message-data]').append($('<div />').html(target.message));

    setTimeout(function () { 
        $(selector).fadeOut(target.init.fadeOut, function () {
            $(this).remove();
        });
    }, target.init.delay);

    if (debug) console.log("%cmessage initialized: %o %o", "color: red; font-weight: bold; font-style: italic", selector, target);
};

/*
 * Init Window
 *
 */
function initWindow(selector, target) {
    // init by init function
    var init = window[target.controls.init.fn];

    if (typeof init === "function")
        init(selector + ' ' + target.controls.init.item, '');
    
    $(selector).toggleClass('window-view-closed'); 
    $('[data-unit="' + target.suffix + '-button"]').attr('data-target', $(selector).attr('data-uuid'));
    
    if (debug) console.log("%cwindow initialized: %o %o %o %O", "color: orange; font-weight: bold; font-style: italic", $(selector), selector, '[data-unit="' + target.suffix + '-button"]', target);
}

/*
 * Bind Action
 *
 */
function bindAction(selector, target) {
    $(selector).each(function () {
        if (typeof $(this).attr('data-action') !== 'undefined') {
            var item = $(this);
            var events = {};

            Object.keys(JSON.parse(item.attr('data-action'))).forEach(function(eh, index, array) {
                Object.keys(JSON.parse(item.attr('data-action'))[eh]).forEach(function(el, index, array) {
                    events[el] = Actions[item.attr('data-type')][JSON.parse(item.attr('data-action'))[eh][el]];
                    item.bind(events);
                });
            });

            if (debug) console.log("%caction bound: %o", "color: orange; font-weight: bold; font-style: italic", item);
        }
    });
}

// DOM Ready
$(function() {
    bindAction('.menu-item', '');
});