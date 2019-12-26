import { ChildEntity } from "typeorm";
import { ICountryQuestion, QuestionType } from "../../../types/questions";
import { Question } from "./question";

@ChildEntity(QuestionType.Country)
export class CountryQuestion extends Question implements ICountryQuestion {
  public type: QuestionType.Country = QuestionType.Country;
}
