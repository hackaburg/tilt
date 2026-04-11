import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { UserRole } from "./user-role";
import { Team } from "./team";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @CreateDateColumn()
  public readonly createdAt!: Date;
  @UpdateDateColumn()
  public readonly updatedAt!: Date;
  @Column()
  public firstName!: string;
  @Column()
  public lastName!: string;
  @Column({ unique: true })
  public email!: string;
  @Column({ select: false })
  public password!: string;
  @Column()
  public tokenSecret!: string;
  @Column()
  public verifyToken!: string;
  @Column()
  public forgotPasswordToken!: string;
  @Column()
  public role!: UserRole;
  @Column({ default: null, type: "datetime" })
  public initialProfileFormSubmittedAt!: Date | null;
  @Column({ default: null, type: "datetime" })
  public confirmationExpiresAt!: Date | null;
  @Column({ default: false })
  public profileSubmitted!: boolean;
  @Column({ default: false })
  public admitted!: boolean;
  @Column({ default: false })
  public confirmed!: boolean;
  @Column({ default: false })
  public declined!: boolean;
  @Column({ default: false })
  public checkedIn!: boolean;
  @ManyToOne(() => Team, (team) => team.requests, { nullable: true, eager: true })
  public teamRequest: Team | null = null;
  @ManyToOne(() => Team, (team) => team.users, { nullable: true, eager: true })
  public team: Team | null = null;
}
