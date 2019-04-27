export const enum QuestionType {
  Text = "text",
  Number = "number",
  Choices = "choices",
  Country = "country",
}

export interface IQuestionBase {
  description: string;
  title: string;
  mandatory: boolean;
  referenceName?: string;
  parentQuestionReferenceName?: string;
  showIfParentQuestionHasValue?: string;
}

export interface ITextQuestion extends IQuestionBase {
  type: QuestionType.Text;
  placeholder: string;
  multiline: boolean;
}

export interface INumberQuestion extends IQuestionBase {
  type: QuestionType.Number;
  placeholder: string;
  minValue?: number;
  maxValue?: number;
  allowDecimals: boolean;
}

export interface IChoicesQuestion extends IQuestionBase {
  type: QuestionType.Choices;
  choices: string[];
  allowMultiple: boolean;
  displayAsDropdown: boolean;
}

export interface ICountryQuestion extends IQuestionBase {
  type: QuestionType.Country;
}

export type IQuestion = ITextQuestion | INumberQuestion | IChoicesQuestion | ICountryQuestion;
