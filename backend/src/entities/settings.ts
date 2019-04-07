import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { ISettings } from "../../../types/settings";
import { FrontendSettings } from "./frontend-settings";

@Entity()
export class Settings implements ISettings {
  public constructor() {
    this.frontend = new FrontendSettings();
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @OneToOne(() => FrontendSettings, { cascade: true })
  @JoinColumn()
  public frontend!: FrontendSettings;
}
