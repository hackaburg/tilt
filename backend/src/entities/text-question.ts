import { Column, Entity, ManyToOne } from "typeorm";
import { ITextQuestion, QuestionType } from "../../../types/questions";
import { FormSettings } from "./form-settings";
import { QuestionBase } from "./question-base";

@Entity()
export class TextQuestion extends QuestionBase implements ITextQuestion {
  @ManyToOne(() => FormSettings)
  public form!: FormSettings;

  @Column()
  public type: QuestionType.Text = QuestionType.Text;

  @Column()
  public placeholder: string = "";

  @Column()
  public multiline: boolean = false;
}
