import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Criteria } from "./criteria";
import { Project } from "./project";
import { User } from "./user";

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @OneToOne(() => User, { eager: true })
  public user!: User;
  @OneToOne(() => Project, { eager: true })
  public project!: Project;
  @OneToOne(() => Criteria, { eager: true })
  public critera!: Criteria;
  @Column()
  // 1 - 5
  public rating!: number;
}

// TODO mvp: only create ratings, no update and delete
