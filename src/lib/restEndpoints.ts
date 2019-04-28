import  express  from "express";
import { SocketHandler } from "./socketHandler";
import { ChatRoom, User, Response, Message } from "./classes";
import { MongoIO } from './dbmanager'
import bodyParser from 'body-parser';
import { Secure } from './secure'
import { MongoError } from "mongodb";


export class RestEndpoint {
  private endpoint = '/rest'
  private app: express.Express;
  private mongoIo: MongoIO;
  private secure: Secure
  constructor(private socket: SocketHandler) {
    this.app = express();
    this.app.use(bodyParser.json())
    this.mongoIo = new MongoIO();
    this.secure = new Secure;
  }

  /**
   * @description loads the chatlist and the count of connected user, if anyone is connected
   */
  public getChatList(): express.Express {
    return this.app.get(this.endpoint + '/chatlist', (req: express.Request, res: express.Response) => {
      let rooms = this.socket.getRooms()
      this.mongoIo.defaultrooms((defaultRooms) => {
        if(rooms.length != 0) {
          defaultRooms.forEach(defaultRoom => {
            if(!rooms.find(room => room.room === defaultRoom.room)) {
              rooms.push(defaultRoom);
            }
          })
          rooms.sort((a, b) => a.connections - b.connections)
          rooms.reverse();
          let response = new Response<ChatRoom[]>('success', 200, rooms)
          res.send(response)
        } else {
          let response = new Response<ChatRoom[]>('success', 200, defaultRooms)
          res.send(response)
        }
      })
    })
  }

  public getMessages(): express.Express {
    return this.app.get(this.endpoint + '/messages/:room', (req: express.Request, res: express.Response) => {
      this.mongoIo.loadMessage(req.params.room, (messages) => {
        if(messages) {
          messages.sort((a, b) => this.sortMessage(a, b))
          let response = new Response<Message[]>('succes', 200, messages)
          res.send(response)
        } else {
          let response = new Response<Message[]>('succes', 200, [])
          res.send(response)
        }
        
      })
    })
  }

  private sortMessage(a: Message, b: Message): number{
    a.messageDate = new Date(a.messageDate);
    b.messageDate = new Date(b.messageDate);
    return a.messageDate.getTime() - b.messageDate.getTime();
  }

  /**
   * @description rest endpoint for user login
   */
  public postLogin(): express.Express {
    return this.app.post(this.endpoint + '/login', (req: express.Request, res: express.Response) => {
      const user = User.createUser(req.body)
      this.mongoIo.login(user, (error, result) => {
        if(error) {
          let response = new Response<MongoError>('error', 422, error);
          res.send(response);
        } else {
          if(result != null) {
            let userResult = User.createUser(result)
            this.secure.comparePasswords(user.password, userResult.password).then(isSame => {
              userResult.password = ''
              if(isSame) {
                let data = {
                  token: this.secure.generateSessionKey(),
                  expire: 48,
                  user: userResult
                };
                let respnse = new Response<Object>('success', 200, data);
                res.send(respnse);
              } else {
                let response = new Response<string>('failed', 422, 'The password is false');
                res.send(response);
              }
            })
          } else {
            let response = new Response<string>('failed', 422, 'No User was found');
            res.send(response);
          }
        }
      })
    })
  }

  /**
   * @description rest endpoint for user registration
   */
  public postRegister(): express.Express {
    return this.app.post(this.endpoint + '/register', (req: express.Request, res: express.Response) => {
      let user = User.createUser(req.body)
      this.secure.hashPassword(10, user).then((user) => {
        this.mongoIo.register(user, (error, result) => {
          if(error){
            let response = new Response<MongoError>('error', 422, error)
            res.send(response)
          } else {
            let resultUser = User.createUser(result.ops[0])
            resultUser.password = '';
            let data = {
              token: this.secure.generateSessionKey(),
              expire: 48,
              user: resultUser
            }
            let response = new Response<Object>('succes', 200, data)
            res.send(JSON.stringify(response));
          }
        })
      })
    })
  }
}

