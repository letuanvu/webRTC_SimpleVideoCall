$(document).ready(function(){
  $(document).on('click','#register',function(){
    var username = $('#username').val();
    window.location = "/joined#"+username;
  });

});
