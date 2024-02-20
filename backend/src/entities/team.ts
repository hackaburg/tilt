import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column({ length: 1024 })
  public title!: string;
  @OneToMany(() => User, (user) => user.id)
  public users!: User[];
  @Column({ length: 1024 })
  public teamImg!: string;
  @Column({ length: 1024 })
  public description!: string;
}
