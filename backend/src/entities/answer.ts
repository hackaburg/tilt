import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question";
import { User } from "./user";

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @ManyToOne(() => User, { eager: true })
  public user!: User;
  @ManyToOne(() => Question, { eager: true })
  public question!: Question;
  @Column()
  public value!: string;
}
