export class ChatRoom{
  constructor(room: string, connections: number) {
    this.room = room;
    this.connections = connections;
  }
  public room: string;
  public connections: number;
}