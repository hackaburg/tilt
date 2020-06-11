import { Type } from "class-transformer";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Question } from "./question";

@Entity()
export class FormSettings {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column()
  public title!: string;
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
