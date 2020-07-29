import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FormAnswers } from "./form-answers";
import { Question } from "./question";

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @ManyToOne(() => FormAnswers)
  public form!: FormAnswers;
  @ManyToOne(() => Question, { cascade: true, eager: true })
  public question!: Question;
  @Column()
  public value!: string;
}
