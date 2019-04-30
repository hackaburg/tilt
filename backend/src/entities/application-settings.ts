import { Type } from "class-transformer";
import { IsDate, IsNumber, IsOptional, IsPositive, ValidateNested } from "class-validator";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { IApplicationSettings, IFormSettings } from "../../../types/settings";
import { FormSettings } from "./form-settings";

@Entity()
export class ApplicationSettings implements IApplicationSettings {
  constructor(initializeDefaults?: boolean) {
    if (initializeDefaults) {
      this.profileForm = new FormSettings(initializeDefaults);
      this.confirmationForm = new FormSettings(initializeDefaults);

      this.allowProfileFormFrom = new Date();
      this.allowProfileFormUntil = new Date();
      this.hoursToConfirm = 24;
    }
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormSettings)
  @ManyToOne(() => FormSettings, { cascade: true, eager: true })
  public profileForm!: IFormSettings;

  @IsOptional()
  @ValidateNested()
  @Type(() => FormSettings)
  @ManyToOne(() => FormSettings, { cascade: true, eager: true })
  public confirmationForm!: IFormSettings;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Column()
  public allowProfileFormFrom!: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  @Column()
  public allowProfileFormUntil!: Date;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Column()
  public hoursToConfirm!: number;
}
