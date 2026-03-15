import { IUser } from "../models/user.model";

declare module "express-serve-static-core" {
  interface Request {
    user?: IUser;
    files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
  }
}