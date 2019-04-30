import { Type } from "class-transformer";
import { IsEmail, IsOptional, ValidateNested } from "class-validator";
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IEmailSettings, IEmailTemplate } from "../../../types/settings";
import { EmailTemplate } from "./email-template";

@Entity()
export class EmailSettings implements IEmailSettings {
  public constructor(initializeDefaults?: boolean) {
    if (initializeDefaults) {
      this.verifyEmail = new EmailTemplate(initializeDefaults);
      this.forgotPasswordEmail = new EmailTemplate(initializeDefaults);
      this.sender = "tilt@hackaburg.de";
    }
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @IsEmail()
  @Column()
  public sender!: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailTemplate)
  @OneToOne(() => EmailTemplate, { cascade: true, eager: true })
  @JoinColumn()
  public verifyEmail!: IEmailTemplate;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailTemplate)
  @OneToOne(() => EmailTemplate, { cascade: true, eager: true })
  @JoinColumn()
  public forgotPasswordEmail!: IEmailTemplate;
}
