import { Exclude } from "class-transformer";
import { IsBoolean, IsOptional, IsString, MinLength } from "class-validator";
import { Column, PrimaryGeneratedColumn } from "typeorm";
import { IQuestionBase, ISortable } from "../../../types/questions";

export abstract class QuestionBase implements ISortable<IQuestionBase> {
  constructor(initializeDefaults?: boolean) {
    if (initializeDefaults) {
      this.referenceName = "";
      this.sortIndex = 0;
      this.description = "";
      this.title = "Question";
      this.mandatory = false;
      this.parentReferenceName = "";
      this.showIfParentHasValue = "";
    }
  }

  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsString()
  @MinLength(1)
  @Column()
  public referenceName!: string;

  @Exclude()
  @Column()
  public sortIndex!: number;

  @IsOptional()
  @IsString()
  @Column()
  public description!: string;

  @IsOptional()
  @IsString()
  @Column()
  public title!: string;

  @IsOptional()
  @IsBoolean()
  @Column()
  public mandatory!: boolean;

  @IsOptional()
  @IsString()
  @Column({ name: "parent" })
  public parentReferenceName!: string;

  @IsOptional()
  @IsString()
  @Column({ name: "parentValue" })
  public showIfParentHasValue!: string;
}
