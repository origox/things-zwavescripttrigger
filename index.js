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
    var isConnected = false;
    this.sock.onclose = function (remoteHost, remotePort, localHost, localPort) {
	debugPrint("\n\n\nONCLOSE\n\n");
	self.isConnectd = false;
    };
    
    this.sock.onconnect = function(remoteHost, remotePort, localHost, localPort) {
	//this.close();
	self.isConnected = true;
	debugPrint("\n\nONCONNNNECT\n\n\n")
    };

    this.sock.connect('localhost', 8888)

    


    //this.iotconnect();

    
    this.handler = function (vDev) {

	if(!self.isConnected) {
	    debugPrint("\n\nself.isNotConnected\n\n")
	    this.socket.connect('localhost', 8888)
	}
	
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

    this.sock.close();
};

thingsMqttMapper.prototype.iotconnect = function () {
    this.sock.connect('localhost', 8888);
    
    /*debugPrint("\n\nTESTING - isConnected: " + isConnected + "\n\b");
    
    if(!isConnected) {
	debugPrint("!isConnected");
	var timerId = setTimeout(this.iotconnect(), 15000)
    }
    */
}
// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------

// This module doesn't have any additional methods
