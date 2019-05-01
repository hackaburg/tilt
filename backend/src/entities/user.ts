import { Exclude } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../../../types/roles";
import { IUser } from "../../../types/user";
import { Activity } from "./activity";

@Entity()
export class User implements IUser {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsEmail()
  @Column({ unique: true })
  public email!: string;

  @Exclude({ toPlainOnly: true })
  @IsString()
  @MinLength(6)
  @Column({ select: false })
  public password!: string;

  @Exclude()
  @Column()
  public verifyToken!: string;

  @Exclude()
  @Column()
  public createdAt!: Date;

  @Exclude()
  @Column()
  public updatedAt!: Date;

  @Exclude()
  @OneToMany(() => Activity, (activity) => activity.user)
  public activity!: Activity[];

  @Exclude()
  @Column()
  public role!: UserRole;
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
