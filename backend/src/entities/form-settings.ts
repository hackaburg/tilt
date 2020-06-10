import { Exclude, Expose, Type } from "class-transformer";
import { IsString, MinLength, ValidateNested } from "class-validator";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { IFormSettings } from "../../../types/settings";
import { Question } from "./question";

@Entity()
export class FormSettings implements IFormSettings {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsString()
  @MinLength(1)
  @Column()
  public title!: string;

  @Expose()
  @ValidateNested()
  @Type(() => Question)
  @OneToMany(
    () => Question,
    (question) => question.form,
    {
      cascade: true,
      eager: true,
    },
  )
  public questions!: Question[];
}
