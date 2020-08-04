import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserRole } from "./user-role";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @CreateDateColumn()
  public readonly createdAt!: Date;
  @UpdateDateColumn()
  public readonly updatedAt!: Date;
  @Column({ unique: true })
  public email!: string;
  @Column({ select: false })
  public password!: string;
  @Column()
  public verifyToken!: string;
  @Column()
  public role!: UserRole;
  @Column({ default: null, type: "datetime" })
  public initialProfileFormSubmittedAt!: Date | null;
  @Column({ default: null, type: "datetime" })
  public confirmationExpiresAt!: Date | null;
  @Column({ default: false })
  public admitted!: boolean;
  @Column({ default: false })
  public confirmed!: boolean;
}

/**
 * Removes all private fields from a given user.
 * @param user The user to clean
 */
export const deletePrivateUserFields = (user: User): User => {
  delete user.password;
  delete user.verifyToken;

  return user;
};
