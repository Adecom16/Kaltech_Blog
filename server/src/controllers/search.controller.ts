import asyncHandler from "express-async-handler";
import Post from "../models/post";
import Tag from "../models/tag";
import User from "../models/user";
import { getPostsWithUser } from "./post.controller";
import { escapeRegex } from "../middlewares/validation";

//todo pagination
export const postSearch = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  const { userId } = req.body;
  const ignoreAuthors = [];
  const ignorePosts = [];
  if (userId) {
    const user = await User.findOne({ _id: userId });
    ignoreAuthors.push(...(user?.mutedAuthor ?? []));
    ignorePosts.push(...(user?.ignore ?? []));
  }
  const escapedQuery = escapeRegex(query);
  const regex = new RegExp(escapedQuery, "i");
  const posts = await getPostsWithUser(
    Post.find({
      $and: [
        { title: regex },
        { _id: { $nin: ignorePosts } },
        { userId: { $nin: ignoreAuthors } },
      ],
    })
  );
  res.send(posts);
});

//todo pagination
export const topicSearch = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  const escapedQuery = escapeRegex(query);
  const regex = new RegExp(escapedQuery, "i");
  const tags = await Tag.find({ name: regex });
  res.send(tags);
});

//todo pagination
export const userSearch = asyncHandler(async (req, res, next) => {
  const { query } = req.params;
  const escapedQuery = escapeRegex(query);
  const regex = new RegExp(escapedQuery, "i");
  const users = await User.find({ name: regex });
  res.send(users);
});
