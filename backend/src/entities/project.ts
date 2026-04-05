import { Column, Entity, OneToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";
import { Longtext } from "./longtext";
import { Team } from "./team";

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @OneToOne(() => Team, { eager: true })
  @JoinColumn()
  public team!: Team;
  @Column({ length: 1024 })
  public title!: string;
  @Longtext()
  public description!: string;
  @Column()
  public allowRating!: boolean;
}
