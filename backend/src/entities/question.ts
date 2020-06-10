import { Exclude } from "class-transformer";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IQuestionConfiguration } from "../../../types/questions";
import { FormSettings } from "./form-settings";

@Entity()
export class Question {
  @PrimaryGeneratedColumn()
  public readonly id!: number;

  @Column("simple-json")
  public configuration!: IQuestionConfiguration;

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
