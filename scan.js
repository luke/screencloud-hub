#!/usr/bin/env node
var nodecast = require('nodecast');
var stream = nodecast.find();
var md5 = require('MD5');

var _devices = {}
var devices = {}

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
		}

	}
}

stream.on('device', function(device) {
  console.log('scan...');
  var deviceId = md5(device.info.UDN);

  if (hasDeviceInList(deviceId)) {
  	console.log('Found', device.info.manufacturer, device.info.modelName, deviceId);//,  device.info);
  	console.log('Call router to update new deivce id', deviceId);
  	console.log('----------------------------------------------'); 

  	_devices[deviceId] = device;
  }

  devices[deviceId] = device;

});

setInterval(function(){

	for(var deviceId in _devices){
		if (devices[deviceId] == undefined) {
			console.log('Call to router for update device', deviceId, 'disconnected');
			console.log('----------------------------------------------'); 

			delete _devices[deviceId];
		}
	}	

	devices = {} // reset
	stream.start(); 

}, 20000);