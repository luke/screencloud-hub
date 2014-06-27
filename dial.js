#!/usr/bin/env node

var nodecast = require('nodecast');
var stream = nodecast.find();

// console.log('+++++++++++++++++++++++++++++++++++++++++++++');

stream.on('device', function(device) {
	// device.name, 
  console.log('Found', device.info.manufacturer, device.info.modelName, device.info.UDN);//,  device.info);
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

  if(device.info.manufacturer == 'Smart TV Alliance'){
    console.log("Trying to start app!"); 

    // var app = device.app('org.smarttv-alliance.ScreenCloudSmartTV');
    // var uuid = device.info.UDN.split('uuid')[1]; 
    // app.start("uuid="+uuid, function(err) {
    //   if (err) console.log('error starting', err);
    //   console.log('Started on', device.name);
    // });

    var app2 = device.app('org.smarttv-alliance.DoesNotExist');
    app2.info(function(err, resp) {
      if (err) console.log('error calling info', err);
      console.log('Info on', resp);
    });

    var app3 = device.app('org.smarttv-alliance.ScreenCloudSmartTV'); 
    app3.info(function(err, resp) {
      if (err) console.log('error calling info', err);
      console.log('Info on', resp);
    });




  }

});