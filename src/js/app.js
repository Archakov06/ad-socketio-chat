var app = angular.module('app',[]);

app.factory('$socket', function(){
  var socket = io.connect(location.origin);
  return socket;
});

app.filter('check_message', ['$sce', function($sce){
    return function(text) {
        text = text.replace(/\</g,'&lt;');
        text = text.replace(/\s\:(.*?)\:\s/g,'<img class="emoticon" src="public/img/$1.png">')
        return $sce.trustAsHtml(text);
    };
}]);

app.controller('appController', ['$scope','$socket','$compile','$sce','$timeout', function($scope, $socket, $compile, $sce, $timeout) {

  $scope.title = 'Demo chat in Node.js + Angular.js + Socket.io';
  $scope.uid = localStorage['chat_uid'] ? localStorage['chat_uid'] : 0;
  $scope.name = '';
  $scope.editing = false;
  $scope.online = 0;
  $scope.search_input = false;
  $scope.title_input = false;

  $scope.users = [];
  $scope.messages = [];
  $scope.deleting_message = [];

  $scope.timestamp = function(time) {
    return moment.unix(time).fromNow();
  }

  $scope.pushMessage = function(text,name,uid) {
    $scope.messages.push({
      text: text,
      name: name,
      uid: uid,
      time: Math.floor(Date.now() / 1000)
    });
    //$scope.$apply();
  }

  $scope.messageStatus = function(name,time) {
    return name + ',' + $scope.timestamp(time);
  }

  $scope.addMessage = function(){
    var text = $('.row--input input').val();
    var name = $scope.name;
    var uid  = $scope.uid;
    if (!text) return false;
    $socket.emit('on:message',{
      text: text,
      name: name,
      uid: uid
    });
    $scope.pushMessage(text,name,uid);
    $('.row--input input').val('');
  }

  $scope.editDel = function() {
    if ($scope.deleting_message.length==0){
      if (!$scope.editing) {
        $('.message').addClass('editing');
        $scope.editing = true;
      } else {
        $('.message').removeClass('editing');
        $scope.editing = false;
      }
    } else {
      $scope.deleteMessages();
    }
  }

  $scope.messageAction = function(i) {
    $scope.checkMessage(i);
  }

  $scope.checkMessage = function(i) {
    if (!$('.check[data-check-id="'+i+'"]').is('.checked')) {
        $('.check[data-check-id="'+i+'"]').addClass('checked');
        $scope.deleting_message.push(i);
      }
      else
      {
        $('.check[data-check-id="'+i+'"]').removeClass('checked');
        $scope.deleting_message.splice($scope.deleting_message.indexOf(i),1);
      }
  }

  $scope.searchMessage = function() {
    if ($scope.search_input)
      $scope.search_input = false;
    else
      $scope.search_input = true;
  }

  $scope.deleteMessages = function() {
    var newArr = [];
    for (var a = 0; a < $scope.deleting_message.length; a++){
      var index = $scope.deleting_message[a];
      delete $scope.messages[index];
    }
    $scope.editing = false;
    $('.row--messages .message').removeClass('editing');
  }

  $scope.quoteUser = function(name) {
    if (!$('.row--input input').val())
    $('.row--input input').val('@'+name+': ');
      else
    $('.row--input input').val($('.row--input input').val() + ' @' + name);
  }

  $scope.emotAdd = function(name){
    $('.row--input input').val($('.row--input input').val() + ' :'+name+': ');
  }

  $scope.newUsers = function(users){
    $scope.users = users;

    $scope.online = 0;

    $scope.users.forEach(function(item){
      if (item.is_online) $scope.online++;
    });

    $scope.$apply();
  }

  /*
    Watching
  */

  $scope.$watch('messages',function(newValue, oldValue){
    if ($('.row--messages').getNiceScroll(0))
    $timeout(function() {
      $('.row--messages .message').addClass('show');
      $('.row--messages').getNiceScroll(0).doScrollTop($('.row--messages')[0].scrollHeight*2);
    },300);
  }, true);

  $scope.$watch('editing', function(newValue,oldValue) {
    if ($scope.editing && $scope.deleting_message.length==0)
      $('.row--header div > a').text('Done');
      else
      $('.row--header div > a').text('Edit');
  });

  $scope.$watch('deleting_message', function(newValue,oldValue) {
    if ($scope.deleting_message.length>0) {
      $('.row--header div > a').text('Delete');
    } else {
      $('.row--header div > a').text('Edit');
    }
  },true);

  /*
    Socket
  */

  $socket.on('connect', function () {
    $socket.emit('client:start',{id:$scope.uid});
  });

  $socket.on('new:message', function (data) {
    console.log(data);
    $scope.$apply(function(){
      $scope.pushMessage(data.text,data.name,data.id);
    });
  });

  $socket.on('client:me', function (id) {
    $scope.name = 'Guest' + id;
    $scope.uid = id;
    localStorage['chat_uid'] = id;
  });

  $socket.on('client:connected', function (users) {
    $scope.newUsers(users);
  });

  $timeout(function () {
    $socket.emit('client:all');
  }, 100);

  $socket.on('client:disconnected', function (id) {
    for (var i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i].id==id) $scope.users[i].is_online = false;
    }
    $scope.$apply();
  });

}]);

$(document).ready(function() {

  $('div.row--online-list ul').niceScroll({
    cursorcolor:'#2D394B',
    cursorborder: "0",
    cursorwidth: "8px",
    cursoropacitymin: 0.3,
    scrollspeed: 100
  });

  $('.row--messages,div.emoticons-popover ul').niceScroll({
    cursorcolor:'#2D394B',
    cursorborder: "0",
    cursorwidth: "8px",
    cursoropacitymin: 0.3,
    scrollspeed: 100,
    railoffset: false,
    railpadding: { top: 10, right: 10, left: 0, bottom: 10 }
  });
  
  $('#emoticon-btn').click(function(e) {
    if (!$('.emoticons-popover').is(':visible'))
    {
      $('#emotion_icon').addClass('hide');
      $('#emotion_close').addClass('show');
      $('div.emoticons-popover').stop().show().css({'bottom':'12%'}).animate({'opacity':'1','bottom':'11%'},150);
    } else {
      $('div.emoticons-popover').stop().animate({'opacity':'0','bottom':'12%'},150,function(){
         $(this).hide();
      });
      $('#emotion_icon').removeClass('hide');
      $('#emotion_close').removeClass('show');
    }
  });


});
