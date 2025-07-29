import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { SubmitChallengeDto } from './dto/submit-challenge.dto';
import { Challenge, ChallengeDocument } from './entities/challenge.entity';

@Injectable()
export class ChallengesService {
  constructor(
    @InjectModel(Challenge.name)
    private challengeModel: Model<ChallengeDocument>,
  ) {}

  async create(createChallengeDto: CreateChallengeDto): Promise<Challenge> {
    const createdChallenge = new this.challengeModel(createChallengeDto);
    return await createdChallenge.save();
  }

  async findAll(): Promise<Challenge[]> {
    return await this.challengeModel
      .find()
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .populate('winnerID', 'name profileImage')
      .sort({ startDate: -1 })
      .exec();
  }

  async findActive(): Promise<Challenge[]> {
    const now = new Date();
    return await this.challengeModel
      .find({
        status: 'Active',
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .sort({ endDate: 1 })
      .exec();
  }

  async findCompleted(): Promise<Challenge[]> {
    return await this.challengeModel
      .find({ status: 'Completed' })
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .populate('winnerID', 'name profileImage')
      .sort({ endDate: -1 })
      .exec();
  }

  async findByStatus(status: string): Promise<Challenge[]> {
    return await this.challengeModel
      .find({ status })
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .populate('winnerID', 'name profileImage')
      .sort({ startDate: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Challenge> {
    const challenge = await this.challengeModel
      .findById(id)
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .populate('winnerID', 'name profileImage')
      .exec();

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }
    return challenge;
  }

  async update(
    id: string,
    updateChallengeDto: UpdateChallengeDto,
  ): Promise<Challenge> {
    const updatedChallenge = await this.challengeModel
      .findByIdAndUpdate(id, updateChallengeDto, { new: true })
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .populate('winnerID', 'name profileImage')
      .exec();

    if (!updatedChallenge) {
      throw new NotFoundException('Challenge not found');
    }
    return updatedChallenge;
  }

  async remove(id: string): Promise<void> {
    const result = await this.challengeModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('Challenge not found');
    }
  }

  async joinChallenge(challengeId: string, userId: string): Promise<Challenge> {
    const challenge = await this.challengeModel.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== 'Active') {
      throw new BadRequestException('Challenge is not active');
    }

    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      throw new BadRequestException(
        'Challenge is not currently accepting participants',
      );
    }

    if (challenge.participants.includes(userId as any)) {
      throw new BadRequestException(
        'You are already participating in this challenge',
      );
    }

    const updatedChallenge = await this.challengeModel
      .findByIdAndUpdate(
        challengeId,
        { $push: { participants: userId } },
        { new: true },
      )
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .populate('winnerID', 'name profileImage')
      .exec();

    return updatedChallenge;
  }

  async leaveChallenge(
    challengeId: string,
    userId: string,
  ): Promise<Challenge> {
    const challenge = await this.challengeModel.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (!challenge.participants.includes(userId as any)) {
      throw new BadRequestException(
        'You are not participating in this challenge',
      );
    }

    // Remove user from participants and their submission if exists
    const updatedChallenge = await this.challengeModel
      .findByIdAndUpdate(
        challengeId,
        {
          $pull: {
            participants: userId,
            submissions: { userID: userId },
          },
        },
        { new: true },
      )
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .populate('winnerID', 'name profileImage')
      .exec();

    return updatedChallenge;
  }

  async submitToChallenge(
    challengeId: string,
    submitChallengeDto: SubmitChallengeDto,
    userId: string,
  ): Promise<Challenge> {
    const challenge = await this.challengeModel.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== 'Active') {
      throw new BadRequestException('Challenge is not active');
    }

    const now = new Date();
    if (now < challenge.startDate || now > challenge.endDate) {
      throw new BadRequestException('Challenge submission period has ended');
    }

    if (!challenge.participants.includes(userId as any)) {
      throw new BadRequestException('You must join the challenge first');
    }

    // Check if user already has a submission
    const existingSubmission = challenge.submissions.find(
      (sub) => sub.userID.toString() === userId,
    );

    if (existingSubmission) {
      // Update existing submission
      await this.challengeModel.updateOne(
        { _id: challengeId, 'submissions.userID': userId },
        {
          $set: {
            'submissions.$.imageURL': submitChallengeDto.imageURL,
            'submissions.$.submittedAt': new Date(),
            'submissions.$.votes': 0, // Reset votes on resubmission
          },
        },
      );
    } else {
      // Add new submission
      await this.challengeModel.updateOne(
        { _id: challengeId },
        {
          $push: {
            submissions: {
              userID: userId,
              imageURL: submitChallengeDto.imageURL,
              votes: 0,
              submittedAt: new Date(),
            },
          },
        },
      );
    }

    return await this.findOne(challengeId);
  }

  async voteForSubmission(
    challengeId: string,
    submissionUserId: string,
  ): Promise<Challenge> {
    const challenge = await this.challengeModel.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    const submission = challenge.submissions.find(
      (sub) => sub.userID.toString() === submissionUserId,
    );

    if (!submission) {
      throw new NotFoundException('Submission not found');
    }

    await this.challengeModel.updateOne(
      { _id: challengeId, 'submissions.userID': submissionUserId },
      { $inc: { 'submissions.$.votes': 1 } },
    );

    return await this.findOne(challengeId);
  }

  async completeChallenge(challengeId: string): Promise<Challenge> {
    const challenge = await this.challengeModel.findById(challengeId);

    if (!challenge) {
      throw new NotFoundException('Challenge not found');
    }

    if (challenge.status !== 'Active') {
      throw new BadRequestException('Challenge is not active');
    }

    // Find winner (submission with most votes)
    let winner = null;
    let maxVotes = -1;

    challenge.submissions.forEach((submission) => {
      if (submission.votes > maxVotes) {
        maxVotes = submission.votes;
        winner = submission.userID;
      }
    });

    const updatedChallenge = await this.challengeModel
      .findByIdAndUpdate(
        challengeId,
        {
          status: 'Completed',
          winnerID: winner,
        },
        { new: true },
      )
      .populate('participants', 'name profileImage')
      .populate('submissions.userID', 'name profileImage')
      .populate('winnerID', 'name profileImage')
      .exec();

    return updatedChallenge;
  }

  async getChallengeStats(challengeId: string): Promise<any> {
    const challenge = await this.findOne(challengeId);

    return {
      totalParticipants: challenge.participants.length,
      totalSubmissions: challenge.submissions.length,
      totalVotes: challenge.submissions.reduce(
        (sum, sub) => sum + sub.votes,
        0,
      ),
      isActive: challenge.status === 'Active',
      timeRemaining: challenge.endDate.getTime() - new Date().getTime(),
      winner: challenge.winnerID,
    };
  }

  async getUpcomingChallenges(): Promise<Challenge[]> {
    const now = new Date();
    return await this.challengeModel
      .find({
        startDate: { $gt: now },
        status: 'Active',
      })
      .populate('participants', 'name profileImage')
      .sort({ startDate: 1 })
      .exec();
  }
}
