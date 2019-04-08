import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ISettings } from "../../../types/settings";
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

  @OneToOne(() => FrontendSettings, { cascade: true })
  @JoinColumn()
  public frontend!: FrontendSettings;

  @OneToOne(() => EmailSettings, { cascade: true })
  @JoinColumn()
  public email!: EmailSettings;
}
