import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Longtext } from "./longtext";

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column({ length: 1024 })
  public title!: string;
  @Column("simple-array")
  public users!: number[];
  @Column()
  public teamImg!: string;
  @Longtext()
  public description!: string;
  @Column("simple-array")
  public requests!: number[];
}
