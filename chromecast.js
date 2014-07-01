var nodecastor = require('nodecastor');
var _ = require('lodash'); 
// var logger = = require('./logger'); 
var logger = require('winston');
var util = require('util');

var scanner = nodecastor.scan({   logger: logger, 
								  timeout: 20000,
                                  reconnect: {
                                    maxRetries: Infinity
                                  }
                                });

var homeId = '00000000-0000-0000-0000-000000000000'; 
var appId = '765FFE19'; 
var appNS = 'urn:x-cast:io.screencloud.cast.player';

var dump = function(obj){return util.inspect(obj, false, null); };

var devices = {};
var _devices = {}; 

// dashkioskNs = 'urn:x-cast:com.deezer.cast.dashkiosk';

function startApp(deviceId, appId, appNS, callback){
  var device = _devices[deviceId];
	device.application(appId, function(err, app) {
    if (err) {
      logger.error('Unable to find application', err);
      // notRunning();
      callback({'status':'error', 'message': 'unable to find application'});
      return;
    }
    // app.run(); 
    // todo have namespace, callback etc, pass in account, etc.. 

    app.run(appNS, function(err, session) {
      if (err) {
      	logger.info(dump(err)); 
        logger.error('Unable to open channel '+appNS, err);
        // notRunning();
        callback({'status':'error', 'message': 'unable to open channel'});
        return;
      }
      session.send({uuid: device.id})
      callback({'status': 'running', 'message': 'app started'});
    //   // var token = scs.encode(JSON.stringify({
    //   //   name: display.toJSON().name
    //   // })),
    //   // url = config.get('chromecast:receiver') + '#register=' + token;
    //   // session.send({ url: url });
    //   // notRunning();
    });
  });
}



function checkStatus(device) {
  device.status(function(err, status) {
    if (err) {
      logger.exception('unable to get status from Chromecast device', err);
      return;
    }
    logger.info('Device '+device+' status: '+status); 
    logger.info('adding device with id: '+ device.id)
    devices[device.id]['status'] = status;

    // update(device, status);
    // startApp(device, appId, appNS); 
  });
}

function update(device, status){
	logger.info('Update '+device+' status ', status); 
}

scanner
  .on('online', function(device) {
    var info = _.pick(device, [ 'address', 'port', 'id', 'friendlyName' ]);
    info.deviceType = 'urn:x-cast'
    info.manufacturer = 'Google Inc.'
    info.modelName = 'Chromecast'
    // logger.info('New Chromecast device discovered', info);
    // logger.info(dump(device)); 

    // On connect, check status and update if needed
    device
      .on('connect', function() {
        devices[device.id] = {}
        devices[device.id]['info'] = info;
        _devices[device.id] = device
        device.on('status', function(status) {
        	//logger.info(dump(status)); 
          update(device, status);
        });
        checkStatus(device);
      })
      .on('error', function(err) {
        logger.exception('An error occurred with some Chromecast device', err, device);
      });

    // If there is a change to a group or if a display changes of
    // group, we need to update too
    // device._subscriptions = [
    //   bus.subscribe('group.*.dashboard.*.added', function() {
    //     checkStatus(device);
    //   }),
    //   bus.subscribe('display.*.group', function(data) {
    //     if (data.display.toJSON().chromecast === device.id) {
    //       checkStatus(device);
    //     }
    //   })
    // ];
  })
  .on('offline', function(device) {
    // Stop handling the device
    // _.each(device._subscriptions, function(s) {
    //   s.unsubscribe();
    // });
    device.stop();
  })
  .on('error', function(err) {
    logger.warn('Got some mDNS error. Let\'s ignore it.', err.message);
  })
  .start();

module.exports.devices = devices; 
module.exports.startApp = startApp; 