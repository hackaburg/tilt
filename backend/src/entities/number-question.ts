import { ChildEntity, Column } from "typeorm";
import { INumberQuestion, QuestionType } from "../../../types/questions";
import { Question } from "./question";

@ChildEntity(QuestionType.Number)
export class NumberQuestion extends Question implements INumberQuestion {
  public type: QuestionType.Number = QuestionType.Number;

  @Column()
  public placeholder!: string;

  @Column({ nullable: true })
  public minValue?: number;

  @Column({ nullable: true })
  public maxValue?: number;

  @Column()
  public allowDecimals!: boolean;
}
