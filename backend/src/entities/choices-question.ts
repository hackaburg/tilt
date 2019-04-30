import { Equals, IsArray, IsBoolean, IsOptional, IsString } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import { IChoicesQuestion, QuestionType } from "../../../types/questions";
import { FormSettings } from "./form-settings";
import { QuestionBase } from "./question-base";

@Entity()
export class ChoicesQuestion extends QuestionBase implements IChoicesQuestion {
  @ManyToOne(() => FormSettings)
  public form!: FormSettings;

  @Equals(QuestionType.Choices)
  @Column()
  public type: QuestionType.Choices = QuestionType.Choices;

  @IsArray()
  @IsString({ each: true })
  @Column("simple-json")
  public choices: string[] = [];

  @IsOptional()
  @IsBoolean()
  @Column()
  public allowMultiple: boolean = false;

  @IsOptional()
  @IsBoolean()
  @Column()
  public displayAsDropdown: boolean = false;
}
