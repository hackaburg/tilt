import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { FormAnswers } from "./form-answers";
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
  @JoinColumn()
  public user!: User;
  @OneToOne(() => FormAnswers, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  public profileFormAnswers!: FormAnswers;
  @OneToOne(() => FormAnswers, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  public confirmationFormAnswers!: FormAnswers;
}
