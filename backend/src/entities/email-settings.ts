import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
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

  @OneToOne(() => EmailTemplate, { cascade: true, eager: true })
  @JoinColumn()
  public verifyEmail: EmailTemplate;

  @OneToOne(() => EmailTemplate, { cascade: true, eager: true })
  @JoinColumn()
  public forgotPasswordEmail: EmailTemplate;
}
