import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment, CommentDocument } from './entities/comment.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async create(
    createCommentDto: CreateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const createdComment = new this.commentModel({
      ...createCommentDto,
      userID: userId,
    });

    const savedComment = await createdComment.save();

    // If this is a reply, increment the parent comment's reply count
    if (createCommentDto.parentCommentID) {
      await this.incrementReplies(createCommentDto.parentCommentID);
    }

    return await this.findOne(savedComment._id.toString());
  }

  async findAll(): Promise<Comment[]> {
    return await this.commentModel
      .find()
      .populate('userID', 'name profileImage')
      .populate('parentCommentID')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByPost(postType: string, postId: string): Promise<Comment[]> {
    return await this.commentModel
      .find({
        postType,
        postID: postId,
        parentCommentID: { $exists: false }, // Only get top-level comments
      })
      .populate('userID', 'name profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findReplies(commentId: string): Promise<Comment[]> {
    return await this.commentModel
      .find({ parentCommentID: commentId })
      .populate('userID', 'name profileImage')
      .sort({ createdAt: 1 })
      .exec();
  }

  async findByUser(userId: string): Promise<Comment[]> {
    return await this.commentModel
      .find({ userID: userId })
      .populate('userID', 'name profileImage')
      .populate('parentCommentID')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findById(id)
      .populate('userID', 'name profileImage')
      .populate('parentCommentID')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async update(
    id: string,
    updateCommentDto: UpdateCommentDto,
    userId: string,
  ): Promise<Comment> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userID.toString() !== userId) {
      throw new ForbiddenException('You can only update your own comments');
    }

    const updatedComment = await this.commentModel
      .findByIdAndUpdate(id, updateCommentDto, { new: true })
      .populate('userID', 'name profileImage')
      .populate('parentCommentID')
      .exec();

    return updatedComment;
  }

  async remove(id: string, userId: string): Promise<void> {
    const comment = await this.commentModel.findById(id);

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userID.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    // If this comment has a parent, decrement the parent's reply count
    if (comment.parentCommentID) {
      await this.decrementReplies(comment.parentCommentID.toString());
    }

    // Delete all replies to this comment
    await this.commentModel.deleteMany({ parentCommentID: id });

    await this.commentModel.findByIdAndDelete(id);
  }

  async likeComment(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true })
      .populate('userID', 'name profileImage')
      .populate('parentCommentID')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }

  async unlikeComment(id: string): Promise<Comment> {
    const comment = await this.commentModel
      .findByIdAndUpdate(id, { $inc: { likes: -1 } }, { new: true })
      .populate('userID', 'name profileImage')
      .populate('parentCommentID')
      .exec();

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Ensure likes don't go below 0
    if (comment.likes < 0) {
      comment.likes = 0;
      await comment.save();
    }

    return comment;
  }

  private async incrementReplies(commentId: string): Promise<void> {
    await this.commentModel.findByIdAndUpdate(commentId, {
      $inc: { replies: 1 },
    });
  }

  private async decrementReplies(commentId: string): Promise<void> {
    await this.commentModel.findByIdAndUpdate(commentId, {
      $inc: { replies: -1 },
    });
  }

  async getCommentStats(postType: string, postId: string): Promise<any> {
    const totalComments = await this.commentModel.countDocuments({
      postType,
      postID: postId,
    });

    const topLevelComments = await this.commentModel.countDocuments({
      postType,
      postID: postId,
      parentCommentID: { $exists: false },
    });

    const replies = totalComments - topLevelComments;

    return {
      totalComments,
      topLevelComments,
      replies,
    };
  }
}
