import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { IApplicationSettings, IFormSettings } from "../../../types/settings";
import { FormSettings } from "./form-settings";

@Entity()
export class ApplicationSettings implements IApplicationSettings {
  constructor() {
    this.profileForm = new FormSettings();
    this.confirmationForm = new FormSettings();

    this.allowProfileFormFrom = new Date();
    this.allowProfileFormUntil = new Date();
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @OneToOne(() => FormSettings, { cascade: true, eager: true })
  @JoinColumn()
  public profileForm: IFormSettings;

  @OneToOne(() => FormSettings, { cascade: true, eager: true })
  @JoinColumn()
  public confirmationForm: IFormSettings;

  @Column()
  public allowProfileFormFrom: Date;

  @Column()
  public allowProfileFormUntil: Date;

  @Column()
  public hoursToConfirm: number = 24;
}
