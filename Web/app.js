const net = require('net');
const request = require('request');

const createError = require('http-errors');
const express = require('express');

const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const http = require('http');
const debug = require('debug')('web:server');

const session = require('express-session');
const sessionStore = new session.MemoryStore();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.set('trust proxy', 1);
app.use(session({
    store: sessionStore,
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

/**
 * Create HTTP server and web socket.
 */

const server = http.createServer(app);

const io = require('socket.io')(server);

/**
 * Attach routers.
 */

const indexRouter = require('./routes/index')(sessionStore, io);

app.use('/', indexRouter);

app.use(function (req, res, next) {
    next(createError(404));
});

app.use(function (err, req, res, next) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    res.status(err.status || 500);
    res.render('error');
});

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '8080');
app.set('port', port);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function toHexString(byteArray) {
    return Array.from(byteArray, function(byte) {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('')
}

const TCPserver = net.createServer((socket) => {
    socket.write('Echo server\r\n');
    socket.on('data', function (data) {
        const textChunk = data.toString('utf8');
        socket.write(textChunk);

        const hex = toHexString(data);

        console.log(data.length);
        console.log(data[0]);
        console.log(data[101]);

        request.post('http://localhost:8080/api/image',
            {
                form: {
                    n: data[0],
                    c: hex.slice(2, 202)
                }
            });

        request.post('http://localhost:8080/api/image',
            {
                form: {
                    n: data[101],
                    c: hex.slice(204, 404)
                }
            });
    });

}).on('error', (err) => {
    throw err;
});

TCPserver.listen(1337, '0.0.0.0');

function normalizePort(val) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

// named pipe

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address();
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
