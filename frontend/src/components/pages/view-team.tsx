import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer } from "../base/flex";
import { Heading, Subheading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { Divider } from "../base/divider";
import { useApi } from "../../hooks/use-api";
import { useLoginContext } from "../../contexts/login-context";
import { TeamDTO } from "../../api/types/dto";

const HeaderContainer = styled(NonGrowingFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

interface ViewTeamProps {
  team: TeamDTO;
}

/**
 * A team view component.
 */
export const ViewTeam = ({ team }: ViewTeamProps) => {
  const loginState = useLoginContext();
  const { user } = loginState;
  const params = new URLSearchParams(document.location.search);

  const [isTeamOwner, setIsTeamOwner] = React.useState(false);
  const [isTeamMember, setIsTeamMember] = React.useState(false);

  const {
    forcePerformRequest: sendRequestToJoin,
  } = useApi(async (apiClient, wasTriggeredManually) => {
    if (wasTriggeredManually) {
      await apiClient.requestToJoinTeam(Number(params.get("id")));
      return true;
    }
    return false;
  }, []);

  function notInUserList() {
    return (
      !team.users.some((u) => u.id === user?.id) &&
      !team.requests.some((u) => u.id === user?.id)
    );
  }

  React.useEffect(() => {
    setIsTeamOwner(user?.id === Number(team?.users![0].id));
    setIsTeamMember(team.users!.some((u) => u.id === user?.id));
  }, [team, user?.id]);

  return (
    <Page>
      <HeaderContainer>
        <Heading text={team?.title} />
      </HeaderContainer>
      <Divider />
      {!isTeamMember ? null : (
        <Subheading text={"You are part of this team"}></Subheading>
      )}
      <div style={{ marginTop: "2rem" }}>
        <p>{team?.description}</p>
        <div>
          {team?.teamImg !== "" ? (
            <img src={team?.teamImg} style={{ width: "200px", height: "200px" }} />
          ) : null}
        </div>

        {!isTeamOwner && notInUserList() ? (
          <Button onClick={sendRequestToJoin} primary={true}>
          Request to join
          </Button>
        ) : null}

        <div style={{ width: "100%", marginTop: "1rem" }}>
          <h3
            style={{
              fontWeight: "bold",
              color: "black",
              marginBottom: "0.5rem",
            }}
            id="demo-multiple-name-label"
          >
            Team Members
          </h3>
          <div style={{ marginTop: "1.5rem" }}>
            {team.users.map((singleUser, index) => (
              <div key={index} style={{ display: "flex" }}>
                {singleUser.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};
