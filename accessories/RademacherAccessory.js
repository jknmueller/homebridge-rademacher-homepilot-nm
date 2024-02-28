function RademacherAccessory(log, debug, accessory, data, session) {
    var info = accessory.getService(global.Service.AccessoryInformation);
    
    accessory.context.manufacturer = "Rademacher";
    info.setCharacteristic(global.Characteristic.Manufacturer, accessory.context.manufacturer.toString());
    
    if (data.deviceNumber) 
    {
        accessory.context.model = data.deviceNumber;
        info.setCharacteristic(global.Characteristic.Model, accessory.context.model.toString());    
    }
    
    if (data.uid) 
    {
        accessory.context.serial = data.uid;
    }
    else if (data.sid)
    {
        accessory.context.serial = data.sid;
    }
    info.setCharacteristic(global.Characteristic.SerialNumber, accessory.context.serial.toString());

    accessory.context.revision = 1; //data.version;
    info.setCharacteristic(global.Characteristic.FirmwareRevision, accessory.context.revision.toString());
    
    this.accessory = accessory;
    this.log = log;
    this.debug = debug
    this.session = session;
    this.did = data.did;
    this.lastUpdate = 0;
    this.device = null;
}

RademacherAccessory.prototype.getDevice = function(callback) {
    var self = this;
    if (self.debug) self.log("%s [%s] - getDevice()", self.accessory.displayName, self.blind.did);
    if (this.lastUpdate < Date.now() - 5000) {
        this.session.get("/v4/devices/" + this.did, 30000, function(e, body) {
    		if(e) return callback(new Error("Request failed: "+e), null);
            if (body && (body.hasOwnProperty("device") || body.hasOwnProperty("meter")))
            {
                var device = body.hasOwnProperty("device")?body.device:body.meter;
                self.device = device.data;
                self.lastUpdate = Date.now();
                callback(null, device)    
            }
            else
            {
                self.log('no device, no meter');
                callback(null, self.device);
            }
    	});
    } else {
        self.log('data is still current');
        if (self.debug) self.log("%s [%s] - getDevice() - data is still valid", self.accessory.displayName, self.blind.did);
    	callback(null, this.device);
    }
};

module.exports = RademacherAccessory;
