import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { Criterion } from "./criterion";
import { Project } from "./project";
import { User } from "./user";

@Entity()
@Unique(["user", "project", "criterion"])
export class Rating {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @ManyToOne(() => User, { eager: true, onDelete: "SET NULL" })
  public user!: User;
  @ManyToOne(() => Project, { eager: true, onDelete: "CASCADE" })
  public project!: Project;
  @ManyToOne(() => Criterion, { eager: true, onDelete: "CASCADE" })
  public criterion!: Criterion;
  @Column()
  // 1 - 5
  public rating!: number;
}
