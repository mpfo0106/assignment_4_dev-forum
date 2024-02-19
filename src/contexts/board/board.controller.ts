import { Router } from "express";
import postsService from "./services/posts.service";

const boardsController = Router();

boardsController.post("/:type", postsService.createPost);
boardsController.get("/:type", postsService.getPosts);
boardsController.get("/:type/:postId", postsService.getPost);
boardsController.get("/:type/likes/:userId", postsService.getPostByLike);
boardsController.put("/:type/:postId", postsService.updatePost);
boardsController.delete("/:type/:postId", postsService.deletePost);

export default boardsController;
