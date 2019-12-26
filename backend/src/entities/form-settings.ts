import { Exclude, Expose } from "class-transformer";
import { IsString, MinLength, ValidateNested } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IQuestion, QuestionType } from "../../../types/questions";
import { IFormSettings } from "../../../types/settings";
import { enforceExhaustiveSwitch } from "../utils/switch";
import { ArrayType } from "../validation/polymorphism";
import { ChoicesQuestion } from "./choices-question";
import { CountryQuestion } from "./country-question";
import { NumberQuestion } from "./number-question";
import { Question } from "./question";
import { TextQuestion } from "./text-question";

@Entity()
export class FormSettings implements IFormSettings {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsString()
  @MinLength(1)
  @Column()
  public title!: string;

  @Expose()
  @ValidateNested()
  @ArrayType((values: IQuestion[]) =>
    values.map(({ type }) => {
      switch (type) {
        case QuestionType.Text:
          return TextQuestion;

        case QuestionType.Number:
          return NumberQuestion;

        case QuestionType.Choices:
          return ChoicesQuestion;

        case QuestionType.Country:
          return CountryQuestion;

        default:
          enforceExhaustiveSwitch(type);
          throw new TypeError("unknown question type");
      }
    }),
  )
  @OneToMany(() => Question, (question) => question.form, {
    cascade: true,
    eager: true,
  })
  public questions!: IQuestion[];
}
