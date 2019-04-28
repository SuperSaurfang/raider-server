import jwt from 'jsonwebtoken';
import fs from 'fs';
import bcrypt from 'bcrypt';
import { User } from './classes';


export class Secure {

  private RSA_PRIVATE_KEY: Buffer
  constructor(){
    this.RSA_PRIVATE_KEY = fs.readFileSync('./keys/raider.key');
  }

  public generateSessionKey(): string{
    return jwt.sign({},this.RSA_PRIVATE_KEY, {
      algorithm: 'RS256'
    })
  }

  public verifyToken(token: string): void {
    jwt.verify(token, this.RSA_PRIVATE_KEY)
  }

  public hashPassword(rounds: number, user: User): Promise<User> {
    return bcrypt.hash(user.password, rounds).then(hashedPassword => {
      user.password = hashedPassword
      return Promise.resolve<User>(user)
    })
  }

  public comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash).then(result => {
      return result;
    })
  }
}