import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Longtext } from "./longtext";

@Entity()
export class Criteria {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column({ length: 1024 })
  public title!: string;
  @Longtext()
  public description!: string;
}
