import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IEmailSettings, IFrontendSettings, ISettings } from "../../../types/settings";
import { EmailSettings } from "./email-settings";
import { FrontendSettings } from "./frontend-settings";

@Entity()
export class Settings implements ISettings {
  public constructor() {
    this.frontend = new FrontendSettings();
    this.email = new EmailSettings();
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @OneToOne(() => FrontendSettings, { cascade: true, eager: true })
  @JoinColumn()
  public frontend: IFrontendSettings;

  @OneToOne(() => EmailSettings, { cascade: true, eager: true })
  @JoinColumn()
  public email: IEmailSettings;
}
