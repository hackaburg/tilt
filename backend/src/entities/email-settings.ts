import { Exclude, Type } from "class-transformer";
import { IsEmail, ValidateNested } from "class-validator";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IEmailSettings, IEmailTemplate } from "../../../types/settings";
import { EmailTemplate } from "./email-template";

@Entity()
export class EmailSettings implements IEmailSettings {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsEmail()
  @Column()
  public sender!: string;

  @ValidateNested()
  @Type(() => EmailTemplate)
  @ManyToOne(() => EmailTemplate, { cascade: true, eager: true })
  @JoinColumn()
  public verifyEmail!: IEmailTemplate;

  @ValidateNested()
  @Type(() => EmailTemplate)
  @ManyToOne(() => EmailTemplate, { cascade: true, eager: true })
  @JoinColumn()
  public forgotPasswordEmail!: IEmailTemplate;
}
