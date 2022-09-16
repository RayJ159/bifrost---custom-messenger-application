const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const authController = require('./controllers/authController')
const firestoreController = require('./controllers/firestoreController')
const http = require('http')
//const server = http.createServer(express())
//const {Server} = require('socket.io')


const {doc, onSnapshot} = require('firebase/firestore')


var globalSocket = ""

var app = express()

app.use(cors())
app.use(bodyParser.json())

//const server = http.createServer(app)
//const s = io.listen(server)

//const io = new Server(server, {
  //  cors: {
    //    origin: "*",

    //}
//})
var PORT = process.env.PORT || 5000
var server = require('http').createServer(app)
var io = require('socket.io')(server, {
    cors: {
        origin: "*", 
    }
})





io.on('connection', (socket) => {
    console.log('a user is connected')

    globalSocket = socket

    socket.on('disconnect', () => {
        console.log('a user has disconnected')
    })
})

//server.listen(8000, () => {
  //  console.log('listening on 8000')
//})

server.listen(PORT)

app.get('/', (req, res) => {
    res.send('hello world')
})

app.post('/register', async (req, res) => {
    console.log(req.body['user'])
    console.log(req.body['pass'])
    var uid = await authController.createUser(req.body['user'], req.body['pass'])
    firestoreController.addUserEmail(uid, req.body['user'])
    res.send('hello world')
})

app.post('/signin', async (req, res) => {
    console.log(req.body['user'])
    console.log(req.body['pass'])
    var uid = await authController.signInUser(req.body['user'], req.body['pass'])
    console.log('chatroom created')
    res.json({uid: uid})

})

app.get('/realms/:chatroom', async (req, res) => {
    res.json(await firestoreController.getMessages(req.params.chatroom))
})

app.post('/realms/:chatroom', async (req, res) => {
    email = req.body['email']
    text = req.body['text']
    console.log(email)
    console.log(text)
    console.log(req.params.chatroom)
    await firestoreController.addMessages(req.params.chatroom, email, text)
    io.emit("updateMessages")
    res.send("Message added")
})

app.post('/realms', async (req, res) => {
    firestoreController.createChatRoom(req.body['realm'])
    console.log('realm created')
    res.send("realm created")
})

//server.listen(5000, () => {
    //console.log('App is listening on port 5000')
//})

