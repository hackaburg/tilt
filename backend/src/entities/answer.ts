import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question";
import { User } from "./user";

@Entity()
export class Answer {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @ManyToOne(() => User, { eager: true, onDelete: "CASCADE" })
  public user!: User;
  @ManyToOne(() => Question, { eager: true, onDelete: "CASCADE" })
  public question!: Question;
  @Column({ length: 1024 })
  public value!: string;
}
