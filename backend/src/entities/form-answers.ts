import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Answer } from "./answer";

@Entity()
export class FormAnswers {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @OneToMany(() => Answer, (answer) => answer.form, {
    cascade: true,
    eager: true,
  })
  public answers!: Answer[];
}
