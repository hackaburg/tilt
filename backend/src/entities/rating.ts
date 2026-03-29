import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Criteria } from "./criteria";
import { Project } from "./project";
import { User } from "./user";

@Entity()
@Unique(["user", "project", "critera"])
export class Rating {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @ManyToOne(() => User, { eager: true })
  public user!: User;
  @ManyToOne(() => Project, { eager: true })
  public project!: Project;
  @ManyToOne(() => Criteria, { eager: true })
  public critera!: Criteria;
  @Column()
  // 1 - 5
  public rating!: number;
}
