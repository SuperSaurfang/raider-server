import { MongoClient, Collection, MongoCallback } from 'mongodb';
import * as config from '../../config.json';

export class MongoConnector {
  public getClient(): MongoClient {
    return new MongoClient(this.createConnectionString(), {
      useNewUrlParser: true
    })
  }

  public getConnection(callback: MongoCallback<MongoClient>): void {
    MongoClient.connect(this.createConnectionString(), {
      useNewUrlParser: true
    }, callback)
  }

  public getCollection<t>(client: MongoClient, collection: string): Collection<t> {
    let db = client.db(config.mongo.db);
    return db.collection<t>(collection);
  }

  private createConnectionString(): string {
    let conString = 'mongodb://';
    conString += config.mongo.user + ":";
    conString += config.mongo.pwd + '@';
    conString += config.mongo.host + ':';
    conString += config.mongo.port + "/";
    conString += config.mongo.db;
    return conString
  }
}