import { JwtService as MidwayJwt } from "@midwayjs/jwt";
import { Inject, Provide } from "@midwayjs/decorator";
import { JwtPayload, SignOptions } from "jsonwebtoken";

@Provide()
export class JwtService {
  @Inject()
  jwt: MidwayJwt;

  /**
   * 生成固定的 jwt token
   * @returns jwt token
   */
  async generateFixedToken() {
    return await this.generateToken(
      { user_id: "admin", user_name: "admin" },
      {
        expiresIn: "1h",
      }
    );
  }

  /**
   * 生成 jwt token
   * @returns jwt token
   */
  async generateToken(payload: JwtPayload, options?: SignOptions) {
    return await this.jwt.sign(payload, options);
  }
}
