import { Column, Entity, ManyToOne } from "typeorm";
import { ICountryQuestion, QuestionType } from "../../../types/questions";
import { FormSettings } from "./form-settings";
import { QuestionBase } from "./question-base";

@Entity()
export class CountryQuestion extends QuestionBase implements ICountryQuestion {
  @ManyToOne(() => FormSettings)
  public form!: FormSettings;

  @Column()
  public type: QuestionType.Country = QuestionType.Country;
}
