import { Exclude } from "class-transformer";
import { IsString } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IEmailTemplate } from "../../../types/settings";

@Entity()
export class EmailTemplate implements IEmailTemplate {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsString()
  @Column()
  public subject!: string;

  @IsString()
  @Column()
  public htmlTemplate!: string;

  @IsString()
  @Column()
  public textTemplate!: string;
}
