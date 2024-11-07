import { JwtService as MidwayJwt } from "@midwayjs/jwt";
import { Inject, Provide } from "@midwayjs/decorator";
import { JwtPayload } from "jsonwebtoken";
import { _JWT_SECRET_KEY_ } from "../utils/jwtSecretKey";

@Provide()
export class JwtService {
  @Inject()
  jwt: MidwayJwt;


  /**
   * 生成 jwt token
   * @returns jwt token
   */
  async generateToken(payload: JwtPayload, expiresIn='1h') {
    return await this.jwt.sign(payload,_JWT_SECRET_KEY_, {
      expiresIn: expiresIn,
      algorithm:'HS256'
    });
  }

    /**
   * 解析 jwt token
   * @returns payload
   */
    async parseToken(token: string) {
      const decoded = await this.jwt.verify(token, _JWT_SECRET_KEY_,{
        algorithms:['HS256']
      });
      return decoded
    }
}
