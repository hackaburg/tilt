import * as React from "react";
import { FlexRowContainer, Spacer } from "../base/flex";
import { Page } from "./page";
import { Button } from "../base/button";
import { RoundedImage } from "../base/image";
import { useApi } from "../../hooks/use-api";
import { useLoginContext } from "../../contexts/login-context";
import { PageHeader } from "../base/page-header";
import { TeamResponseDTO } from "../../api/types/dto";
import { useNotificationContext } from "../../contexts/notification-context";

/**
 * A team view component. This is only displayed, if the user is not part
 * of the team.
 */
export const ReadOnlyTeam = ({ team }: { team: TeamResponseDTO }) => {
  const loginState = useLoginContext();
  const { user } = loginState;
  const params = new URLSearchParams(document.location.search);

  const [isTeamOwner, setIsTeamOwner] = React.useState(false);
  const [, setIsTeamMember] = React.useState(false);

  const { showNotification } = useNotificationContext();

  const { forcePerformRequest: sendRequestToJoin } = useApi(
    async (apiClient, wasTriggeredManually) => {
      if (!wasTriggeredManually) {
        return false;
      }

      try {
        await apiClient.requestToJoinTeam(Number(params.get("id")));
        showNotification("Request sent");
        return true;
      } catch (error) {
        if (error instanceof Error) {
          showNotification(error.message);
        }
      }
    },
    [],
  );

  React.useEffect(() => {
    if (team) {
      setIsTeamOwner(user?.id === Number(team?.users?.[0]?.id));
      setIsTeamMember(team.users?.some((u) => u.id === user?.id) ?? false);
    }
  }, [team, user?.id]);

  // When leaving a team, the parent component will reload team, and be more
  // up to date than user.
  const inTeam = team?.users.some(({ id }) => id === user?.id);
  const hasRequested = team?.requests.some(({ id }) => id === user?.id);

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
          {!isTeamOwner && !inTeam && !hasRequested ? (
            <div>
              <Button onClick={sendRequestToJoin} primary={true}>
                Request to join
              </Button>
            </div>
          ) : null}
          {hasRequested && "You requested to join this team"}
          <div style={{ marginTop: "1.5rem" }}>
            {team?.users?.map((singleUser, index) => (
              <div key={index} style={{ display: "flex" }}>
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
