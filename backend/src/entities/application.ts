import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Answer } from "./answer";
import { User } from "./user";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @CreateDateColumn()
  public readonly createdAt!: Date;
  @UpdateDateColumn()
  public readonly updatedAt!: Date;
  @OneToOne(() => User)
  public user!: User;
  @ManyToOne(() => Answer)
  public profileAnswers!: Answer[];
  @ManyToOne(() => Answer)
  public confirmationAnswers!: Answer[];
}
