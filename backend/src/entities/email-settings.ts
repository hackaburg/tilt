import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IEmailSettings } from "../../../types/settings";
import { EmailTemplates } from "./email-templates";

@Entity()
export class EmailSettings implements IEmailSettings {
  public constructor() {
    this.templates = new EmailTemplates();
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public sender: string = "tilt@localhost";

  @OneToOne(() => EmailTemplates, { cascade: true, eager: true })
  @JoinColumn()
  public templates: EmailTemplates;
}
