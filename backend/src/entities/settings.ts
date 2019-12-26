import { Exclude, Type } from "class-transformer";
import { ValidateNested } from "class-validator";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {
  IActivatable,
  IEmailSettings,
  IFrontendSettings,
  ISettings,
} from "../../../types/settings";
import { ApplicationSettings } from "./application-settings";
import { EmailSettings } from "./email-settings";
import { FrontendSettings } from "./frontend-settings";

@Entity()
export class Settings implements IActivatable<ISettings> {
  @Exclude()
  @PrimaryGeneratedColumn()
  public id!: number;

  @ValidateNested()
  @Type(() => ApplicationSettings)
  @ManyToOne(() => ApplicationSettings, { cascade: true, eager: true })
  @JoinColumn()
  public application!: ApplicationSettings;

  @ValidateNested()
  @Type(() => FrontendSettings)
  @ManyToOne(() => FrontendSettings, { cascade: true, eager: true })
  @JoinColumn()
  public frontend!: IFrontendSettings;

  @ValidateNested()
  @Type(() => EmailSettings)
  @ManyToOne(() => EmailSettings, { cascade: true, eager: true })
  @JoinColumn()
  public email!: IEmailSettings;

  @Column()
  public active: boolean = true;
}
