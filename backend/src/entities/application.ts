import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
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
  @Column({ default: null, type: "datetime" })
  public initialProfileFormSubmittedAt?: Date | null;
  @Column({ default: null, type: "datetime" })
  public confirmationExpiresAt?: Date | null;
  @OneToOne(() => User)
  @JoinColumn()
  public user!: User;
  @OneToMany(() => Answer, (answer) => answer.application, {
    cascade: true,
    eager: true,
  })
  public answers!: Answer[];
}
