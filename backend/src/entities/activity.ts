import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActivityType } from "../../../types/activity";
import { IUser } from "../../../types/user";
import { User } from "./user";

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => User, (user) => user.activity)
  public user!: IUser;

  @Column()
  public type!: ActivityType;

  @Column()
  public timestamp!: Date;

  @Column("simple-json", { nullable: true, default: null })
  public data!: any;
}
