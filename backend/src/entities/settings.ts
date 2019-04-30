import { Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IApplicationSettings, IEmailSettings, IFrontendSettings, ISettings } from "../../../types/settings";
import { ApplicationSettings } from "./application-settings";
import { EmailSettings } from "./email-settings";
import { FrontendSettings } from "./frontend-settings";

@Entity()
export class Settings implements ISettings {
  public constructor() {
    this.application = new ApplicationSettings();
    this.frontend = new FrontendSettings();
    this.email = new EmailSettings();
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationSettings)
  @OneToOne(() => ApplicationSettings, { cascade: true, eager: true })
  @JoinColumn()
  public application: IApplicationSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => FrontendSettings)
  @OneToOne(() => FrontendSettings, { cascade: true, eager: true })
  @JoinColumn()
  public frontend: IFrontendSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailSettings)
  @OneToOne(() => EmailSettings, { cascade: true, eager: true })
  @JoinColumn()
  public email: IEmailSettings;
}
