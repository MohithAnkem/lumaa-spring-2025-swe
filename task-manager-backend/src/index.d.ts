declare namespace Express {
    export interface Request {
      user?: import("jsonwebtoken").JwtPayload & { id: number };
    }
  }