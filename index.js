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
function things-MqttMapper (id, controller) {
    // Call superconstructor first (AutomationModule)
    things-MqttMapper.super_.call(this, id, controller);
};

inherits(things-MqttMapper, AutomationModule);

_module = things-MqttMapper;

// ----------------------------------------------------------------------------
// --- Module instance initialized
// ----------------------------------------------------------------------------

things-zwavescripttrigger.prototype.init = function (config) {
    // Call superclass' init (this will process config argument and so on)
    things-zwavescripttrigger.super_.prototype.init.call(this, config);

    // Remember "this" for detached callbacks (such as event listener callbacks)
    var self = this;

    this.handler = function (vDev) {
	
	if(self.config.script) {
            debugPrint("\nMQTT DEBUG, ID=", vDev.id + " - title:" + vDev.get("metrics:title") + " level:" + vDev.get("metrics:level") + " scale:" + vDev.get("metrics:scaleTitle") + "\n");
	    try {
		var ret = system(self.config.script + " -t TOPIC -h tcp://localhost:1883 -u USER -p PASS -m " + vDev.get("metrics:level") );
	    } catch(err) {
		debugPrint("Failed to execute script system call: " + err);
	    }
	    var storedLog = loadObject("MQTTValueLogging_" + vDev.id + "_" + self.id);
            if (!storedLog) {
                storedLog = {
                    deviceId: vDev.id,
                    deviceName: vDev.get("metrics:title"),
                    sensorData: []
                };
            }
            storedLog.sensorData.push({"time": Date.now(), "value": vDev.get("metrics:level")});
            saveObject("MQTTValueLogging_" + vDev.id + "_" + self.id, storedLog);
            storedLog = null;
        }
    };

    // Setup metric update event listener
    this.controller.devices.on(this.config.device, "change:metrics:level", this.handler);
};

things-zwavescripttrigger.prototype.stop = function () {
    things-zwavescripttrigger.super_.prototype.stop.call(this);

    this.controller.devices.off(this.config.device, "change:metrics:level", this.handler);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

// This module doesn't have any additional methods
