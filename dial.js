#!/usr/bin/env node

var nodecast = require('nodecast');
var stream = nodecast.find();
var md5 = require('MD5');

// console.log('+++++++++++++++++++++++++++++++++++++++++++++');

var _devices = {}
var devices = {}

stream.on('device', function(device) {
	// device.name, 

  var deviceId = md5(device.info.UDN);

  _devices[deviceId] = device; 
  devices[deviceId] = {}
  devices[deviceId]['info'] = device.info; 
  devices[deviceId]['info']['id'] = deviceId; 
  devices[deviceId]['status'] = {}

  //console.log('Found', device.info.manufacturer, device.info.modelName, device.info.UDN);//,  device.info);
  //console.log(device.info); 
  // console.log('device: %j', device); 
  // console.log('----------------------------------------------'); 
  if (typeof device.apps === 'function') {
    device.apps(function(err, apps){
      console.log('Applications for', device.name, apps);
    });
  }
  if (typeof device.details === 'function') {
    device.details(function(err, details){
      console.log('Details for', device.name, details);
    });
  }
  if (typeof device.running === 'function') {
    device.running(function(err, app){
      console.log('Currently running app for', device.name, app);
    });
  }

  // if(device.info.manufacturer == 'Smart TV Alliance'){
  //   console.log("Trying to start app!"); 

  //   // var app = device.app('org.smarttv-alliance.ScreenCloudSmartTV');
  //   // var uuid = device.info.UDN.split('uuid')[1]; 
  //   // app.start("uuid="+uuid, function(err) {
  //   //   if (err) console.log('error starting', err);
  //   //   console.log('Started on', device.name);
  //   // });

  //   var app2 = device.app('org.smarttv-alliance.DoesNotExist');
  //   app2.info(function(err, resp) {
  //     if (err) console.log('error calling info', err);
  //     console.log('Info on', resp);
  //   });

  //   var app3 = device.app('org.smarttv-alliance.ScreenCloudSmartTV'); 
  //   app3.info(function(err, resp) {
  //     if (err) console.log('error calling info', err);
  //     console.log('Info on', resp);
  //   });




  // }

});

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


