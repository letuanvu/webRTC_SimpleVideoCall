const express = require('express');
var https = require('https');
var http = require('http');
var io = require('socket.io');
var fs = require('fs');
const config = require('./config');

const app = express();
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static('public'));
app.get('/', (req, res)=>{
  res.render("login");
});

app.get('/joined',(req, res)=>{
  res.render("home");
})

const serverApp = http.createServer(
  // {
  //   key: fs.readFileSync('key.pem'),
  //   cert: fs.readFileSync('cert.pem')
  // },
   app);

serverApp.listen(config.PORT,()=>{console.log('start server port '+ config.PORT)});

var listUserOnline = [];

var socket = io.listen(serverApp);
socket.sockets.on('connection',function(socketClient){
	console.log('client connect: socket '+socketClient.id);

  socketClient.on('newUserJoind',function(user){
    listUserOnline.push(user);
    socketClient.emit('listUser',listUserOnline);
    //gửi tới tất cả mn có ng mới vào
    socketClient.broadcast.emit('newUserJoind_sv', user);
  });

  socketClient.on('callTo',(userMakeCall)=>{
    socketClient.broadcast.to(userMakeCall.socketId).emit('showNotificall', {name:userMakeCall.name, id:userMakeCall.idcall} );
  });

  socketClient.on('refuseCall',(id)=>{
    socketClient.broadcast.to(id).emit('callRefuse', {} );
  });

  socketClient.on('disconnect', function(){
    const index = listUserOnline.findIndex(user => user.socketId === socketClient.id);
    listUserOnline.splice(index, 1);

    socketClient.broadcast.emit('someOneDisconnect', socketClient.id);
  });
});
