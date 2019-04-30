import { Exclude, Expose } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IQuestion, ISortable, QuestionType } from "../../../types/questions";
import { IFormSettings } from "../../../types/settings";
import { ChoicesQuestion } from "./choices-question";
import { CountryQuestion } from "./country-question";
import { NumberQuestion } from "./number-question";
import { TextQuestion } from "./text-question";

@Entity()
export class FormSettings implements IFormSettings {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public title: string = "Form";

  @Exclude()
  @OneToMany(() => ChoicesQuestion, (question) => question.form, { cascade: true, eager: true })
  private choices!: ChoicesQuestion[];

  @Exclude()
  @OneToMany(() => CountryQuestion, (question) => question.form, { cascade: true, eager: true })
  private countries!: CountryQuestion[];

  @Exclude()
  @OneToMany(() => NumberQuestion, (question) => question.form, { cascade: true, eager: true })
  private numbers!: NumberQuestion[];

  @Exclude()
  @OneToMany(() => TextQuestion, (question) => question.form, { cascade: true, eager: true })
  private texts!: TextQuestion[];

  @Expose()
  public get questions(): Array<ISortable<IQuestion>> {
    return [
      ...(this.choices || []),
      ...(this.countries || []),
      ...(this.numbers || []),
      ...(this.texts || []),
    ].sort((a, b) => a.sortIndex! - b.sortIndex!);
  }

  public set questions(questions: Array<ISortable<IQuestion>>) {
    const questionsWithIndex = questions.map((question, index) => {
      question.sortIndex = index;
      return question;
    });

    this.choices = questionsWithIndex.filter(({ type }) => type === QuestionType.Choices) as ChoicesQuestion[];
    this.countries = questionsWithIndex.filter(({ type }) => type === QuestionType.Country) as CountryQuestion[];
    this.numbers = questionsWithIndex.filter(({ type }) => type === QuestionType.Number) as NumberQuestion[];
    this.texts = questionsWithIndex.filter(({ type }) => type === QuestionType.Text) as TextQuestion[];
  }
}
