const openStream = require('./openStream');
const playVideo = require('./playVideo');
const $ = require('jquery');
const config = require('../config');

/* server xirsys

$.ajax({
  url: "https://service.xirsys.com/ice",
  data: {
    ident: "letuanvu",
    secret: "a8e41b74-4c21-11e7-a138-8a1ab8108003",
    domain: "letuanvu.herokuapp.com",
    application: "default",
    room: "default",
    secure: 1
  },
  success: function (data, status) {
    // data.d is where the iceServers object lives
    customConfig = data.d;
    console.log(customConfig);
  },
  async: false
});

var peer = new Peer({
    key: 'peerjs',
    host: 'peerjssv.herokuapp.com',
    port: 443,
    secure: true,
    config: customConfig
});

*/

//từ api key tạo ra peer
var peer = new Peer({key: 'rl74lyzkwrjjdcxr'});
//khi kết nối được api console.log(id)
const socket = io.connect(config.domain+config.PORT);

peer.on('open', (id)=>{
  if(location.hash != ''){
    //nếu connect vào socket gửi tới tất cả mọi người có ng mới
    socket.emit('newUserJoind',{socketId:socket.id, userName:location.hash, peerId: id});
  }
});

socket.on('newUserJoind_sv',(user)=>{
  console.log('có người mới kìa!');
  const { socketId, userName, peerId } = user;
    $('#ulUser').append(`<li><button class="call btn btn-link" id="${socketId}" data-peerid="${peerId}">${userName}</button></li>`);
});

socket.on('listUser', (listUserOnline)=>{
  // khi vừa vào sẽ nhận được listUserOnline
  $('#ulUser').html('');
  listUserOnline.forEach(user => {
      const { socketId, userName, peerId } = user;
      $('#ulUser').append(`<li><button class="call btn btn-link" id="${socketId}" data-peerid="${peerId}">${userName}</button></li>`);
  });
});

socket.on('someOneDisconnect', (id) => {
  $('#'+id).parent().remove();
});
/*****************************************************************/

$(document).on('click','.call',function(){
  var friendId = $(this).data('peerid');
  var userName = $(this).text();
  var socketId = $(this).attr('id');
  if(confirm("Call to "+userName+"? open your camera?")){
    socket.emit('callTo', {idcall: socket.id, socketId: socketId, name: userName});
    openStream((stream)=>{
      //mở video của mình lên
      playVideo(stream, 'localStream');
      //gọi cho id là friendId truyền sang stream của mình
      const call = peer.call(friendId, stream);
      //gọi thành công sẽ trả về friendstream
      call.on('stream', (friendStream) => {
        //hiển thị lên friendsteam
        playVideo(friendStream,'friendStream');
      });
    });
  }

});

// socket.on('showNotificall',(user)=>{
//   var check = confirm("Receive call from "+user.name);
//   if(check){
    //khi nhận cuộc gọi
    peer.on('call', call => {
      //nhận được cuộc gọi show cam mình lên
      openStream((stream) => {
        //nhận cuộc gọi truyền vào stream của mình
          call.answer(stream);
          // hiện stream của mình lên
          playVideo(stream,'localStream');
          // gọi thành công sẽ trả về friendstream của người gọi
          call.on('stream', (friendStream) => {
            //hiển thị lên friendStream
            playVideo(friendStream,'friendStream');
          });
      });
    });
//   }else{
//     socket.emit('refuseCall',user.id);
//   }
// });

socket.on('callRefuse',()=>{
  alert("Call stop!");
});
