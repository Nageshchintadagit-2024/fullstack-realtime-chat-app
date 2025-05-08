import {Server} from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors:{
        origin :['http://localhost:5173']
    }
})

export function getRecieverSocketId(userId){
    return usersSocketMap[userId]
}

const usersSocketMap = {}; // used dto store online users

io.on('connection', (socket) => {
   console.log('A user connected', socket.id)

   const userId = socket.handshake.query.userId

   if (userId) usersSocketMap[userId] = socket.id 

   //io.emit() is used to send events to all the connected client

   io.emit('getOnlineUsers', Object.keys(usersSocketMap))

   socket.on('disconnect', () => {
    console.log('A user is disconnected', socket.id)
    delete usersSocketMap[userId]
    io.emit('getOnlineUsers', Object.keys(usersSocketMap))
   })
})

export {io, app,server};