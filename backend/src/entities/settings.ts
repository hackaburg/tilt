import { Exclude, Type } from "class-transformer";
import { IsOptional, ValidateNested } from "class-validator";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  IActivatable,
  IApplicationSettings,
  IEmailSettings,
  IFrontendSettings,
  ISettings,
} from "../../../types/settings";
import { ApplicationSettings } from "./application-settings";
import { EmailSettings } from "./email-settings";
import { FrontendSettings } from "./frontend-settings";

@Entity()
export class Settings implements IActivatable<ISettings> {
  public constructor(initializeDefaults?: boolean) {
    if (initializeDefaults) {
      this.application = new ApplicationSettings(initializeDefaults);
      this.frontend = new FrontendSettings(initializeDefaults);
      this.email = new EmailSettings(initializeDefaults);
    }
  }

  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationSettings)
  @ManyToOne(() => ApplicationSettings, { cascade: true, eager: true })
  @JoinColumn()
  public application!: IApplicationSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => FrontendSettings)
  @ManyToOne(() => FrontendSettings, { cascade: true, eager: true })
  @JoinColumn()
  public frontend!: IFrontendSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => EmailSettings)
  @ManyToOne(() => EmailSettings, { cascade: true, eager: true })
  @JoinColumn()
  public email!: IEmailSettings;

  @Column()
  public active: boolean = true;
}
