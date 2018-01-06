/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license: 
 ***/

"use strict";

/*** import ***/
var UUID = require('uuid/v4'),
    Args = require('args-js'),
    Util = require('util'),
    Events = require('events'),
    Winston = require('winston');

/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license:
 ***/

/*** constants ***/
var Conversions = {
        'UString':  { type: 'UInt',  byte: 1 },
        'String':   { type: 'Int',   byte: 1 },
        'UShort':   { type: 'UInt',  byte: 2 },
        'Float':    { type: 'Float', byte: 4 },
        'UChar':    { type: 'UInt',  byte: 1 },
        'Char':     { type: 'Int',   byte: 1 },
        'UInt':     { type: 'UInt',  byte: 4 },
        'Int':      { type: 'Int',   byte: 1 }
    };

/*** objects ***/
// Packet (encoder : TODO)/decoder
function Packet() {
    var args = Args([
        { struct: Args.OBJECT | Args.Required },
        { endianness: Args.STRING | Args.Required }
    ], arguments);
    var self = this;

    self.struct = args.struct;
    self.packet = undefined;
    self.endianness = args.endianness;

    self.offset = 0;
    self.pointer = 0;

    return self;
}

Packet.prototype.settuple = function() {
    var args = Args([
        { tuple: Args.OBJECT | Args.Required }
    ], arguments);
    var self = this;

    self.tuple = args.tuple;
}

Packet.prototype.dump = function() {
    var args = Args([
        { line: Args.INT | Args.Required }
    ], arguments);
    var self = this;
    
    var line = args.line;
    var dump = '';
    
    
    if (logger.levels[logger.level] >= logger.levels['debug']) {
        if (dumper.levels[dumper.level] >= dumper.levels['info']) {
            dump += Array(9 - line.toString(16).length).join('0') + line.toString(16);

            dump += Array(5).join(' ');
            for (var i = 0; i < self.tuple.length; i++) {
                dump += Array(3 - self.tuple[i].toString(16).length).join('0') + self.tuple[i].toString(16);
                if (i % 2 == 1 && i + 1 != self.tuple.length)
                    dump += ' ';
            }
        }
        
        if (dumper.levels[dumper.level] >= dumper.levels['verbose']) {
            dump += Array(5).join(' ');
            for (var i = 0; i < self.tuple.length; i++) {
                dump += Array(9 - self.tuple[i].toString(2).length).join('0') + self.tuple[i].toString(2);
                if (i + 1 != self.tuple.length)
                    dump += ' ';
            }
        }

        dumper.info(dump);

        dumper.debug(Array(5).join(' '), self.packet);

        dumper.info('\n');
    }
}

Packet.prototype.decode = function() {
    var self = this;

    self.packet = {
            name: self.struct.name,
            type: 'Object',
            data: {}
        };

    while (self.offset < self.tuple.length) {
        var result = self['read' + Conversions[self.struct.class[self.pointer].type].type + (8 * Conversions[self.struct.class[self.pointer].type].byte)](self.offset);
        if (self.packet.data[self.struct.class[self.pointer].name]) {
            self.packet.data[self.struct.class[self.pointer].name] += result;
        } else {
            self.packet.data[self.struct.class[self.pointer].name] = result; 
        }
        self.offset += Conversions[self.struct.class[self.pointer].type].byte;
        if (self.struct.class.length - 1 > self.pointer) 
            self.pointer++;
    }

    self.offset = 0;
    self.pointer = 0;
    
    if (self.struct.name == 'data') logger.debug('PACKET DECODE > ', self.packet);
    return self.packet;
}

Packet.prototype.readInt8 = function() {
    var args = Args([
        { offset: Args.INT | Args.Required }
    ], arguments);
    var self = this;

    var result = undefined;

    if (self.struct.class[self.pointer].type == 'String') {
        result = String.fromCharCode(self.tuple.readInt8(args.offset));
    } else {
        result = self.tuple.readInt8(args.offset);
    }

    return result;
}

Packet.prototype.readInt16 = function() {
    var args = Args([
        { offset: Args.INT | Args.Required }
    ], arguments);
    var self = this;

    var result = undefined;

    if (self.endianness == 'LE') {
        result = self.tuple.readInt16LE(args.offset);
    } else {
        result = self.tuple.readInt16BE(args.offset);
    }

    return result; 
}

Packet.prototype.readInt32 = function() {
    var args = Args([
        { offset: Args.INT | Args.Required }
    ], arguments);
    var self = this;

    var result = undefined;

    if (self.endianness == 'LE') {
        result = self.tuple.readInt32LE(args.offset);
    } else {
        result = self.tuple.readInt32BE(args.offset);
    }

    return result;
}

Packet.prototype.readUInt8 = function() {
    var args = Args([
        { offset: Args.INT | Args.Required }
    ], arguments);
    var self = this;

    var result = undefined;

    if (self.struct.class[self.pointer].type == 'UString') {
        result = String.fromCharCode(self.tuple.readUInt8(args.offset));
    } else {
        result = self.tuple.readUInt8(args.offset);
    }

    return result;
}

Packet.prototype.readUInt16 = function() {
    var args = Args([
        { offset: Args.INT | Args.Required }
    ], arguments);
    var self = this;

    var result = undefined;

    if (self.endianness == 'LE') {
        result = self.tuple.readUInt16LE(args.offset);
    } else {
        result = self.tuple.readUInt16BE(args.offset);
    }

    return result;
}

Packet.prototype.readUInt32 = function() {
    var args = Args([
        { offset: Args.INT | Args.Required }
    ], arguments);
    var self = this;

    var result = undefined;

    if (self.endianness == 'LE') {
        result = self.tuple.readUInt32LE(args.offset);
    } else {
        result = self.tuple.readUInt32BE(args.offset);
    }

    return result;
}

Packet.prototype.readFloat32 = function() {
    var args = Args([
        { offset: Args.INT | Args.Required }
    ], arguments);
    var self = this;

    var result = undefined;

    // function toArrayBuffer(buf) {
    //     var ab = new ArrayBuffer(buf.length);
    //     var view = new Uint8Array(ab);
    //     for (var i = 0; i < buf.length; ++i) {
    //         view[i] = buf[i];
    //     }
    //     return ab;
    // }

    // function toBuffer(ab) {
    //     var buf = new Buffer(ab.byteLength);
    //     var view = new Uint8Array(ab);
    //     for (var i = 0; i < buf.length; ++i) {
    //         buf[i] = view[i];
    //     }
    //     return buf;
    // }

    // (((b & 0xFF) << 24) | ((b & 0xFF00) << 8) | ((b >> 8) & 0xFF00) | ((b >> 24) & 0xFF))

    // 01234567890123456789012345678901234567890
    //      |234|234|234|234|234|234|234|234|234  

    var buffer = new ArrayBuffer(4);
    var byte = new Uint8Array(buffer);
    for (var i = 0; i < 4; i++) {
        byte[i] = self.tuple.readUInt8(args.offset - 1 + 4 - i);
    }

    result = (new Float32Array(buffer, 0, 1))[0];

    return result;

}



/***
 * file: .js
 * version: 1.0.0
 * authors: 
 * license:
 ***/

/*** structures ***/
var Gstruct = {
        'event': {
            name: 'event',
            type: 'Object',
            class: [
                { name: 'second',   type: 'UInt'    },
                { name: 'msecond',  type: 'UInt'    },
                { name: 'type',     type: 'UShort'  },
                { name: 'code',     type: 'UShort'  },
                { name: 'page',     type: 'UShort'  },
                { name: 'value',    type: 'UShort'  }
            ]
        }
    };

/*** objects ***/
// Linino ATmega 32u4  // TODO: not implemented yet, its a skeleton based on Joystick Object. .... 
function Rotarydecoder() {
    var args = Args([
        { id: Args.INT | Args.Optional, _default: 1 },
        { deadzone: Args.INT | Args.Optional, _default: 5 },
        { sensitivity: Args.INT | Args.Optional, _default: 5 },
    ], arguments);
    var self = this;
        
    self.endianness = undefined;

    self.id = args.id;
    self.deadzone = args.deadzone;
    self.sensitivity = args.sensitivity;

    self.hasChanged = true;
    self.maxAxisValue = [];                     // max reading from axis[n],
    self.minAxisValue = [];                     // min reading from axis[n], (max-min)/2 is center to which we applay the deadzone as bandwith
    self.lastAxisValue = [];                    // last reading from axis[n], to which we applay sensitivty as bandwith to debounce events 
    self.lastAxisEmittedValue = [];             // emitted debounced value 

    return self;
}

Rotarydecoder.prototype.analize = function() {
    var args = Args([
        { event: Args.OBJECT | Args.Required }
    ], arguments);
    var self = this;

    self.event = args.event;

    var os = require('os');
    self.endianness = os.endianness();

    logger.verbose('Received ' + self.event.length + ' bytes of data.');
    
    return self.endianness;
}

Rotarydecoder.prototype.decode = function() {
    var args = Args([
        { event: Args.OBJECT | Args.Required }
    ], arguments);
    var self = this;
    
    var struct = undefined,
        result = undefined,
        size = 0;

    self.event = args.event;
    
    struct = Gstruct['event'];
    for (var i = 0; i < struct.class.length; i++) {
        if (struct.type == 'Object') {
            size += Conversions[struct.class[i].type].byte;
            if (i == struct.class.length - 1 && (struct.class[i].type == 'UString' || struct.class[i].type == 'String'))
                size = self.event.length;
        }
        if (struct.type == 'Array') {
            size += Conversions[struct.class[i].type].byte;
        }
    }

    var packets = {
            type: '',
            data: {}
        };
    if (struct.type == 'Object') {
        packets.type = 'Object';
        var packet = new Packet(struct, self.endianness);
        packet.settuple(self.event);
        packets.data[packet.decode().data[struct.class[1].name]] = packet;
        packet.dump(0); 
    }
    if (struct.type == 'Array') {
        packets.type = 'Array';
        for (var i = 0; i < ((self.event.length - (self.event.length % size)) / size); i++) {
            var packet = new Packet(struct, self.endianness);
            packet.settuple(self.event.slice(i * size, (i + 1) * size));
            packets.data[packet.decode().data[struct.class[1].name]] = packet;
            packet.dump(i * size);    
        }
    }
    result = packets;

    return result;
}

/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license:
 ***/

/*** objects ***/
// Linino is a base class
function McuBus() {
    var args = Args([
        { frq: Args.INT | Args.Optional, _default: 125 }
    ], arguments);
    Events.EventEmitter.call(this);
    var self = this;

    var mcu,
        board;

    //setting variables
    self.frq = args.frq;
        
    mcu = require('ideino-linino-lib');

    board = new mcu.Board({ resolution: 5, sampling: 1, logger: { level: 'error' } });

    // linino avr interface
    board.connect(function () { // implement generic encoder, in to the Package Object, to encode a rotary event in to USB like events .....
        /*** enummerations ***/
        // Pin names
        var pins = {
                 1: {id: 0, pin:  'D2'},
                 2: {id: 0, pin:  'D3'},
                 3: {id: 1, pin:  'D4'},
                 4: {id: 1, pin:  'D5'},
                 5: {id: 2, pin:  'D6'},
                 6: {id: 2, pin:  'D8'}, /* do not use Pin 7 (it is used as Handshake/HSHK to the AR9331) */
                 7: {id: 3, pin:  'D9'},
                 8: {id: 3, pin: 'D10'},
                 9: {id: 4, pin: 'D11'},
                10: {id: 4, pin: 'D12'}
            };

        /*** constants ***/
        var connectors = 2;
            
        /*** local variables ***/
        var rot = Array.apply(null, new Array(Object.keys(pins).length/connectors)).map(Number.prototype.valueOf, 0),
            flt = Array.apply(null, new Array(Object.keys(pins).length/connectors)).map(Number.prototype.valueOf, 0);

        Object.keys(pins).forEach(function (k) {
            board.pinMode(board.pin.digital[pins[k].pin], board.MODES.INPUT);

            board.digitalRead(board.pin.digital[pins[k].pin], function (value) {
                var dir = k % 2 === 1 ? ['R', 'L'] : ['L', 'R'];

                if (value === 1 && (rot[pins[k].id] === 0 || rot[pins[k].id] === dir[0] || (rot[pins[k].id] === dir[1] && Date.now() >= (flt[pins[k].id]+self.frq)))) {
                    /*** structures ***/
                    var result = {
                            type: '',
                            data: {},
                            decoded: {
                                type: '',
                                code: 0,
                                name: '',
                                value: 0
                            }
                        };

                    rot[pins[k].id] = dir[0];
                    flt[pins[k].id] = Date.now();
                    
                    result.data = pins[k]; // TODO: encode the event in a 16 byte string with time and data, same as USB events .....
                    result.decoded.type = 'Encoder';
                    result.decoded.code = k;
                    result.decoded.name = encoders[result.decoded.code].name;
                    result.decoded.value = value;

                    self.emit('data', {id: 0, event: result});
                }
                if (value === 0 && rot[pins[k].id] === dir[1] && Date.now() >= (flt[pins[k].id]+self.frq)) {
                    rot[pins[k].id] = 0;
                }
            });
        }, this);
    });
}

Util.inherits(McuBus, Events.EventEmitter);
//exports.McuBus = McuBus;



/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license:
 * description: 
 *      id is the file system index of the joystick (e.g. /dev/input/event0 has id '0')
 *      
 *      deadzone is the amount of sensitivity at the center of the axis to ignore.
 *          Axis reads from -32k to +32k and empirical testing on an XBox360 controller
 *          shows that a good 'dead stick' value is 3500.
 *          
 *        » NOTE
 *          the deadzone algorithm auto calibrate max/min values to calculate center, 
 *          '(max-min)/2', which is not correct if you do not move to the axis max and min.
 *          If so, you may want to set deadzone === 0 and instead perform some form of calibration.
 * 
 *      sensitivity is the amount of change in an axis reading before an event will be emitted.
 *          Empirical testing on an XBox360 controller shows that sensitivity is around 350 to
 *          remove noise in the data.
 ***/
 
/*** constants ***/
/*
 * Event types
 */

var EV_SYN                  = 0x00,
    EV_KEY                  = 0x01,
    EV_REL                  = 0x02,
    EV_ABS                  = 0x03,
    EV_MSC                  = 0x04,

/*
 * Synchronization events.
 */

    SYN_REPORT              = 0x00,
    SYN_CONFIG              = 0x01,
    SYN_MT_REPORT           = 0x02,

/*
 * Key and button codes
 */

    BTN_TRIGGER             = 0x120,
    BTN_THUMB               = 0x121,
    BTN_THUMB2              = 0x122,
    BTN_TOP                 = 0x123,
    BTN_TOP2                = 0x124,
    BTN_PINKIE              = 0x125,
    BTN_BASE                = 0x126,
    BTN_BASE2               = 0x127,
    BTN_BASE3               = 0x128,

/*
 * Relative axe codes
 */

    REL_X                   = 0x00,
    REL_Y                   = 0x01,
    REL_Z                   = 0x02,

/*
* Absolute axes
*/

    ABS_X                   = 0x00,
    ABS_Y                   = 0x01,
    ABS_Z                   = 0x02,

/*
 * Misc event codes
 */

    MSC_SERIAL              = 0x00,
    MSC_PULSELED            = 0x01,
    MSC_GESTURE             = 0x02,
    MSC_RAW                 = 0x03,
    MSC_SCAN                = 0x04,
    MSC_MAX                 = 0x07,
    MSC_CNT                 = (MSC_MAX+1);

/*** structures ***/
var Estruct = {
        'event': {
            name: 'event',
            type: 'Array',
            class: [
                { name: 'second',   type: 'UInt'    },
                { name: 'msecond',  type: 'UInt'    },
                { name: 'type',     type: 'UShort'  },
                { name: 'code',     type: 'UShort'  },
                { name: 'page',     type: 'UShort'  },
                { name: 'value',    type: 'UShort'  }
            ]
        }
    };

/*** objects ***/
// Joywarrior 24A 10L 
function Joystick() {
    var args = Args([
        { id: Args.INT | Args.Optional, _default: 1 },
        { deadzone: Args.INT | Args.Optional, _default: 5 },
        { sensitivity: Args.INT | Args.Optional, _default: 5 },
    ], arguments);
    var self = this;
        
    self.endianness = undefined;

    self.id = args.id;
    self.deadzone = args.deadzone;
    self.sensitivity = args.sensitivity;

    self.path = '/dev/input/event' + self.id;
    self.hasChanged = true;
    self.maxAxisValue = [];                     // max reading from axis[n],
    self.minAxisValue = [];                     // min reading from axis[n], (max-min)/2 is center to which we applay the deadzone as bandwith
    self.lastAxisValue = [];                    // last reading from axis[n], to which we applay sensitivty as bandwith to debounce events 
    self.lastAxisEmittedValue = [];             // emitted debounced value 

    return self;
}

Joystick.prototype.analize = function() {
    var args = Args([
        { event: Args.OBJECT | Args.Required }
    ], arguments);
    var self = this;

    self.event = args.event;

    var os = require('os');
    self.endianness = os.endianness();

    logger.verbose('Received ' + self.event.length + ' bytes of data.');
    
    return self.endianness;
}

Joystick.prototype.decode = function() {
    var args = Args([
        { event: Args.OBJECT | Args.Required }
    ], arguments);
    var self = this;
    
    var struct = undefined,
        result = undefined,
        size = 0;

    self.event = args.event;
    
    struct = Estruct['event'];
    for (var i = 0; i < struct.class.length; i++) {
        if (struct.type == 'Object') {
            size += Conversions[struct.class[i].type].byte;
            if (i == struct.class.length - 1 && (struct.class[i].type == 'UString' || struct.class[i].type == 'String'))
                size = self.event.length;
        }
        if (struct.type == 'Array') {
            size += Conversions[struct.class[i].type].byte;
        }
    }

    var packets = {
            type: '',
            data: {}
        };
    if (struct.type == 'Object') {
        packets.type = 'Object';
        var packet = new Packet(struct, self.endianness);
        packet.settuple(self.event);
        packets.data[packet.decode().data[struct.class[1].name]] = packet;
        packet.dump(0); 
    }
    if (struct.type == 'Array') {
        packets.type = 'Array';
        for (var i = 0; i < ((self.event.length - (self.event.length % size)) / size); i++) {
            var packet = new Packet(struct, self.endianness);
            packet.settuple(self.event.slice(i * size, (i + 1) * size));
            packets.data[packet.decode().data[struct.class[1].name]] = packet;
            packet.dump(i * size);    
        }
    }
    result = packets;

    var keys = Object.keys(result.data);
    for (var i = 0; i < keys.length; i++) {
        if (!result.decoded)
            result.decoded = {
                type: '',
                code: 0,
                name: '',
                value: 0
            };
        switch (result.data[keys[i]].packet.data['type']*1) {
            case EV_SYN:
                // if (result.data[keys[i]].packet.data['code']*1 + 
                //     result.data[keys[i]].packet.data['page']*1 + 
                //     result.data[keys[i]].packet.data['value']*1 == SYN_REPORT)
                //         i = keys.length;
                break;
            case EV_KEY:
                if (result.decoded.type == 'Button') {
                    result.decoded.name = buttons[result.decoded.code].name;
                    result.decoded.value = result.data[keys[i]].packet.data['value']*1;
                }
                break;
            case EV_REL:
                break;
            case EV_ABS:
                result.decoded.type = 'Axis';
                result.decoded.code = result.data[keys[i]].packet.data['code']*1;
                result.decoded.name = axes[result.decoded.code].name;
                result.decoded.value = result.data[keys[i]].packet.data['value']*1;
                break;
            case EV_MSC:
                if (!result.decoded.type)
                    result.decoded.type = 'Button';
                if (result.data[keys[i]].packet.data['code']*1 == MSC_SCAN && result.data[keys[i]].packet.data['page']*1 == 0x09)
                    result.decoded.code |= (1 << ((result.data[keys[i]].packet.data['value']*1)-1));
                break;
        }
    }
    
    if (result.decoded.type === 'Axis') {
        if (!self.maxAxisValue[result.decoded.code] || self.maxAxisValue[result.decoded.code] < result.decoded.value)
            self.maxAxisValue[result.decoded.code] = result.decoded.value;

        if (!self.minAxisValue[result.decoded.code] || self.minAxisValue[result.decoded.code] > result.decoded.value)
            self.minAxisValue[result.decoded.code] = result.decoded.value;
        
        if (self.sensitivity) {
            if (!self.lastAxisValue[result.decoded.code] || Math.abs(self.lastAxisValue[result.decoded.code] - result.decoded.value) > self.sensitivity) {
                self.hasChanged = true;
                self.lastAxisValue[result.decoded.code] = result.decoded.value;
            } else {
                // no change due to sensitivity
                self.hasChanged = false;
                result.decoded.value = self.lastAxisValue[result.decoded.code];
            }
        }

        if (self.deadzone && Math.abs(Math.ceil((self.maxAxisValue[result.decoded.code] - self.minAxisValue[result.decoded.code]) / 2) - result.decoded.value) < self.deadzone) {
            result.decoded.value = Math.ceil((self.maxAxisValue[result.decoded.code] - self.minAxisValue[result.decoded.code]) / 2);
        }

        if (self.lastAxisEmittedValue[result.decoded.code] === result.decoded.value) {
            // no change, same value as last time
            self.hasChanged = false;
        } else {
            self.lastAxisEmittedValue[result.decoded.code] = result.decoded.value;
        }
        logger.debug('Decoded Event > new data:', self.hasChanged, ' min:', self.minAxisValue[result.decoded.code], ' max:', self.maxAxisValue[result.decoded.code],  ' last:', self.lastAxisValue[result.decoded.code], ' return:', result.decoded);
    }
    if (result.decoded.type === 'Button') {
        logger.debug('Decoded Event > new data:', self.hasChanged, ' return:', result.decoded);
    }

    return result;
}

/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license:
 ***/

/*** objects ***/
// UsbBus is a base class
function UsbBus() {
    var args = Args([
        { devices: Args.ARRAY | Args.Required, _check:
            function(devices) { 
                var pass = true;
                
                devices.forEach(function (device) {
                    if (!pass || !(typeof device.id === "number" && typeof device.type === "function"))
                        pass = false;
                }, this);

                return pass;
            }
        },
    ], arguments);
    Events.EventEmitter.call(this);
    var self = this;

    var fs,
        stream,
        endpoints;
        //datapoints;

    logger.info("UsbBus initializing....");
    
    //init collection for endpoints and datapoints
    endpoints = {};
    //datapoints = {};
    
    //setting variables
    args.devices.forEach(function (device) {
        endpoints[device.id] = new device.type({id: device.id});
    }, this);

    self.endianness = [];
    
    fs = require('fs');

    // listen to input events
    Object.keys(endpoints).forEach(function (k) {
        fs.open(endpoints[k].path, 'r', function (err, fd) {
            var packet;
            
            if (err) {
                self.emit('error', err);
            } else {
                self.emit('opened');
                try {
                    stream = fs.createReadStream(endpoints[k].path, {
                        fd: fd,
                        flags: 'r',
                        encoding: null,
                        autoClose: true
                    });
                    stream.on('data', function (bytes) {
                        var buffer = new Buffer(bytes.length);
                        buffer = bytes;
                        self.endianness[k] = endpoints[k].analize(buffer);
                        packet = endpoints[k].decode(buffer);
                        self.emit('data', {id: k, event: packet});
                    });
                } 
                catch (err) {
                    self.emit('error', err);
                }
            }
        });
    }, this);

    //setup event listeners
    self.on('write', function (data) { // TODO !! 
        try {
            if (typeof (stream) != 'undefined') {
                //when check connection is ok, emit the request
                var message = new Buffer(data.toString());
            }
        }
        catch (err) {
            logger.error("NETWORK WRITE ERROR - " + err.message);
        }
    });

    self.on('error', function (err) {
        logger.error("USB BUS ERROR - " + err.message);
    });

    logger.info("UsbBus initalized!");
}

Util.inherits(UsbBus, Events.EventEmitter);
//exports.UsbBus = UsbBus;



/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license: 
 ***/
 
/*** structures ***/
var Xstruct = {
        'BECN\0': {
            name: 'beacon',
            type: 'Object',
            class: [
                { name: 'major',    type: 'UChar'   },
                { name: 'minor',    type: 'UChar'   },
                { name: 'appid',    type: 'UInt'    },
                { name: 'version',  type: 'UInt'    },
                { name: 'role',     type: 'UInt'    },
                { name: 'dst_port', type: 'UShort'  },
                { name: 'hostname', type: 'UString' }
            ]
        },
        'DATA@': {
            name: 'data',
            type: 'Collection',
            class: [
                { name: 'index',    type: 'UInt'    },
                { name: 'field0',   type: 'Float'   },
                { name: 'field1',   type: 'Float'   },
                { name: 'field2',   type: 'Float'   },
                { name: 'field3',   type: 'Float'   },
                { name: 'field4',   type: 'Float'   },
                { name: 'field5',   type: 'Float'   },
                { name: 'field6',   type: 'Float'   },
                { name: 'field7',   type: 'Float'   },
            ],
            instances: {
                1:   { name: 'times',   labels: [
                        'real',
                        'total',
                        'mission',
                        'timer',
                        'padding',
                        'zulu',
                        'local',
                        'hobbs'
                ]},
                3:   { name: 'speeds',  labels: [
                        'kias',
                        'keas',
                        'ktas',
                        'ktgs',
                        'padding',
                        'mph',
                        'mphas',
                        'mphgs'
                ]}
            }
        }
    };

/*** objects ***/
// X Plane dataref (encoder : TODO ?)/decoder 
function Tuple() {
    var args = Args([
        { endian_start: Args.INT | Args.Optional, _default: 11 },
        { endian_length: Args.INT | Args.Optional, _default: 4 },
        { endian_capvalue: Args.INT | Args.Optional, _default: 1000000 },
    ], arguments);
    var self = this;
    
    self.endianness = undefined;

    self.endian_start = args.endian_start;
    self.endian_length = args.endian_length;
    self.endian_capvalue = args.endian_capvalue;

    return self;
}

Tuple.prototype.analize = function() {
    var args = Args([
        { tuple: Args.OBJECT | Args.Required }
    ], arguments);
    var self = this;

    self.tuple = args.tuple;
    
    if (!self.endianness) {
        self.endianness = self.tuple['readUInt' + (self.endian_length * 8) + 'BE'](self.endian_start) > self.endian_capvalue ? 'LE' : 'BE';
    }
    
    logger.debug("TUPLE ENDIANNESS > ", self.endianness);

    return self.endianness;
}

Tuple.prototype.decode = function() {
    var args = Args([
        { tuple: Args.OBJECT | Args.Required }
    ], arguments);
    var self = this;
    
    var identified = false,
        result = undefined,
        struct = undefined,
        labels = Object.keys(Xstruct),
        label = '',
        size = 0;

    self.tuple = args.tuple;

    for (var i = 0; i < labels.length; i++) {
        if (!identified) {
            label = self.tuple.toString('ascii', 0, labels[i].length);
            if (label == labels[i])
                identified = true;
        }
    }

    if (identified) {
        struct = Xstruct[label];
        for (var i = 0; i < struct.class.length; i++) {
            if (struct.type == 'Object') {
                size += Conversions[struct.class[i].type].byte;
                if (i == struct.class.length - 1 && (struct.class[i].type == 'UString' || struct.class[i].type == 'String'))
                    size = self.tuple.length;
            }
            if (struct.type == 'Collection') {
                size += Conversions[struct.class[i].type].byte;
            }
        }

        var packets = {
                type: '',
                data: {}
            };
        if (struct.type == 'Object') {
            packets.type = 'Object';
            var packet = new Packet(struct, self.endianness);
            packet.settuple(self.tuple.slice(label.length, size));
            packets.data[struct.name] = packet;
            packet.dump(0);  
        }
        if (struct.type == 'Collection') {
            packets.type = 'Collection';
            for (var i = 0; i < ((self.tuple.length - (self.tuple.length % size)) / size); i++) {
                var packet = new Packet(struct, self.endianness);
                packet.settuple(self.tuple.slice(label.length + (i * size), label.length + ((i + 1) * size)));
                packets.data[packet.decode().data[struct.class[0].name]] = packet;    
                packet.dump(i * size); 
            }
        }
        result = packets;
    }

    return result;
}

/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license:
 ***/

/*** objects ***/
// NetBus is a base class
function NetBus() {
    var args = Args([
        { ttl: Args.INT | Args.Optional, _default: 128 },
        { in_port: Args.INT | Args.Optional, _default: 49001 },
        { beacon_port: Args.INT | Args.Optional, _default: 49707 },
        { host_addr: Args.STRING | Args.Optional, _default: '0.0.0.0' },
        { mcast_addr: Args.STRING | Args.Optional, _default: '239.192.1.1' },
        { beacon_addr: Args.STRING | Args.Optional, _default: '239.255.1.1' }
    ], arguments);
    Events.EventEmitter.call(this);
    var self = this;

    var io,
        beacon,
        socket,
        endpoints,
        datapoints,
        endpointscount;

    logger.info("NetBus initializing....");
    
    //init collection for endpoints and datapoints
    endpoints = {};
    datapoints = {};
    endpointscount = 0;
    
    //setting variables
    self.TTL = args.ttl;
    self.IN_PORT = args.in_port;
    self.BEACON_PORT = args.beacon_port;
    self.HOST_ADDR = args.host_addr;
    self.MULTICAST_ADDR = args.mcast_addr;
    self.MULTICAST_BEACON_ADDR = args.beacon_addr;

    self.endianness = undefined;

    io = require('dgram');

    // listen to beacon messages
    beacon = io.createSocket('udp4', function (buffer, remote) {
        var tuple = new Tuple(),
            packets = undefined;
        
        self.endianness = tuple.analize(buffer);
        packets = tuple.decode(buffer);

        endpoints[remote.address] = packets.data.beacon.decode();
        endpoints[remote.address].data.src_ip = remote.address;
        endpoints[remote.address].data.src_port = remote.port;
        
        if (endpointscount < Object.keys(endpoints).length) {
            endpointscount = Object.keys(endpoints).length; 
            logger.info('New endpoint: ', endpoints[remote.address].data.hostname);
        }
        
        logger.debug(endpoints[remote.address].data.hostname + " > ", endpoints[remote.address]);
    });

    beacon.on('error', function (err) {
        logger.error("NETWORK BEACON ERROR - " + err);
    });

    beacon.bind(self.BEACON_PORT, function () {
        var address = beacon.address();

        logger.verbose("listening for BEACON on " + address.address + ":" + address.port);

        beacon.setBroadcast(true);
        beacon.setMulticastTTL(self.TTL);
        beacon.addMembership(self.MULTICAST_BEACON_ADDR, self.HOST_ADDR);
    });

    // listen to datarefs
    /***
     *  TODO:
     * 
     * --- 8< ---
     ***/
    socket = io.createSocket('udp4', function (buffer, remote) {
        var tuple = new Tuple(),
            packet = undefined;
        
        if (self.endianness) {
            tuple.endianness = self.endianness;
            packet = tuple.decode(buffer);
            
            // datapoints[remote.address] = packet;
            // datapoints[remote.address].data.src_ip = remote.address;
            // datapoints[remote.address].data.src_port = remote.port;
            
            // logger.debug(datapoints[remote.address].data.src_ip + " > ", datapoints[remote.address]);
        }
    });

    socket.on('error', function (err) {
        logger.error("NETWORK SOCKET ERROR - " + err);
    });

    socket.bind(self.IN_PORT, function () {
        var address = socket.address();

        logger.verbose("listening for DATA on " + address.address + ":" + address.port);

        // socket.setBroadcast(true);
        // socket.setMulticastTTL(self.TTL);
        // socket.addMembership(self.MULTICAST_ADDR, self.HOST_ADDR);
    });
    /***
     *  --- >8 ---
     ***/

    // setup event listeners
    self.on('write', function (data) {
        try {
            if (typeof (socket) != 'undefined' && Object.keys(endpoints).length > 0) {
                // when check connection is ok, emit the request
                
                // loop through the endoints, send to endpoint destination address and port
                //      { out_port: INT, default: 49000 }
                
                /***
                 *  TODO: how to select single endpoint?
                 ***/
                var message = new Buffer(data.cmnd.toString());
                for (var i = 0; i < Object.keys(endpoints).length; i++) {
                    socket.send(message, 0, message.length, endpoints[Object.keys(endpoints)[i]].data.dst_port /* 49000 */, endpoints[Object.keys(endpoints)[i]].data.src_ip /* 192.168.1.147 */, function () { 
                        logger.verbose('Sent ' + message.length + ' bytes of data.');
                    });
                    logger.debug(endpoints[Object.keys(endpoints)[i]].data.hostname + " > sent ", message.toString('ascii'));
                }
            } else {
                logger.error("NETWORK WRITE ERROR - no Endpoint registered! Can not send message from " + data.name);
            }
        }
        catch (err) {
            logger.error("NETWORK WRITE ERROR - " + err.message);
        }
    });

    logger.info("NetBus initalized!");
}

Util.inherits(NetBus, Events.EventEmitter);
//exports.NetBus = NetBus;



/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license: 
 ***/

/*** objects ***/
// Server is a base class
function Server() {
    var args = Args([
        { http_port: Args.INT | Args.Optional, _default: 49080 },
        { sock_port: Args.INT | Args.Optional, _default: 49088 },
        { buffer_size: Args.INT | Args.Optional, _default: 1000 },
        { buffer_speed: Args.INT | Args.Optional, _default: 25 },
        { read_retry_speed: Args.INT | Args.Optional, _default: 500 }
    ], arguments);
    Events.EventEmitter.call(this);
    var self = this;

    var fs,
        io,
        url,
        http,
        file,
        root,
        socket,
        stdout,
        stderr,
        endpoints,
        datapoints,
        endpointscount;

    logger.info("Server initializing....");
    
    //init collection for endpoints and datapoints
    stdout = [];
    stderr = [];
    endpoints = {};
    datapoints = {};
    endpointscount = 0;
    
    //setting variables
    self.HTTP_PORT = args.http_port;
    self.SOCK_PORT = args.sock_port;
    self.BUFFER_SIZE = args.buffer_size;			//items -> is the size of the buffer containing the write commands
	self.BUFFER_SPEED = args.buffer_speed;			//millis -> is the speed for sending requests from the buffer to the board
	self.READ_RETRY_SPEED = args.read_retry_speed;	//millis -> is the speed for retry to send the read command


    fs = require('fs');
    io = require('socket.io')();
    url = require('url'),
    http = require('http'),
    file = require('node-static'),
    root = new file.Server('/opt/ideino-workspace/Cockpit/htdocs');

    //SIMPLE HTTP SERVER
    http.createServer(function(request, response) {
        request.addListener('end', function () {
            switch (request.url) {
                case '/':
                    try {
                        root.serveFile('/index.html', 200, {}, request, response);
                    } catch (err) {
                        logger.error('WEBSERVER ERROR SERVING /index.html - ' + err.message);
                    }
                    break;
                default:
                    root.serve(request, response, function (err, result) {
                        if (err) { // There was an error serving the file 
                            logger.error('WEBSERVER ERROR SERVING ' + request.url + ' - ' + err.message);
            
                            // Respond to the client 
                            response.writeHead(err.status, err.headers);
                            response.end();
                        }
                    });
            }
        }).resume();// var uri = url.parse(request.url, true)
    }).listen(self.HTTP_PORT);
    
    io.on('connection', function (client) {
        var remote = client.handshake;
        
        endpoints[remote.address] = client;
        
        if (endpointscount < Object.keys(endpoints).length) {
            endpointscount = Object.keys(endpoints).length; 
            logger.info('New webclient: ', remote.address);
        }
        
        client.on('uuid', function (data) {
            logger.debug("Received UUID request from Client > " + remote.address + ' - ' + JSON.stringify(data));
            data.uuid = UUID();
            client.emit('uuid', data);
        });

        client.on('modified', function (data) {
            logger.debug("Received MODIFIED request from Client > " + remote.address + ' - ' + JSON.stringify(data));
            data.uuid = UUID();
            try {
                data.stat = fs.statSync(root.root + data.path);
            } catch (err) {
                logger.error('WEBSERVER READING FILE-STATs ' + data.path + ' - ' + err.message);
                data.err = err;
            }
            client.emit('modified', data);
        });

        client.on('getConfig', function (data) {
            logger.debug("Received MODIFIED request from Client > " + remote.address + ' - ' + JSON.stringify(data));
            data.uuid = UUID();
            data.path = data.path || root.root + '/../config.json';
            try {
                config = JSON.parse(fs.readFileSync(data.path));
                data.config = config;
            } catch (err) {
                logger.error('WEBSERVER READING CONFIG ' + data.path + ' - ' + err.message);
                data.err = err;
            }
            client.emit('getConfig', data);
        });

        client.on('getContentFromURL', function (data) {
            logger.debug("Received GET CONTENT FROM URL request from Client > " + remote.address + ' - ' + JSON.stringify(data));
            data.uuid = UUID();
            http.get(data.url, function (response) {
                var error,
                    rawData,
                    statusCode,
                    contentType;
                
                
                rawData = '';
                statusCode = response.statusCode;
                contentType = response.headers['content-type'];

                if (statusCode !== 200) {
                    error = new Error('Request Failed.\n' +
                                    'Status Code: ${statusCode}');
                } else if (!/^text\/plain/.test(contentType)) {
                    error = new Error('Invalid content-type.\n' +
                                    'Expected application/json but received ${contentType}');
                }
                if (error) {
                    logger.error('WEBSERVER GETING CONTENT FROM URL ' + data.url + ' - ' + err.message);
                    // consume response data to free up memory
                    response.resume();
                    return;
                }

                response.setEncoding('utf8');

                response.on('data', function (chunk) { rawData += chunk; });
                response.on('end', function () {
                    try {
                        data.content = rawData;
                        client.emit('getContentFromURL', data);
                    } catch (e) {
                        logger.error('WEBSERVER GETING CONTENT FROM URL ' + data.url + ' - ' + err.message);
                    }
                });
            }).on('error', function (err) {
                logger.error('WEBSERVER GETING CONTENT FROM URL ' + data.url + ' - ' + err.message);
            });
        });

        client.on('disconnect', function () {
            logger.info("Disconnect webclient: " + remote.address);
            
            delete endpoints[remote.address];
            endpointscount = Object.keys(endpoints).length
        });
    });

    io.listen(self.SOCK_PORT, {transports: ['polling']});

    // check for available date to send
    setInterval(function(){
        self.emit('send');
    }, self.BUFFER_SPEED);

    //push data to the a buffer
    /*
    self.on('enqueue', function (remote) {
        if (stdout.length < self.BUFFER_SIZE){
            stdout.push(remote);
        }
    });
    */

    self.on('attach', function (transport) {
        stdout = transport.writeOutput;
        stderr = transport.errorOutput;
    });

    //get the data from the buffer and send it to the client
    self.on('send', function () {
        if (config && endpointscount > 0) {
            if (stdout.length > 0 ) {
                io.emit('stdout', stdout.shift());
            }
            if (stderr.length > 0) {
                io.emit('stdout', stderr.shift());
            }
        }
    });

    logger.info("Server initalized!");
}

Util.inherits(Server, Events.EventEmitter);
//exports.Server = Server;



/***
 * file: .js
 * version: 0.0.0
 * authors: 
 * license: 
 ***/

/*** enummerations ***/
// Axes names
var axes = {
          0: {name: 'Axis X', cmnd: ''},
          1: {name: 'Axis Y', cmnd: ''},
          2: {name: 'Axis Z', cmnd: ''}
    },

// Button names
    buttons = {
          1: {name: 'Button 001', cmnd: null, mode: 'multi', next: function (value) {
                        var self = this;
                        if (value === 1) {
                            if (self.value === 1) {
                                logger.info(this.name, ' set to HSI SOURCE SELECT mode.');
                                encoders[1].cmnd = 'CMND\0sim/autopilot/hsi_select_up';
                                encoders[2].cmnd = 'CMND\0sim/autopilot/hsi_select_down';
                                self.value = 2;
                            } else 
                            if (self.value === 2) {
                                logger.info(this.name, ' set to HSI OBS ADJUST mode.');
                                encoders[1].cmnd = 'CMND\0sim/radios/obs_HSI_up';
                                encoders[2].cmnd = 'CMND\0sim/radios/obs_HSI_down';
                                self.value = 1;
                            }
                        } else {
                        }
                    },
                    value: 1
                },
          2: {name: 'Button 002', cmnd: 'CMND\0sim/autopilot/vertical_speed_sync'},
          3: {name: 'Button 003', cmnd: 'CMND\0sim/autopilot/altitude_sync'},
          4: {name: 'Button 004', cmnd: 'CMND\0sim/autopilot/heading_sync'},
          5: {name: 'Button 005', cmnd: 'CMND\0sim/autopilot/airspeed_sync'},
          6: {name: 'Button 006', cmnd: 'CMND\0sim/autopilot/vertical_speed'},
          7: {name: 'Button 007', cmnd: 'CMND\0sim/autopilot/altitude_hold'},
          8: {name: 'Button 008', cmnd: 'CMND\0sim/autopilot/heading'},
          9: {name: 'Button 009', cmnd: 'CMND\0sim/autopilot/autothrottle_toggle'},
         10: {name: 'Button 010', cmnd: 'CMND\0sim/autopilot/servos_toggle'},
         11: {name: 'Button 011', cmnd: ''},
         12: {name: 'Button 012', cmnd: ''},
         13: {name: 'Button 013', cmnd: ''},
         14: {name: 'Button 014', cmnd: ''},
         15: {name: 'Button 015', cmnd: ''},
         16: {name: 'Button 016', cmnd: ''}
    },

// Encoder names
    encoders = {
         1: {name: 'Encoder 1 right', cmnd: 'CMND\0sim/radios/obs_HSI_up'},
         2: {name: 'Encoder 1 left',  cmnd: 'CMND\0sim/radios/obs_HSI_down'},
         3: {name: 'Encoder 2 right', cmnd: 'CMND\0sim/autopilot/vertical_speed_up'},
         4: {name: 'Encoder 2 left',  cmnd: 'CMND\0sim/autopilot/vertical_speed_down'},
         5: {name: 'Encoder 3 right', cmnd: 'CMND\0sim/autopilot/altitude_up'},
         6: {name: 'Encoder 3 left',  cmnd: 'CMND\0sim/autopilot/altitude_down'},
         7: {name: 'Encoder 4 right', cmnd: 'CMND\0sim/autopilot/heading_up'},
         8: {name: 'Encoder 4 left',  cmnd: 'CMND\0sim/autopilot/heading_down'},
         9: {name: 'Encoder 5 right', cmnd: 'CMND\0sim/autopilot/airspeed_up'},
        10: {name: 'Encoder 5 left',  cmnd: 'CMND\0sim/autopilot/airspeed_down'}
    };

/*** local variables ***/
var config,
    logger = new (Winston.Logger)({
                level: 'info',
                transports: [
                    new (Winston.transports.Console)({
                        colorize: true,
                        timestamp: true
                    }),
                    new (Winston.transports.Memory)({
                        colorize: true,
                        timestamp: true
                    })
                ]
             }),
    dumper = new (Winston.Logger)({
                level: 'error',
                transports: [
                    new (Winston.transports.Console)({
                        eol: '\0',
                        showLevel: false,
                        timestamp: false
                    }),
                    new (Winston.transports.Memory)({
                        showLevel: false,
                        timestamp: false
                    })
                ]
             }),
    mcubus = new McuBus(),
    usbbus = new UsbBus(
        [
            {
                id: 1,
                type: Joystick
            }
        ]
    ),
    netbus = new NetBus(),
    server = new Server();

server.emit('attach', logger.transports.memory);

/*** objects ***/
// DeviceHandler functions
function DeviceHandler(device) {
    var func = null,
        emit = false;
        
    switch (device.event.decoded.type) {
        case 'Axis':
            break;
        case 'Button':
            func = buttons[device.event.decoded.code];
            switch (func.mode) {
                case 'multi':
                    func.next(device.event.decoded.value);
                    emit = true;
                    break;
                case 'on/off':
                    if (device.event.decoded.value) {
                    } else {
                    }
                    break;
                default:
                    if (device.event.decoded.value) {
                        emit = true;
                    }
            }
            break;
        case 'Encoder':
            func = encoders[device.event.decoded.code];
            switch (func.mode) {
                case 'multi':
                    break;
                case 'on/off':
                    if (device.event.decoded.value) {
                    } else {
                    }
                    break;
                default:
                    if (device.event.decoded.value) {
                        emit = true;
                    }
            }
            break;
    }
    if (emit && func.cmnd)
        netbus.emit('write', func);
}


mcubus.on('data', DeviceHandler);  
usbbus.on('data', DeviceHandler);
//server.on('data', DeviceHandler);

/**
 * 
 * 
 * 

data
    cockpit
    x plane
    Gauges
    Tables
    Graphs

config
    logger/dumper
    cockpit funktionen (axis, buttons, encoder)
    conversions (buffer to "js" type by custom-name ex: UString -> 1 byte UInt)
    packet (encoder/decoder to split a stream [e.g. Tuple or Events] in to single messages) 
    busses (McuBus, UsbBus, NetBus)
    devices (RotaryDecoder, Joystick, Tuple [X Plane nework messages])
    server (http with socket.io)
    backend app
    frontend app (WebClient [menu], WebConsole)

 */