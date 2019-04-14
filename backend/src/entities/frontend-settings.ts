import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IFrontendSettings } from "../../../types/settings";

@Entity()
export class FrontendSettings implements IFrontendSettings {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public colorGradientStart: string = "#53bd9a";

  @Column()
  public colorGradientEnd: string = "#56d175";

  @Column()
  public colorLink: string = "#007bff";

  @Column()
  public colorLinkHover: string = "#0056b3";

  @Column()
  public loginSignupImage: string = "http://placehold.it/300x300";

  @Column()
  public sidebarImage: string = "http://placehold.it/300x300";
}
