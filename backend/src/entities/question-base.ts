import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, TableInheritance } from "typeorm";
import { IQuestionBase } from "../../../types/questions";
import { FormSettings } from "./form-settings";

@Entity()
@TableInheritance({ column: { name: "type", type: "varchar" } })
export abstract class QuestionBase implements IQuestionBase {
  @PrimaryGeneratedColumn()
  public id!: number;

  @ManyToOne(() => FormSettings)
  public form!: FormSettings;

  @Column()
  public description!: string;

  @Column()
  public title!: string;

  @Column()
  public mandatory!: boolean;

  @Column({ unique: true, nullable: true })
  public referenceName!: string;

  @Column()
  public parentReferenceName: string = "";

  @Column()
  public showIfParentHasValue: string = "";
}
