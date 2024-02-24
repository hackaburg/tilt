import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column({ length: 1024 })
  public title!: string;
  @Column("simple-array")
  public users!: Number[];
  @Column()
  public teamImg!: string;
  @Column("longtext")
  public description!: string;
  @Column("simple-array")
  public requests!: Number[];
}
