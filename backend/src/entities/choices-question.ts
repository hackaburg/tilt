import { ChildEntity, Column } from "typeorm";
import { IChoicesQuestion, QuestionType } from "../../../types/questions";
import { Question } from "./question";

@ChildEntity(QuestionType.Choices)
export class ChoicesQuestion extends Question implements IChoicesQuestion {
  public type: QuestionType.Choices = QuestionType.Choices;

  @Column("simple-json")
  public choices!: string[];

  @Column()
  public allowMultiple!: boolean;

  @Column()
  public displayAsDropdown!: boolean;
}
