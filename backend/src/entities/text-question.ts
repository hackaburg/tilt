import { IsBoolean, IsOptional, IsString } from "class-validator";
import { ChildEntity, Column } from "typeorm";
import { ITextQuestion, QuestionType } from "../../../types/questions";
import { Question } from "./question";

@ChildEntity(QuestionType.Text)
export class TextQuestion extends Question implements ITextQuestion {
  public type: QuestionType.Text = QuestionType.Text;

  @IsOptional()
  @IsString()
  @Column()
  public placeholder!: string;

  @IsOptional()
  @IsBoolean()
  @Column()
  public multiline!: boolean;

  @IsOptional()
  @IsBoolean()
  @Column()
  public convertAnswerToUrl!: boolean;
}
