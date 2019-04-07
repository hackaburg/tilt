import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { IFrontendSettings } from "../../../types/settings";

@Entity()
export class FrontendSettings implements IFrontendSettings {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public colorGradientStart: string = "green";

  @Column()
  public colorGradientEnd: string = "cyan";

  @Column()
  public loginImage: string = "http://placehold.it/300x300";

  @Column()
  public signupImage: string = "http://placehold.it/300x300";
}
