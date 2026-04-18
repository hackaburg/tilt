import * as React from "react";
import { FlexRowContainer, Spacer } from "../base/flex";
import { Page } from "./page";
import { RoundedImage } from "../base/image";
import { PageHeader } from "../base/page-header";
import { TeamResponseDTO } from "../../api/types/dto";
import { JoinTeamButton } from "./join-team-button";

/**
 * A team view component. This is only displayed, if the user is not part
 * of the team.
 */
export const ReadOnlyTeam = ({ team }: { team: TeamResponseDTO }) => {
  return (
    <Page>
      <PageHeader pageTitle={team?.title} />
      <div>
        <FlexRowContainer>
          <div>
            {team?.teamImg !== "" ? (
              <RoundedImage
                src={team?.teamImg}
                style={{ width: "200px", height: "200px" }}
              />
            ) : null}
          </div>
          <Spacer />
          <p>{team?.description}</p>
        </FlexRowContainer>
        <Spacer />
        <div style={{ width: "100%", marginTop: "4rem" }}>
          <h2>Team Members</h2>
          <JoinTeamButton team={team} />
          <div style={{ marginTop: "1.5rem" }}>
            {team?.users?.map((singleUser) => (
              <div key={singleUser.id} style={{ display: "flex" }}>
                {singleUser.firstName}{" "}
                {singleUser.id === team.owner?.id && " (Owner)"}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};
