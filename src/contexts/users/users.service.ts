import { User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prismaClient from "../../prisma/client.prisma";

class UsersService {
  async createProfile(
    req: Request<
      { userId: string },
      unknown,
      {
        nickname: string;
        name: string;
      }
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { userId } = req.params;
      const { nickname, name } = req.body;

      const parsedUserId = parseInt(userId, 10);
      if (isNaN(parsedUserId)) throw new Error("Invalid user ID");

      const userProfile = await prismaClient.userProfile.upsert({
        where: { userId: parsedUserId },
        update: { nickname, name },
        create: { userId: parsedUserId, nickname, name },
      });

      res.json(userProfile);
    } catch (e) {
      next(e);
    }
  }

  async getUsers(_: Request, res: Response) {
    const users = await prismaClient.user.findMany();
    res.json(users);
  }

  async getUser(req: Request<{ userId: string }>, res: Response) {
    const parsedUserId = Number(req.params.userId);
    if (isNaN(parsedUserId)) throw new Error("UserId is not a number");

    const user = await prismaClient.user.findUnique({
      where: { id: parsedUserId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        profile: true,
      },
    });

    res.json(user);
  }

  async updateUser(
    req: Request<
      { userId: string },
      Omit<User, "encryptedPassword">,
      { email: string }
    >,
    res: Response<Omit<User, "encryptedPassword">>
  ) {
    const parsedUserId = Number(req.params.userId);
    if (isNaN(parsedUserId)) throw new Error("UserId is not a number");

    const { email } = req.body;

    const user = await prismaClient.user.update({
      where: { id: parsedUserId },
      data: { email },
      select: { id: true, email: true, createdAt: true },
    });
    if (!user) throw new Error("User Not Found");

    res.json(user);
  }

  async deleteUser(
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsedUserId = Number(req.params.userId);
      if (isNaN(parsedUserId)) throw new Error("UserId is not a number");

      await prismaClient.user.delete({ where: { id: parsedUserId } });

      res.json(parsedUserId);
    } catch (e) {
      next(e);
    }
  }
}

const usersService = new UsersService();

export default usersService;
