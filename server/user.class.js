var server = require('./run.js');

function User() {
  this.uid = null;
}

/**
 * [new - Создание пользователя]
 * @param  {number} id [номер пользователя]
 */
User.prototype.new = function (id) {
  id = parseInt(id, 10);

  // Проверяем на наличие такого пользователя в списке
	var user = server.users.find(function (user) {
    return id === user.id;
  });

  // Если есть, ставим статус онлайн
  if (user) {
		user.is_online = true;
    return false;
  }

  // Если нету, создаем нового
  server.users.push({
    id: id,
    name: "Guest " + id,
    is_online: true
  });

  this.uid = id;
};

/**
 * [del Удаление пользователя]
 * @param  {number} id [номер пользователя]
 */
User.prototype.del = function(id){
	for (var user in server.users)
    if (server.users[user].id == id)
		  server.users[user].is_online = false;
}

module.exports = User;