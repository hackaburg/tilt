import * as React from "react";
import { Button } from "../base/button";
import { useApi } from "../../hooks/use-api";
import { useLoginContext } from "../../contexts/login-context";
import { TeamResponseDTO } from "../../api/types/dto";
import { useNotificationContext } from "../../contexts/notification-context";

/**
 * If the user is not already in the team, render a button to join the team.
 */
export const JoinTeamButton = ({ team }: { team: TeamResponseDTO }) => {
  const loginState = useLoginContext();
  const { user, updateUser } = loginState;
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
        await updateUser(() => ({
          ...user,
          teamRequest: team,
        }));
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

  const inTeam = team?.users.some(({ id }) => id === user?.id);
  // Depending on which object is more up to date.
  const hasRequested =
    team?.requests.some(({ id }) => id === user?.id) ||
    user.teamRequest?.id === team.id;

  console.log("jsdlkfaj", user);

  if (!isTeamOwner && !inTeam && !hasRequested) {
    return (
      <Button onClick={sendRequestToJoin} primary={true}>
        Request to join
      </Button>
    );
  }

  if (hasRequested) {
    return "You requested to join this team";
  }
};
