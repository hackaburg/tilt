import { Exclude, Expose } from "class-transformer";
import { IsArray, IsOptional, IsString, MinLength } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IQuestion, ISortable, QuestionType } from "../../../types/questions";
import { IFormSettings } from "../../../types/settings";
import { enforceExhaustiveSwitch } from "../utils/switch";
import { ArrayType } from "../validation/polymorphism";
import { ChoicesQuestion } from "./choices-question";
import { CountryQuestion } from "./country-question";
import { NumberQuestion } from "./number-question";
import { TextQuestion } from "./text-question";

@Entity()
export class FormSettings implements IFormSettings {
  constructor(initializeDefaults?: boolean) {
    if (initializeDefaults) {
      this.title = "Form";
    }
  }

  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @Column()
  public title!: string;

  @Exclude()
  @OneToMany(() => ChoicesQuestion, (question) => question.form, {
    cascade: true,
    eager: true,
  })
  private choices!: ChoicesQuestion[];

  @Exclude()
  @OneToMany(() => CountryQuestion, (question) => question.form, {
    cascade: true,
    eager: true,
  })
  private countries!: CountryQuestion[];

  @Exclude()
  @OneToMany(() => NumberQuestion, (question) => question.form, {
    cascade: true,
    eager: true,
  })
  private numbers!: NumberQuestion[];

  @Exclude()
  @OneToMany(() => TextQuestion, (question) => question.form, {
    cascade: true,
    eager: true,
  })
  private texts!: TextQuestion[];

  @Expose()
  @IsArray()
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
  public get questions(): IQuestion[] {
    return [
      ...(this.choices || []),
      ...(this.countries || []),
      ...(this.numbers || []),
      ...(this.texts || []),
    ].sort((a, b) => a.sortIndex! - b.sortIndex!);
  }

  public set questions(questions: IQuestion[]) {
    const questionsWithIndex = (questions || []).map((question, index) => {
      (question as ISortable<IQuestion>).sortIndex = index;
      return question;
    });

    this.choices = questionsWithIndex.filter(
      ({ type }) => type === QuestionType.Choices,
    ) as ChoicesQuestion[];
    this.countries = questionsWithIndex.filter(
      ({ type }) => type === QuestionType.Country,
    ) as CountryQuestion[];
    this.numbers = questionsWithIndex.filter(
      ({ type }) => type === QuestionType.Number,
    ) as NumberQuestion[];
    this.texts = questionsWithIndex.filter(
      ({ type }) => type === QuestionType.Text,
    ) as TextQuestion[];
  }
}
