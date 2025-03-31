import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

function Longtext() {
  // Sqlite doesn't support longtext. I hate this, but it is what it is if we want
  // to keep backend tests and prepare tilt for the upcoming Hackaburg as quickly
  // as possible.
  if (process.env.NODE_ENV === "test") {
    console.log("Using text instead of longtext for sqlite");
    return Column("text");
  }
  return Column("longtext");
}

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
