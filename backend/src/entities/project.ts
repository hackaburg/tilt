import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from "typeorm";
import { Longtext } from "./longtext";
import { Team } from "./team";

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @ManyToOne(() => Team, { eager: true })
  @JoinColumn()
  public team!: Team;
  @Column({ length: 1024 })
  public title!: string;
  @Longtext()
  public description!: string;
  @Column()
  public allowRating!: boolean;
  @Column()
  public image: string = "";
}
