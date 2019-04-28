import express from "express";
import http from 'http';
import cors, { CorsOptions } from 'cors';
import { SocketHandler } from './lib/socketHandler';
import { RestEndpoint } from "./lib/restEndpoints";
import config  from './config.json';
import path from 'path'

class Main {
  private app: express.Express;
  private server: http.Server;
  private socket: SocketHandler;
  constructor(app: express.Express) {
    this.app = app;
    //this.app.use(cors(this.enableCors()))
    app.use(express.static(config.wwwroot + '/raider-client'));
    this.server = http.createServer(this.app);
    this.socket = new SocketHandler(this.server);
    this.setupEndpoint();
    this.requestListener();
  }

  private setupEndpoint() {
    let endpoint = new RestEndpoint(this.socket);
    this.app.use(endpoint.getChatList());
    this.app.use(endpoint.postLogin());
    this.app.use(endpoint.postRegister());
    this.app.use(endpoint.getMessages());
  }

  private enableCors(): CorsOptions {
    let whitelist = ['http://localhost:4200', 'http://localhost'];
    return {
      origin: function (origin: any, callback: Function) {
        if (whitelist.indexOf(origin) != -1) {
          callback(null, true);
        } else {
          callback('Not allowed!', false);
        }
      }
    }
  }

  public startServer() {
    this.server.listen(config.port, config.host, () => {
      console.log('server is running %s:%d', config.host, config.port)
    })
  }

  private requestListener() {
    this.app.get('*', (req, res) => {
      res.sendFile('/index.html', {
        root: config.wwwroot + '/raider-client'
      })
    })
  }

}
const app = express();
const main = new Main(app);
main.startServer()