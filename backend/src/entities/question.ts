import { Exclude } from "class-transformer";
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from "typeorm";
import { FormSettings } from "./form-settings";

@Entity()
@TableInheritance({ column: { type: "varchar", name: "_class" } })
export class Question {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public type!: string;

  @Column()
  public referenceName!: string;

  @Column()
  public description!: string;

  @Column()
  public title!: string;

  @Column()
  public mandatory!: boolean;

  @Column({ name: "parent" })
  public parentReferenceName!: string;

  @Column({ name: "parentValue" })
  public showIfParentHasValue!: string;

  @Exclude()
  @ManyToOne(() => FormSettings)
  public form!: FormSettings;
}
