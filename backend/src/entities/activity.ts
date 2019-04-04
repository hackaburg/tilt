import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ActivityEvent } from "../../../types/activity";
import { User } from "./user";

@Entity()
export class Activity {
  @PrimaryGeneratedColumn()
  public id!: number;

  @OneToOne(() => User)
  @JoinColumn()
  public user!: User;

  @Column()
  public event!: ActivityEvent;

  @Column()
  public timestamp!: Date;

  @Column({ nullable: true, default: null })
  public data!: string;
}
