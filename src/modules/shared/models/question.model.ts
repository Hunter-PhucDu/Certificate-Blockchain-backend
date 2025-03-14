import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PaginateModel } from 'mongoose';
import { Question, QuestionDocument } from '../schemas/question.schema';

@Injectable()
export class QuestionModel {
  constructor(@InjectModel(Question.name) public model: PaginateModel<QuestionDocument>) {}

  async save(question: Question) {
    const createdQuestion = new this.model(question);
    return createdQuestion.save();
  }
}
