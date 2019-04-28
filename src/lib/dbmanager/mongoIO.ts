import { MongoConnector } from './mongoConnector'
import { MongoClient, MongoCallback, InsertOneWriteOpResult, UpdateWriteOpResult, FindOneOptions, IteratorCallback, EndCallback } from 'mongodb';
import { ChatRoom, User, Message } from '../classes';

interface mongoIOCallback<t> { (data: t): void }

export class MongoIO {

  private connector: MongoConnector;
  constructor() {
    this.connector = new MongoConnector();
  }

  saveMessage(message: Message): void {
    this.connector.getConnection((error, client) => {
      if(error) {
        console.log(error)
      } else {
        let collection = this.connector.getCollection<Message>(client, 'raidermessages');
        collection.insertOne(message);
      }
    })
  }

  loadMessage(room: string, callback: mongoIOCallback<Message[]>): void {
    this.connector.getConnection((error, client) => {
      if(error) {
        console.log(error)
      } else {
        let collection = this.connector.getCollection<Message>(client, 'raidermessages');
        let result = collection.find({ messageRoom: room }, {projection: { '_id': 0 }})
        let messages: Message[] = []
        result.forEach((message) => {
          result.hasNext().then(hasNext => {
            if(hasNext) {
              messages.push(message)
            } else {
              messages.push(message)
              callback(messages)
            }
          })
        }, (error) => {
          console.log(error)
        })
      }
    })
  }

  login(user: User, callback: MongoCallback<FindOneOptions | null>): void {
    this.connector.getConnection((error, client) => {
      if(error) {
        console.log(error)
      } else {
        let collection = this.connector.getCollection<User>(client, 'raiderusers');
        collection.findOne({ loginName: user.loginName }, {}, callback)
      }
    })
  }

  public register(user: User, callback: MongoCallback<InsertOneWriteOpResult>): void {
    this.connector.getConnection((error, client) => {
      if(error) {
        console.log(error)
      } else {
        let collection = this.connector.getCollection<User>(client, 'raiderusers');
        collection.insertOne(user, callback);
      }
    })
  }

  public defaultrooms(callback: mongoIOCallback<ChatRoom[]>): void {
    this.connector.getConnection((error, client) => {
      if(error) {
        console.log(error)
      } else {
        let collection = this.connector.getCollection<ChatRoom>(client, 'raiderdefaultrooms');
        let result = collection.find({ }, {projection: { '_id': 0 }});
        let chatRooms: ChatRoom[] = [];
        result.forEach((chatRoom) => {
          result.hasNext().then(hasNext => {
            if(hasNext) {
              chatRooms.push(chatRoom)
            } else {
              chatRooms.push(chatRoom)
              callback(chatRooms)
            }
          })
        }, (error) => {
          console.log(error)
        })
      }
    })
  }
}