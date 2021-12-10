const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')

//Destructuring
const {
    generateMessage,
    generateLocationMsg
} = require('./utils/messages')

const {
    addUser,
    userRemove,
    getUser,
    getUsersRoom
} = require('./utils/users')

const app = express()
const server = http.createServer(app)

//AutoLink
const Autolinker = require('autolinker');
const anchorme = require("anchorme").default;

const linkify = require('linkifyjs');
const linkifyHtml = require('linkify-html');



// Check for profanity
const Filter = require('bad-words')

//Initiate socket-io
const io = socketio(server)


// Define path for Express config 
const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))


//Server-side
io.on('connection', (socket) => {
    console.log(' WebSocket Connection')

    socket.on('join', (options, callback) => {
        const {
            error,
            user
        } = addUser({
            id: socket.id,
            ...options
        })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersRoom(user.room)
        })
        callback()
    })

    // Listening for socket i.e messages
    socket.on('sendMsg', (message, callback) => {
        const user = getUser(socket.id)

        var autoLinker = new Autolinker({
            newWindow: true,
            phone: false,
            urls: true,
            stripPrefix: true
        })

        const linkSide = autoLinker.link(message)




        var filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }


        io.to(user.room).emit('message', generateMessage(user.username, linkSide))
        callback()
    })

    // Listening to event pertaining location
    socket.on('sendlocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessages', generateLocationMsg(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    //Prompts a disconnect message in the chat room if user exists
    socket.on('disconnect', () => {
        const user = userRemove(socket.id)

        if (user) {

            io.to(user.room).emit('message', generateMessage(`${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersRoom(user.room)
            })
        }
    })
})

// Set up port we're listening to
server.listen(port, () => {
    console.log(`Server is up at ${port}`)
})