import { Equals, IsBoolean, IsOptional, IsString } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import { ITextQuestion, QuestionType } from "../../../types/questions";
import { FormSettings } from "./form-settings";
import { QuestionBase } from "./question-base";

@Entity()
export class TextQuestion extends QuestionBase implements ITextQuestion {
  @ManyToOne(() => FormSettings)
  public form!: FormSettings;

  @Equals(QuestionType.Text)
  @Column()
  public type: QuestionType.Text = QuestionType.Text;

  @IsOptional()
  @IsString()
  @Column()
  public placeholder: string = "";

  @IsOptional()
  @IsBoolean()
  @Column()
  public multiline: boolean = false;
}
