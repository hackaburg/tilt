import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Longtext } from "./longtext";

@Entity()
export class Criterion {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column({ length: 1024 })
  public title!: string;
  @Longtext()
  public description!: string;
}
