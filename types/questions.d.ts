export const enum QuestionType {
  Text = "text",
  Number = "number",
  Choices = "choices",
  Country = "country",
}

export interface ITextQuestionConfiguration {
  type: QuestionType.Text;
  placeholder: string;
  multiline: boolean;
  convertAnswerToUrl: boolean;
}

export interface INumberQuestionConfiguration {
  type: QuestionType.Number;
  placeholder: string;
  minValue?: number;
  maxValue?: number;
  allowDecimals: boolean;
}

export interface IChoicesQuestionConfiguration {
  type: QuestionType.Choices;
  choices: string[];
  allowMultiple: boolean;
  displayAsDropdown: boolean;
}

export interface ICountryQuestionConfiguration {
  type: QuestionType.Country;
}

export type IQuestionConfiguration =
  | ITextQuestionConfiguration
  | INumberQuestionConfiguration
  | IChoicesQuestionConfiguration
  | ICountryQuestionConfiguration;

export interface IQuestion<TConfiguration = IQuestionConfiguration> {
  description: string;
  title: string;
  mandatory: boolean;
  configuration: TConfiguration;
  referenceName: string;
  parentReferenceName?: string;
  showIfParentHasValue?: string;
}

export interface IAnswer {
  referenceName: string;
  value: string;
}
