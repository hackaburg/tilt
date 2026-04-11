import * as React from "react";
import { api } from "../../hooks/use-api";
import { TeamResponseDTO } from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { ReadOnlyTeam } from "./read-only-team";
import { UserRole } from "../../api/types/enums";
import { EditTeam } from "./edit-team";

/**
 * A gate component that checks if the current user is part of the team.
 * Renders the editor if user is a member, the viewer otherwise.
 */
export const ViewTeam = () => {
  const loginState = useLoginContext();
  const { user } = loginState;

  const [team, setTeam] = React.useState<TeamResponseDTO | null>(null);
  const params = new URLSearchParams(document.location.search);
  const teamId = Number(params.get("id"));
  React.useEffect(() => {
    api.getTeamByID(teamId).then((team_) => setTeam(team_));
  }, []);

  const isTeamMember = React.useMemo(() => {
    return team?.users?.some((u) => u.id === user?.id) ?? false;
  }, [team, user?.id]);

  const isAdmin = user?.role === UserRole.Root;

  if (!team) {
    return null;
  }

  return isTeamMember || isAdmin ? (
    <EditTeam team={team} />
  ) : (
    <ReadOnlyTeam team={team} />
  );
};
