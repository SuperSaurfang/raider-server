import io from 'socket.io';
import http from 'http';
import { Message, ChatRoom } from './classes';
import { MongoIO } from './dbmanager';

export class SocketHandler {
  public io: io.Server;
  private mongoIO: MongoIO;
  constructor(server: http.Server) {
    this.io = io(server);
    this.mongoIO = new MongoIO;
    this.connectionListener();
  }
  
  public getRooms(): ChatRoom[]{
    let chatroom: ChatRoom[] = [];
    const keys = Object.keys(this.io.sockets.adapter.rooms);
    if(keys.length != 0){
      keys.forEach(key => {
        if(this.io.sockets.adapter.rooms[key] != undefined){
          chatroom.push(
            new ChatRoom(key, this.io.sockets.adapter.rooms[key].length)
          )
        }
      })
    }
    return chatroom;
  }

  private connectionListener() {
    this.io.on('connection', (socket) => {

      socket.on('requestMessage', (data: Message) => {
        this.recieveMessage(socket, data);
      })

      socket.on('enterChatRoom', (room: string) => {
        this.enterChatRoom(socket, room);
      })

      socket.on('changeChatRoom', (oldRoom: string, newRoom: string) => {
        this.changeChatRoom(socket, oldRoom, newRoom);
      })

      socket.on('disconnect', () => {
        console.log('disconnect')
      })
    })
  }

  private recieveMessage(socket: io.Socket, data: Message) {
    this.mongoIO.saveMessage(data);
    socket.in(data.messageRoom).emit('responseMessage', data);
  }

  private enterChatRoom(socket: io.Socket, room: string) {
    socket.leaveAll();
    socket.join(room);
  }

  private changeChatRoom(socket: io.Socket, oldRoom: string, newRoom: string){
    socket.leave(oldRoom);
    socket.join(newRoom);
  }
}