import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Answer } from "./answer";
import { User } from "./user";

@Entity()
export class Application {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column({ default: null, type: "datetime" })
  public initialProfileFormSubmittedAt!: Date | null;
  @Column({ default: null, type: "datetime" })
  public confirmationExpiresAt!: Date | null;
  @JoinColumn()
  public user!: User;
  @OneToMany(() => Answer, (answer) => answer.application, {
    cascade: true,
    eager: true,
  })
  public answers!: Answer[];
}
