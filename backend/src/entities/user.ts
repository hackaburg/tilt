import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * A user's role in tilt.
 */
export enum UserRole {
  /**
   * Superuser, can do everything.
   */
  Root = "root",
  /**
   * Slightly elevated user.
   */
  Moderator = "moderator",
  /**
   * Basic user.
   */
  User = "user",
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @CreateDateColumn()
  public createdAt!: Date;
  @UpdateDateColumn()
  public updatedAt!: Date;
  @Column({ unique: true })
  public email!: string;
  @Column({ select: false })
  public password!: string;
  @Column()
  public verifyToken!: string;
  @Column()
  public role!: UserRole;
  @Column()
  public admitted!: boolean;
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
