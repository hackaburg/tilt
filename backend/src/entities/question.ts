import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FormSettings } from "./form-settings";
import { QuestionType } from "./question-type";

/**
 * A text question.
 */
export interface ITextQuestionConfiguration {
  type: QuestionType.Text;
  placeholder: string;
  multiline: boolean;
  convertAnswerToUrl: boolean;
}

/**
 * A number question.
 */
export interface INumberQuestionConfiguration {
  type: QuestionType.Number;
  placeholder: string;
  minValue?: number;
  maxValue?: number;
  allowDecimals: boolean;
}

/**
 * A question with choices.
 */
export interface IChoicesQuestionConfiguration {
  type: QuestionType.Choices;
  choices: string[];
  allowMultiple: boolean;
  displayAsDropdown: boolean;
}

/**
 * A question with different countries.
 */
export interface ICountryQuestionConfiguration {
  type: QuestionType.Country;
}

/**
 * Union type for all known question configurations.
 */
export type IQuestionConfiguration =
  | ITextQuestionConfiguration
  | INumberQuestionConfiguration
  | IChoicesQuestionConfiguration
  | ICountryQuestionConfiguration;

@Entity()
export class Question<TQuestionConfiguration = IQuestionConfiguration> {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @CreateDateColumn()
  public readonly createdAt!: Date;
  @Column("simple-json")
  public configuration!: TQuestionConfiguration;
  @Column({ length: "1024" })
  public description!: string;
  @Column()
  public title!: string;
  @Column()
  public mandatory!: boolean;
  @Column({ default: null })
  public parentID?: number;
  @Column({ name: "parentValue", default: null })
  public showIfParentHasValue?: string;
  @ManyToOne(() => FormSettings)
  public readonly form!: FormSettings;
}
