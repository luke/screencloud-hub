
_ = require('lodash')
chromecast = require('./chromecast')
dial = require('./dial')

listDevices = ->
  castDevices = _.values(chromecast.devices)
  dialDevices = _.values(dial.devices) 
  # reject any chromecast DIAL devices as we have them in cast devices
  dialDevices = _.reject(dialDevices, (x)->
      x.info['modelName'] == 'Eureka Dongle'
    )
  devices = castDevices.concat(dialDevices)

startApp = (deviceId, appId, launchArgs, callback)->
  if(chromecast.devices[deviceId])
    appNamespace = launchArgs 
    console.log("start app on cast device", deviceId, appId, appNamespace)
    chromecast.startApp(deviceId, appId, appNamespace, callback)
  else
    params = launchArgs
    console.log("start app on dial device", deviceId, appId, params)
    dial.startApp(deviceId, appId, params, callback)

# WEB SOCKET INTERFACE

# tried and failed to get this working with sockjs server
# WebSocket = require('faye-websocket')
# ws = new WebSocket.Client('ws://sock.screencloud.io/sock/')

# ws.on 'open', (event)->
#   console.log('open')
#   ws.send('Hello, world!')

# ws.on 'message', (event)->
#   console.log('message', event.data)

# ws.on 'close', (event)->
#   console.log('close', event.code, event.reason)
#   ws = null

# working! 
sjsc = require('sockjs-client')
client = sjsc.create("http://sock.screencloud.io/sock")
client.on 'connection', ()->
  console.log('open!')
client.on 'data',  (data)-> 
  console.log('data', data)
  # TODO: parse data as json message
  # TODO: call startApp or stopApp 
client.on 'error',  (error)-> 
  console.log('error', error)

# TODO: when we get an event saying that there are changes to devices 
# we should send updated device list to cloud 

updateListDevicesOnCloud = ()->
  devices = listDevices()
  # TODO: encode as json first! 
  client.write( devices ) 

# chomecase.on 'update', updateListDevicesOnCloud



# REST INTERFACE 

restify = require('restify')

server = restify.createServer({
  name: 'screencloud-hub',
  version: '0.0.0'
});

server.use(restify.acceptParser(server.acceptable))
server.use(restify.queryParser())
server.use(restify.jsonp())
server.use(restify.CORS())
server.use(restify.bodyParser())

server.get('/devices', (req, res, next) ->
  res.send(200, {devices:  listDevices() })
  next()
)

server.post('/devices/:id/launch', (req, res, next) ->
  deviceId = req.params.id
  appId = req.params.app_id # || '765FFE19'
  launchArgs = req.params['launch_args']
  startApp( deviceId, appId, launchArgs, (result) ->
    res.send(200, result)
    next()
  )
)

server.listen( 8080, () -> 
  console.log('%s listening at %s', server.name, server.url);
)



# curl -v -X POST -d 'app_id=765FFE19&launch_args=urn:x-cast:io.screencloud.cast.player' http://localhost:8080/devices/45651e010bcc3e9eefb7301d45e8c3e4/launch
# curl -v -X POST --data-urlencode 'app_id=5E7A2C2C&launch_args=urn:x-cast:com.deezer.cast.dashkiosk' http://localhost:8080/devices/45651e010bcc3e9eefb7301d45e8c3e4/launch
# curl -v -X POST -d 'app_id=5E7A2C2C&launch_args=urn:x-cast:com.deezer.cast.dashkiosk' http://localhost:8080/devices/2943b3d672e120d52ad6ba880eb195eb/launch
# curl -v -X POST -d 'app_id=org.smarttv-alliance.ScreenCloudSmartTV&launch_args=x%3D1' http://localhost:8080/devices/b453fefc9f2f7d810bbd350dbfae8aa4/launch
