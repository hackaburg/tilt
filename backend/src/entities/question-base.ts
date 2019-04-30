import { Exclude } from "class-transformer";
import { Column, PrimaryGeneratedColumn } from "typeorm";
import { IQuestionBase, ISortable } from "../../../types/questions";

export abstract class QuestionBase implements ISortable<IQuestionBase> {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public referenceName!: string;

  @Exclude()
  @Column()
  public sortIndex: number = 0;

  @Column()
  public description: string = "";

  @Column()
  public title: string = "Question";

  @Column()
  public mandatory: boolean = false;

  @Column({ name: "parent" })
  public parentReferenceName: string = "";

  @Column({ name: "parentValue" })
  public showIfParentHasValue: string = "";
}
