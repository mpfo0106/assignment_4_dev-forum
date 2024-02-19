import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { users } from "../contexts/auth/auth.service";
const freePassRoutes = ["/auth/sign-up", "/auth/log-in"];

export default function authenticator(
  req: Request,
  res: Response,
  next: NextFunction
) {
  //여권 발급 받으러 왔니? 지나가
  if (freePassRoutes.includes(req.url)) return next();

  //여권 가져왔니? 안가져왔으면 돌아가
  const accessToken = req.headers.authorization?.split("Bearer ")[1];
  if (!accessToken) return res.sendStatus(401);

  //여권 유효한거 맞니?

  try {
    const { sub: email } = jwt.verify(accessToken, process.env.JWT_SECRET_KEY!); //sub 는 아이디값
    const user = users.find((user) => user.email === email);
    if (!user) return res.sendStatus(404);
  } catch (e) {
    return res.sendStatus(401);
  }

  next();
}
