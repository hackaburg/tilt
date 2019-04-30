import { Type } from "class-transformer";
import { IsEmail, IsOptional, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IEmailSettings } from "../../../types/settings";
import { EmailTemplate } from "./email-template";

@Entity()
export class EmailSettings implements IEmailSettings {
  public constructor() {
    this.verifyEmail = new EmailTemplate();
    this.forgotPasswordEmail = new EmailTemplate();
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @IsEmail()
  @Column()
  public sender: string = "tilt@hackaburg.de";

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailTemplate)
  @OneToOne(() => EmailTemplate, { cascade: true, eager: true })
  @JoinColumn()
  public verifyEmail: EmailTemplate;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailTemplate)
  @OneToOne(() => EmailTemplate, { cascade: true, eager: true })
  @JoinColumn()
  public forgotPasswordEmail: EmailTemplate;
}
