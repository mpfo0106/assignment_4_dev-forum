import { Post, PostType } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import prismaClient from "../../../prisma/client.prisma";

class PostsService {
  async createPost(
    req: Request<
      never,
      unknown,
      {
        title: string;
        content: string;
        type: PostType;
        userId: number;
      }
    >,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { title, content, type, userId } = req.body;

      if (!title.trim()) throw new Error("No title");
      if (!content.trim()) throw new Error("No content");
      if (![PostType.frontend, PostType.backend].includes(type))
        throw new Error("Invalid post type");
      if (!userId) throw new Error("No userId provided");

      const newPost = await prismaClient.post.create({
        data: {
          title,
          content,
          type,
          userId,
        },
      });

      res.json(newPost);
    } catch (e) {
      next(e);
    }
  }

  async getPosts(
    req: Request<{ type: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { type } = req.params;

      const posts = await prismaClient.post.findMany({
        where: { type: type as PostType },
        orderBy: {
          createdAt: "desc",
        },
      });

      res.json(posts);
    } catch (e) {
      next(e);
    }
  }

  async getPost(req: Request<{ postId: string }>, res: Response) {
    const parsedPostId = Number(req.params.postId);
    if (isNaN(parsedPostId)) throw new Error("PostId is not a number");

    const post = await prismaClient.post.findUnique({
      where: { id: parsedPostId },
      select: {
        id: true,
        title: true,
        content: true,
      },
    });
    res.json(post);
  }

  async getPostByLike(
    req: Request<{ userId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsedUserId = Number(req.params.userId);
      if (isNaN(parsedUserId)) throw new Error("UserId is not a number");

      const likedPosts = await prismaClient.like.findMany({
        where: { userId: parsedUserId },
        include: {
          post: true,
        },
      });

      res.json(likedPosts.map((like: { post: Post }) => like.post));
    } catch (e) {
      next(e);
    }
  }

  async updatePost(
    req: Request<{ postId: string }, any, { title?: string; content?: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsedPostId = Number(req.params.postId);
      if (isNaN(parsedPostId)) throw new Error("PostId is not a number");

      const { title, content } = req.body;

      if (!title?.trim() && !content?.trim()) {
        throw new Error("No title or content");
      }

      const post = await prismaClient.post.update({
        where: { id: parsedPostId },
        data: { title, content },
        select: { id: true, title: true, content: true },
      });
      if (!post) throw new Error("Post Not Found");

      res.json(post);
    } catch (e) {
      next(e);
    }
  }

  async deletePost(
    req: Request<{ postId: string }>,
    res: Response,
    next: NextFunction
  ) {
    try {
      const parsedPostId = Number(req.params.postId);
      if (isNaN(parsedPostId)) throw new Error("PostId is not a number");

      await prismaClient.post.delete({ where: { id: parsedPostId } });

      res.json(parsedPostId);
    } catch (e) {
      next(e);
    }
  }
}

const postsService = new PostsService();

export default postsService;
