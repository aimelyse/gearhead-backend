import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { FirebaseAuthGuard } from 'src/firebase/firebase.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
@UseGuards(FirebaseAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Request() req) {
    return this.commentsService.create(createCommentDto, req.user.uid);
  }

  @Get()
  findAll(
    @Query('postType') postType?: string,
    @Query('postId') postId?: string,
    @Query('userId') userId?: string,
  ) {
    if (postType && postId) {
      return this.commentsService.findByPost(postType, postId);
    }
    if (userId) {
      return this.commentsService.findByUser(userId);
    }
    return this.commentsService.findAll();
  }

  @Get('my-comments')
  getMyComments(@Request() req) {
    return this.commentsService.findByUser(req.user.uid);
  }

  @Get(':id/replies')
  getReplies(@Param('id') id: string) {
    return this.commentsService.findReplies(id);
  }

  @Get('stats')
  getCommentStats(
    @Query('postType') postType: string,
    @Query('postId') postId: string,
  ) {
    return this.commentsService.getCommentStats(postType, postId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCommentDto: UpdateCommentDto,
    @Request() req,
  ) {
    return this.commentsService.update(id, updateCommentDto, req.user.uid);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.commentsService.remove(id, req.user.uid);
  }

  @Post(':id/like')
  likeComment(@Param('id') id: string) {
    return this.commentsService.likeComment(id);
  }

  @Post(':id/unlike')
  unlikeComment(@Param('id') id: string) {
    return this.commentsService.unlikeComment(id);
  }
}
