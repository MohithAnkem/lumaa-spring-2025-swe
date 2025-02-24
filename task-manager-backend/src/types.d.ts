import { JwtPayload } from 'jsonwebtoken';
/*
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload & { id: number };
  }
}
*/
declare global {
    namespace Express {
      interface Request {
        user?: JwtPayload &  { id: number }; // Remove string union, only JwtPayload
      }
    }
  }
  