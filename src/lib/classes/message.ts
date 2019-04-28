export class Message {
  constructor(messageDate: Date, messageFrom: string, messaheText: string, messageRoom: string) {
    this.messageDate = messageDate;
    this.messageFrom = messageFrom;
    this.messageText = messaheText;
    this.messageRoom = messageRoom;
  }

  public messageDate: Date;
  public messageFrom: string;
  public messageText: string;
  public messageRoom: string;
}