const playVideo = require('./playVideo');
const $ = require('jquery');

function openStream(callback){
  navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  .then((stream) => {
    callback(stream);
  })
  .catch(err => console.log(err))
}

module.exports = openStream;
