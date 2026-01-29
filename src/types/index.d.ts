import { Iuser } from "../models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: Iuser; // Yahan humne 'user' property add kar di
    }
  }
}