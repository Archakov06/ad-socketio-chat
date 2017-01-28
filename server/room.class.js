var server = require('./run.js');
var User = new require('./user.class.js');

function Room() {}

/**
 * [Create - Создание комнаты]
 */
Room.prototype.Create = function(socket){

	// Создаем ID комнаты
	var room_id = Math.ceil( Math.random() * 1000 );

	// Добавляем в массив объект комнаты
	server.rooms.push({
		id: room_id,
		is_full: false
	});

	// Посылаем запрос клиенту, ID комнаты
	socket.emit('room_info', {id:room_id, uid:User.uid} );

}

/**
 * [Connect - Подключение к комнате]
 */
Room.prototype.Connect = function(socket){

	// Проверяем наличие свободных комнат
	var room_id = this.GetFreeRoom();

	// Если комната есть
	if (typeof room_id == 'number') {

		// Задаем комнате параметр, что она заполнена
		server.rooms[room_id].is_full = true;

		// Посылаем запрос клиенту, ID комнаты
		socket.emit('room_info', {id:room_id} );

	} else {

		// Иначе создаем комнату
		this.Create(socket);

	}

}

/**
 * [GetFreeRoom - Проверка доступных комнат]
 * return id (number)
 */
Room.prototype.GetFreeRoom = function(){

	var room = -1;

	// Если имеются созданные комнаты
	if (server.rooms.length > 0) {

		// Достаем ID первой свободной комнаты
		for (var i = 0; i < server.rooms.length; i++)
			if (server.rooms[i].is_full != false) 
				return i;

	} else return false;

}

module.exports = Room;
