import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Longtext } from "./longtext";

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column({ length: 1024 })
  public title!: string;
  // TODO many-to-many instead of simple-array (array of userId strings)
  @Column("simple-array")
  public users!: string[];
  @Column()
  public teamImg!: string;
  @Longtext()
  public description!: string;
  // TODO many-to-many instead of simple-array (array of userId strings)
  @Column("simple-array")
  public requests!: string[];
}
