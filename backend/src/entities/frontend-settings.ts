import { IsOptional, IsString, IsUrl } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IFrontendSettings } from "../../../types/settings";

@Entity()
export class FrontendSettings implements IFrontendSettings {
  constructor(initializeDefaults?: boolean) {
    if (initializeDefaults) {
      this.colorGradientStart = "#53bd9a";
      this.colorGradientEnd = "#56d175";
      this.colorLink = "#007bff";
      this.colorLinkHover = "#0056b3";
      this.loginSignupImage = "http://placehold.it/300x300";
      this.sidebarImage = "http://placehold.it/300x300";
    }
  }

  @PrimaryGeneratedColumn()
  public id!: number;

  @IsOptional()
  @IsString()
  @Column()
  public colorGradientStart!: string;

  @IsOptional()
  @IsString()
  @Column()
  public colorGradientEnd!: string;

  @IsOptional()
  @IsString()
  @Column()
  public colorLink!: string;

  @IsOptional()
  @IsString()
  @Column()
  public colorLinkHover!: string;

  @IsOptional()
  @IsUrl()
  @Column()
  public loginSignupImage!: string;

  @IsOptional()
  @IsUrl()
  @Column()
  public sidebarImage!: string;
}
