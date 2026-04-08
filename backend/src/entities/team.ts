import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Longtext } from "./longtext";
import { User } from "./user";

@Entity()
export class Team {
  @PrimaryGeneratedColumn()
  public readonly id!: number;
  @Column({ length: 1024 })
  public title!: string;
  // TODO rename teamImg to image
  @Column()
  public teamImg!: string;
  @Longtext()
  public description!: string;
  @OneToMany(() => User, (user) => user.teamRequest)
  public requests!: User[];
  @OneToMany(() => User, (user) => user.team)
  public users!: User[];

  /**
   * List of user ids that are part of the team.
   */
  public userIds(): number[] {
    if (!this.users) {
      return [];
    }

    // TODO does this work?
    console.log("### users", this.users);

    return this.users.map(({ id }) => id);
  }

  /**
   * List of user ids that requested to join the team.
   */
  public requestUserIds(): number[] {
    if (!this.requests) {
      return [];
    }

    // TODO does this work?
    console.log("### requests", this.requests);

    return this.requests.map(({ id }) => id);
  }
}
