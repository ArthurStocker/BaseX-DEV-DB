/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license: 
 ***/

//"use strict";

/*** import ***/


/*** local variables ***/
var debug = true;
var config = null;
var licenseloaded = false;

var socket = null;

/*** objects ***/
// Cockpit is a base class 
function Cockpit(host, port) {
    var args = Args([
        { host: Args.STRING | Args.Optional, _default: 'linino.local' },
        { port: Args.INT    | Args.Optional, _default: 49088 }
    ], arguments);
    self = this;

    //setting variables
    self.url = 'http://' + args.host + ':' + args.port;

    socket = io(self.url, {
        transports: ['polling']
    }); // rememberTransport: false,  'websocket', 

    socket.on('uuid', function(data) {
        if (debug) console.log("%cReceived UUID response from Server: %O", "color: green; font-weight: bold; font-style: italic", data);
    });

    socket.on('stdout', function(data) {
        /**
         * Intensity    0	    1	2	    3	    4	    5       6	    7
         * Normal	    Black	Red Green	Yellow	Blue	Magenta	Cyan	White
         */
        data = data.replace('[32m', '<span style="color: green; font-weight: bold;">');
        data = data.replace('[39m', '</span>');

        if (debug) console.log("%cReceived STDOUT response from Server: %O", "color: green; font-weight: bold; font-style: italic", data);
        var message = config.components.message;

        message[0].message = data;
        addComponent({ message });
    });

    socket.on('stderr', function(data) {
        if (debug) console.log("%cReceived STDERR response from Server: %O", "color: green; font-weight: bold; font-style: italic", data);
    });

    socket.on('modified', function(data) {
        if (debug) console.log("%cReceived MODIFIED response from Server: %O", "color: green; font-weight: bold; font-style: italic", data);
        document.getElementById('date').textContent = (new Date(data.stat.mtime));
    });

    socket.on('getConfig', function(data) {
        if (debug) console.log("%cReceived GETCONFIG response from Server: %O", "color: green; font-weight: bold; font-style: italic", data);
        config = data.config;
        if (config) {
            if(config.components) addComponent(config.components);
        }
    });

    socket.on('getContentFromURL', function(data) {
        if (debug) console.log("%cReceived GET CONTENT FROM URL response from Server: %O", "color: green; font-weight: bold; font-style: italic", data);
        $('[name="window-wait"][data-uuid="' + data.target + '"]').hide();
        $('[name="window-data"][data-uuid="' + data.target + '"]').text(data.content);
    });
    
    socket.on('connect', function() {
        if (debug) console.log("%cConnected", "color: blue; font-weight: bold; font-style: italic");
        socket.emit('modified', {path:"/index.html"});
        if (!config) 
            socket.emit('getConfig', {})
    });

    socket.on('disconnect', function() {
        if (debug) console.log("%cDisconnect", "color: blue; font-weight: bold; font-style: italic");
    });
    
/*
element.parentNode    Returns the parent node of an element
element.parentElement    Returns the parent element node of an element

element.childNodes    Returns a collection of an element's child nodes (including text and comment nodes)
element.children    Returns a collection of an element's child element (excluding text and comment nodes)


element.hasChildNodes()    Returns true if an element has any child nodes, otherwise false
    element.childElementCount    Returns the number of child elements an element has


element.firstChild    Returns the first child node of an element
element.firstElementChild    Returns the first child element of an element

element.nextSibling    Returns the next node at the same node tree level
element.nextElementSibling    Returns the next element at the same node tree level

element.previousSibling    Returns the previous node at the same node tree level
element.previousElementSibling    Returns the previous element at the same node tree level

element.lastChild    Returns the last child node of an element
element.lastElementChild	Returns the last child element of an element


element.appendChild()    Adds a new child node, to an element, as the last child node
    element.cloneNode()    Clones an element
    element.insertBefore()    Inserts a new child node before a specified, existing, child node
    element.replaceChild()    Replaces a child node in an element
element.removeChild()    Removes a child node from an element


element.innerHTML    Sets or returns the content of an element
element.textContent    Sets or returns the textual content of a node and its descendants
*/

    socket.on('elementWithIdHasAttribute', function(data) {
        var value = document.getElementById(data.id).hasAttribute(data.name);
        var response = {
            type: 'Boolean',
            id: data.id,
            name: data.name,
            value: value
        };
        socket.emit('elementWithIdHasAttribute', response);
    });

    socket.on('getAttributeOfElementWithId', function(data) {
        var value = document.getElementById(data.id).getAttribute(data.name);
        var response = {
            type: 'Any',
            id: data.id,
            name: data.name,
            value: value
        };
        socket.emit('attributeValueOfElementWithId', response);
    });

    socket.on('setAttributeOfElementWithId', function(data) {
        try {
            document.getElementById(data.id).setAttribute(data.name, data.value);
        } catch (error) {
            console.log(error);
        }
    });

    socket.on('removeAttributeOfElementWithId', function(data) {
        try {
            document.getElementById(data.id).removeAttribute(data.name);
        } catch (error) {
            console.log(error);
        }
    });
    
/*
element.toString()    Converts an element to a string


element.addEventListener()    Attaches an event handler to the specified element
element.removeEventListener()    Removes an event handler that has been attached with the addEventListener() method



document.readyState    Returns the (loading) status of the document
document.strictErrorChecking    Sets or returns whether error-checking is enforced or not

document.hasFocus()    Returns a Boolean value indicating whether the document has focus
document.activeElement    Returns the currently focused element in the document

document.doctype    Returns the Document Type Declaration associated with the document
document.documentElement    Returns the Document Element of the document (the <html> element)
document.head    Returns the <head> element of the document
document.body    Sets or returns the document's body (the <body> element)

document.links    Returns a collection of all <a> and <area> elements in the document that have a href attribute
document.scripts    Returns a collection of <script> elements in the document


document.importNode()    Imports a node from another document
document.createAttribute()    Creates an attribute node
document.createComment()	Creates a Comment node with the specified text
document.createDocumentFragment()	Creates an empty DocumentFragment node
document.createElement()	Creates an Element node
document.createTextNode()	Creates a Text node


document.addEventListener()    Attaches an event handler to the document
document.removeEventListener()    Removes an event handler from the document (that has been attached with the addEventListener() method)


document.write()    Writes HTML expressions or JavaScript code to a document
document.writeln()	Same as write(), but adds a newline character after each statement
*/
}

function UUID() {
    var d = Date.now();

    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }

    var uuid = 'øøøøøøøø-øøøø-4øøø-Øøøø-øøøøøøøøøøøø'.replace(/[øØ]/g,
        function(c) {
            var r = (d + Math.random()*16)%16 | 0;

            d = Math.floor(d/16);
            return (c == 'ø' ? r : (r&0x3|0x8)).toString(16);
        });
    return uuid;
}

function addComponent(components) {
    var args = Args([
        { options: Args.OBJECT | Args.required, _default: {} }
    ], arguments);
    self = this;

    Object.keys(components).forEach(function (type, index, array) {

        components[type].forEach(function (component, cIndex, cArray) {
            var selector = '';
            var parent = $(component.init.parent);

            component.uuid = UUID();
            
            if (debug) console.log("%cadd template to: %o", "color: purple; font-weight: bold; font-style: italic;", parent);
            selector += createComponent(type, component, parent, '', (component.suffix ? component.suffix : ''));

            if (debug) console.log("%cinit component: %o with %O", "color: purple; font-weight: bold; font-style: italic;", selector, component.init);
            // init by init function
            var init = window[component.init.fn];
    
            if (typeof init === "function")
                init(selector + (component.init.item ? ' ' + component.init.item : ''), component);
        }, this);
    }, this);

    function createComponent(type, component, parent, classPrefix, classSuffix) {
        var temp = document.importNode($('[data-template~="' + type + '-template"]').prop('content'), true),
            parts = [
                $(temp).find('#view'),
                $(temp).find('#area'),
                $(temp).find('#data'),
                $(temp).find('#ctrl'),
                $(temp).find('#wait')
            ],
            tempname = null;

        parts.forEach(function (part, pIndex, pArray) {
            var id = $(part).attr('id');

            $(part).removeAttr('id');

            if (pIndex == 0)
             tempname = '[name=' + type + '-' + id + '][data-uuid=' + component.uuid + ']';

            if (pIndex != 2 || component.controls || component.message)
                $(part).attr('name', type + '-' + id);
            
            $(part).attr('class', type + (classPrefix ? '-' + classPrefix : '') + '-' + id + (pIndex == 0 && classSuffix ? ' ' + classSuffix : ''));
            $(part).attr('data-uuid', component.uuid);
            $(part).attr('data-type', type);

            if (pIndex == 2) {
                if (component.groups) {
                    Object.keys(component.groups).forEach(function (unit, fIndex, fArray) {
                        var el = $(part).clone();
                        $(parts[pIndex-1]).append(el);

                        el.attr('name', type + '-' + id + '-' + unit);
                        el.attr('data-unit', unit);
                        el.contents().each(function (nIndex, child) {
                            if (child.nodeType == 8 && child.nodeValue.indexOf('-template') > -1) {
                                // child is a comment
                                component.groups[unit].forEach(function (item, iIndex, iArray) {
                                    createItem(type, component, el, unit, item, iIndex, child.nodeValue.trim());
                                }, this);
                                $(child).remove();
                            }
                        });
                    }, this);

                    $(part).remove();
                }
            }

            if (pIndex == 3) {
                if (component.controls)
                    $(part).contents().each(function (nIndex, child) {
                        if (child.nodeType == 8 && child.nodeValue.indexOf('-template') > -1) {
                            // child is a comment
                            component.controls.uuid = UUID();
                            component.controls.target = component.uuid;
                            createComponent(child.nodeValue.trim().replace('-template', ''), component.controls, $(part), '', (component.controls.suffix ? component.controls.suffix : ''));
                            $(child).remove();
                        }
                    });

                if (component.groups)
                    $(part).find('#icon').attr('class', $(part).find('#icon').attr('class') + component.class.ctrl);
            }
        }, this);

        switch (component.insert) {
            case "asFirst":
                $(parent).prepend(temp);
                break;
            case "aslast":
            default:
                $(parent).append(temp);
        }

        return tempname;
    }

    function createItem(type, component, parent, unit, item, index, template) {
        var temp = document.importNode($('[data-template~="' + template + '"]').prop('content'), true),
            parts = [
                $(temp).find('#item')
            ];

            parts.forEach(function (part, pIndex, pArray) {
                var id = $(part).attr('id');

                $(part).removeAttr('id');
            
                $(part).attr('name', type + '-' + id + '-' + unit + '-' + index);

                $(part).attr('class', component.class.item + (item.state == 'active' && item.mode == 'menu-item' ? ' ' + item.state : ''));
                $(part).attr('data-uuid', component.uuid);
                $(part).attr('data-type', type);
                $(part).attr('data-unit', unit);
                $(part).attr('data-mode', item.mode);
                $(part).attr('data-action', JSON.stringify(item.action));
                $(part).attr('data-active', item.active);
                $(part).attr('data-fallow', item.fallow);

                if (item.state)
                    $(part).attr('data-state', item.state);

                $(part).append($('<div />').html(item.text).text());

                //$(part).find('#icon').attr('name', type + '-' + id + '-' + unit + '-' + index);
                $(part).find('#icon').toggleClass(item[item.state] || item.fallow);

                if (item.mode == 'button' && component.target) {
                    $(part).attr('data-target', component.target);
                }

                if (item.mode == 'menu-pulldown' && item.groups) {
                    $(part).attr('class', $(part).attr('class') + (item.suffix ? ' ' + item.suffix : ''));
                    $(part).attr('data-name', item.type);
                    item.uuid = UUID();
                    item.class = component.class;
                    createComponent(type, item, part, 'pulldown', item.type);
                }
            }, this);

            $(parent).append(temp);
    }
}