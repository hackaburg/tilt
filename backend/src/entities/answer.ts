import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Application } from "./application";
import { Question } from "./question";

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @ManyToOne(() => Application)
  public application!: Application;
  @ManyToOne(() => Question, { cascade: true, eager: true })
  public question!: Question;
  @Column()
  public value!: string;
}
