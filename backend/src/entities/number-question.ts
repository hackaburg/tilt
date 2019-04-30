import { Equals, IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";
import { Column, Entity, ManyToOne } from "typeorm";
import { INumberQuestion, QuestionType } from "../../../types/questions";
import { FormSettings } from "./form-settings";
import { QuestionBase } from "./question-base";

@Entity()
export class NumberQuestion extends QuestionBase implements INumberQuestion {
  constructor(initializeDefaults?: boolean) {
    super(initializeDefaults);

    if (initializeDefaults) {
      this.placeholder = "";
      this.allowDecimals = true;
    }
  }

  @ManyToOne(() => FormSettings)
  public form!: FormSettings;

  @Equals(QuestionType.Number)
  @Column()
  public type: QuestionType.Number = QuestionType.Number;

  @IsOptional()
  @IsString()
  @Column()
  public placeholder!: string;

  @IsOptional()
  @IsNumber()
  @Column({ nullable: true })
  public minValue?: number;

  @IsOptional()
  @IsNumber()
  @Column({ nullable: true })
  public maxValue?: number;

  @IsOptional()
  @IsBoolean()
  @Column()
  public allowDecimals!: boolean;
}
