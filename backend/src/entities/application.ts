import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Answer } from "./answer";
import { User } from "./user";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  public readonly id!: number;

  @CreateDateColumn()
  public readonly createdAt!: Date;

  @OneToOne(() => User)
  public user!: User;

  @ManyToOne(() => Answer)
  public profileAnswers!: Answer[];

  @ManyToOne(() => Answer)
  public confirmationAnswers!: Answer[];
}
