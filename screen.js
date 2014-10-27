var Client = require('castv2').Client;
var mdns = require('mdns');
var _ = require('lodash');

var homeId = '00000000-0000-0000-0000-000000000000'; 
var appId = '765FFE19'; 
var appNS = 'urn:x-cast:io.screencloud.cast.player';

var dump = function(obj){ return util.inspect(obj, false, null); };

var devices = {};

function getDeviceInfo(service) 
{
  var info = _.pick(service, ['name', 'host']);
  info.deviceType = 'urn:x-cast'
  info.manufacturer = 'Google Inc.'
  info.modelName = 'Eureka Dongle'
  info.ip = service.addresses[0];
  info.port = service.port;
  info.name = service.name;
  info.service = service;
  return info;
}

function scanDevice() 
{
  var browser = mdns.createBrowser(mdns.tcp('googlecast'));
  browser.on('serviceUp', function(service) {

    // get all device information
    var key = service.txtRecord.id;
    var ip = service.addresses[0];
    devices[key] = {}
    devices[key]['info'] = getDeviceInfo(service);

    console.log('found device %s at %s:%d', service.name, ip, service.port);

    browser.stop();

    // console.log(require('util').inspect(devices, true, 10)); 
  });

  browser.start();
}

// appId: CC1AD845 | YouTube
// appId: 765FFE19 | ScreenCould
function launch(host, appId, no_sleep) {

  console.log("connecting.. ")

  var client = new Client();
  client.connect(host, function() {

    console.log("connected!")

    var connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
    var receiver   = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

    // establish virtual connection to the receiver
    connection.send({ type: 'CONNECT' });

    // start heartbeating
    if (no_sleep) {
      var heartbeat  = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
      setInterval(function() {
        heartbeat.send({ type: 'PING' });
      }, 5000);
    }

    // launch app
    
    // receiver.send({ type: 'SET_VOLUME', volume: { level: 1 }, requestId: 11111 });
    // receiver.send({ type: 'SET_VOLUME', volume: { muted: true }, requestId: 22222 });

    receiver.send({ type: 'LAUNCH', appId: appId, requestId: 111});
    // receiver.send({ type: 'STOP', sessionId: 'CA3CF588-062E-7F18-CCC7-A376365787EF', requestId: 222});

    // receiver.send({ type: 'GET_STATUS', requestId: 555});
    // receiver.send({ type: 'GET_APP_AVAILABILITY', appId: [ appId ], requestId: 666});
    

  
    //display receiver status updates
    receiver.on('message', function(data, broadcast) {

      // console.log(data);
      console.log(require('util').inspect(data, true, 10));

      // if(data.type = 'RECEIVER_STATUS') {
      //   console.log(data.status);
      // }
    });

  });

}

scanDevice();

setTimeout(function(){

launch('192.168.10.11', '8AE1FC77', true);

}, 3000);


module.exports.scan = scanDevice; 
module.exports.launch = launch; 

// var ipTarget = '192.168.10.12'; // for test chromecast one
// var ipTarget = '192.168.10.24'; // for test chromecast two


// for run test 
// $DEBUG=* node  screen.js