import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Post, PostDocument } from '../schemas/post.schema';

@Injectable()
export class PostModel {
  constructor(@InjectModel(Post.name) public model: PaginateModel<PostDocument>) {}

  async save(post: Post) {
    const createdPost = new this.model(post);
    return createdPost.save();
  }
}
