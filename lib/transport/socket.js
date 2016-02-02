/**
 * Created by Denis Trofimov on 17.10.15.
 */
var mongoose = require('mongoose');
var io = require('socket.io')({
    transports: ['polling']
});

io.use(function (socket, next) {
    var AccessToken = mongoose.model('access_token');
    var access_token = socket.request._query.access_token;
    if (!access_token)
        return next(error(401, "Не указан токен доступа"));
    return AccessToken.findOne({
        token: access_token
    }).exec(function (err, accessToken) {
        if (err)
            return next(err);

        if (!accessToken)
            return next(error(401, "Токен доступа не прошел проверку"));

        if (accessToken.user.type == 3)
            return next(error(401, "Доступ запрещен"));

        socket.user = accessToken.user;
        return next();
    });
});

io.on('connection', function (socket) {
    console.log('a user connected', socket.user);
    var User = mongoose.model('user');
    User.findById(socket.user).exec(function (err, user) {
        if (!err)
            socket.join(user.admin_of_company);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected', socket.user);
    });
});

module.exports = io;