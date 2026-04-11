import { Type } from "class-transformer";
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FormSettings } from "./form-settings";

// TODO all other settings are part of the settings table, whereas ApplicationSettings
//  is a separate table. Move into settings table just like EmailSettings.

@Entity()
export class ApplicationSettings {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Type(() => FormSettings)
  @OneToOne(() => FormSettings, { cascade: true, eager: true })
  @JoinColumn()
  public profileForm!: FormSettings;
  @Type(() => FormSettings)
  @OneToOne(() => FormSettings, { cascade: true, eager: true })
  @JoinColumn()
  public confirmationForm!: FormSettings;
  @Column()
  public allowProfileFormFrom!: Date;
  @Column()
  public allowProfileFormUntil!: Date;
  @Column()
  public hoursToConfirm!: number;
  @Column()
  public fillProfileFormFrom: Date;
  @Column()
  public fillProfileFormTo: Date;
  @Column()
  public acceptanceDeadline: Date;
  @Column()
  public confirmSpotUntil: Date;
}
