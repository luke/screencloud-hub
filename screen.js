var Client = require('castv2').Client;
var mdns = require('mdns');
var _ = require('lodash'); 

var homeId = '00000000-0000-0000-0000-000000000000'; 
var appId = '765FFE19'; 
var appNS = 'urn:x-cast:io.screencloud.cast.player';

var dump = function(obj){return util.inspect(obj, false, null); };

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

    //onDeviceUp(ip);
    browser.stop();

    // console.log(devices);
  });

  browser.start();
}

function startApp(host) {

  var client = new Client();
  client.connect(host, function() {
    // create various namespace handlers
    var connection = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.connection', 'JSON');
    // var heartbeat  = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.tp.heartbeat', 'JSON');
    var receiver   = client.createChannel('sender-0', 'receiver-0', 'urn:x-cast:com.google.cast.receiver', 'JSON');

    // establish virtual connection to the receiver
    connection.send({ type: 'CONNECT' });

    // launch app
    receiver.send({ type: 'LAUNCH', appId: appId, requestId: 1 });

    //display receiver status updates
    receiver.on('message', function(data, broadcast) {

      console.log(data.type);

      if(data.type = 'RECEIVER_STATUS') {
        console.log(data.status);
      }
    });

  });

}

//scanDevice();

var ipTarget = '192.168.10.44'; // for test chromecast one
// var ipTarget = '192.168.10.48'; // for test chromecast two

startApp(ipTarget);

// for run test 
// $DEBUG=* node  screen.js