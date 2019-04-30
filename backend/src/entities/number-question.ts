import { Column, Entity, ManyToOne } from "typeorm";
import { INumberQuestion, QuestionType } from "../../../types/questions";
import { FormSettings } from "./form-settings";
import { QuestionBase } from "./question-base";

@Entity()
export class NumberQuestion extends QuestionBase implements INumberQuestion {
  @ManyToOne(() => FormSettings)
  public form!: FormSettings;

  @Column()
  public type: QuestionType.Number = QuestionType.Number;

  @Column()
  public placeholder: string = "";

  @Column({ nullable: true })
  public minValue?: number;

  @Column({ nullable: true })
  public maxValue?: number;

  @Column()
  public allowDecimals: boolean = true;
}
