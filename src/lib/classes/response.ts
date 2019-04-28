export class Response<t>{
  constructor(status: string, code: number, data: t) {
    this.status = status;
    this.code = code;
    this.data = data;
  }

  public status: string;
  public code: number;
  public data: t;
}