import bcrypt from "bcrypt";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import prismaClient from "../../prisma/client.prisma";

export const users: Array<{ email: string; encryptedPassword: string }> = [];

class AuthService {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      if (!email.trim()) throw new Error("No email");
      if (!password.trim()) throw new Error("No password");

      const encryptedPassword = await bcrypt.hash(password, 12);

      users.push({ email, encryptedPassword });

      const user = await prismaClient.user.create({
        data: {
          email,
          encryptedPassword,
        },
        select: { id: true, email: true, createdAt: true, profile: true },
      });

      res.json(encryptedPassword);
    } catch (e) {
      next(e);
    }
  }

  async logIn(req: Request, res: Response) {
    const { email, password } = req.body;
    const user = await prismaClient.user.findUnique({ where: { email } });
    if (!user) return res.sendStatus(404);

    const isVerified = await bcrypt.compare(password, user.encryptedPassword);
    if (!isVerified) return res.sendStatus(400);

    const accessToken = jwt.sign({ email }, process.env.JWT_SECRET_KEY!, {
      subject: user.id.toString(),
    });

    res.json(accessToken);
  }
}

const authService = new AuthService();

export default authService;
