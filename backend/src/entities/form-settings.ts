import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IQuestion } from "../../../types/questions";
import { IFormSettings } from "../../../types/settings";
import { QuestionBase } from "./question-base";

@Entity()
export class FormSettings implements IFormSettings {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public title: string = "Form";

  @OneToMany(() => QuestionBase, (question) => question.form, { cascade: true, eager: true })
  public questions!: IQuestion[];
}
