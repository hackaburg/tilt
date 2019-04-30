import { Column, Entity, ManyToOne } from "typeorm";
import { IChoicesQuestion, QuestionType } from "../../../types/questions";
import { FormSettings } from "./form-settings";
import { QuestionBase } from "./question-base";

@Entity()
export class ChoicesQuestion extends QuestionBase implements IChoicesQuestion {
  @ManyToOne(() => FormSettings)
  public form!: FormSettings;

  @Column()
  public type: QuestionType.Choices = QuestionType.Choices;

  @Column("simple-json")
  public choices: string[] = [];

  @Column()
  public allowMultiple: boolean = false;

  @Column()
  public displayAsDropdown: boolean = false;
}
