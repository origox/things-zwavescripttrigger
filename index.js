/*** Device and Element association to MQTT Z-Way Home Automation module *************************************

 Version: 1.0.1

 -----------------------------------------------------------------------------
 Author: origox
 Description:
 Map device and element events to mqtt messages i.e. publish topic

******************************************************************************/

// ----------------------------------------------------------------------------
// --- Class definition, inheritance and setup
// ----------------------------------------------------------------------------
function thingsMqttMapper (id, controller) {
    // Call superconstructor first (AutomationModule)
    thingsMqttMapper.super_.call(this, id, controller);
    this.devices = [];
};

inherits(thingsMqttMapper, AutomationModule);

_module = thingsMqttMapper;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

thingsMqttMapper.prototype.init = function (config) {
    // Call superclass' init (this will process config argument and so on)
    thingsMqttMapper.super_.prototype.init.call(this, config);

    // Remember "this" for detached callbacks (such as event listener callbacks)
    var self = this;

    // Setup Socket Interface
    this.sock = new sockets.tcp()
    this.sock.connect('localhost', 7777)

    this.handler = function (vDev) {
	
            debugPrint("\nJF DEBUG, ID=", vDev.id + " - title:" + vDev.get("metrics:title") + " level:" + vDev.get("metrics:level") + " scale:" + vDev.get("metrics:scaleTitle") + "\n");
	    try {
		var msg = {
		    id: vDev.id,
		    title: vDev.get("metrics:title"),
		    level: vDev.get("metrics:level"),
		    scale: vDev.get("metrics:scaleTitle")
		};
		
		self.sock.send(JSON.stringify(msg));
		
	    } catch(err) {
		debugPrint("\nJF - Failed to execute socket send: " + err);
	    }
	    var storedLog = loadObject("JFValueLogging_" + vDev.id + "_" + self.id);
            if (!storedLog) {
                storedLog = {
                    deviceId: vDev.id,
                    deviceName: vDev.get("metrics:title"),
                    sensorData: []
                };
            }
            storedLog.sensorData.push({"time": Date.now(), "value": vDev.get("metrics:level")});
            saveObject("JFValueLogging_" + vDev.id + "_" + self.id, storedLog);
            storedLog = null;
    };

    // Setup metric update event listener
    this.config.devices.forEach(function(device) {
	self.controller.devices.on(device, "change:metrics:level", self.handler);
    });
};

thingsMqttMapper.prototype.stop = function () {
    thingsMqttMapper.super_.prototype.stop.call(this);

    this.controller.devices.off(this.config.device, "change:metrics:level", this.handler);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

// This module doesn't have any additional methods
