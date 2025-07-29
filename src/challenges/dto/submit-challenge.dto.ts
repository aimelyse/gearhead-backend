import { IsString } from 'class-validator';

export class SubmitChallengeDto {
  @IsString()
  imageURL: string;
}
