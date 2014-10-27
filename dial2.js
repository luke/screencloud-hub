#!/usr/bin/env node
var nodecast = require('nodecast');
var stream = nodecast.find();
var md5 = require('MD5');
var Firebase = require('firebase')

var _devices = {}
var devices = {}

var devicesRoot = new Firebase('https://screencloud.firebaseio.com/devices');

function hasDeviceInList(deviceId){
	if (_devices[deviceId] != undefined) //&& typeof(data[p]) == 'object'
		return false;
	else  return true;
}

function checkDeviceDisconnected()
{
	for(var deviceId in _devices){
		if (devices[deviceId] == undefined) {
			console.log('Call to router for update device', deviceId, 'disconnected');
			console.log('----------------------------------------------'); 

			delete _devices[deviceId];
			devicesRoot.child(deviceId).remove();
		}
	}
	devices = {} // reset
}

stream.on('device', function(device) {
  console.log('scan...');
  var deviceId = md5(device.info.UDN);

  if (hasDeviceInList(deviceId)) {
  	console.log('Found', device.info.manufacturer, device.info.modelName, deviceId);//,  device.info);
  	console.log('Call router to update new deivce id', deviceId);
  	console.log('----------------------------------------------'); 
  	_devices[deviceId] = device;

  	devicesRoot.child(deviceId).update(_devices[deviceId]); 
  }

  devices[deviceId] = device;

});

setInterval(function(){

	checkDeviceDisconnected();
	stream.start(); 

}, 20000);

var startApp = function(deviceId, appId, params, callback){
  var device = _devices[deviceId];
  var app = device.app(appId);
  app.start(params, function(err) {
    if (err) {
      console.log('error starting', err);
      callback({"status": "error", "message": "unable to start app"});
      return; 
    }
    console.log('Started on', device.name);
    callback({"status": "running", "message": "launched application"});
  });
}

module.exports.devices = devices; 
module.exports.startApp = startApp; 