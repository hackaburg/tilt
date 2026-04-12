import * as React from "react";
import { Subheading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { RoundedImage } from "../base/image";
import { Spacer } from "../base/flex";
import { TextInput, TextInputType } from "../base/text-input";
import { api, useApi } from "../../hooks/use-api";
import { Card, CardContent, TextField, Stack } from "@mui/material";
import { UserListDto, TeamResponseDTO } from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { useHistory } from "react-router-dom";
import { Message } from "../base/message";
import { UserRole } from "../../api/types/enums";
import { PageHeader } from "../base/page-header";
import { useNotificationContext } from "../../contexts/notification-context";
import { StackWithBorder } from "../base/stack-with-border";

const TeamMemberRequest = ({
  user,
  updateTeamInProgress,
  acceptUserToTeam,
}) => {
  return (
    <StackWithBorder text={user.firstName}>
      <Button
        loading={updateTeamInProgress}
        disable={updateTeamInProgress}
        onClick={() => {
          acceptUserToTeam(user);
        }}
        primary={true}
        style={{ minWidth: "150px" }}
      >
        Add to Team
      </Button>
    </StackWithBorder>
  );
};

// TODO types
const TeamMember = ({
  team,
  user,
  updateTeamInProgress,
  onSetOwner,
  onRemove,
}) => {
  const { user: loginStateUser } = useLoginContext();
  const loggedInAsAdmin = loginStateUser?.role === UserRole.Root;
  const loggedInAsOwner = loginStateUser?.id === team.owner?.id;
  const editAllowed = loggedInAsAdmin || loggedInAsOwner;

  const memberIsOwner = team.owner?.id === user.id;
  const thisIsYou = user.id === loginStateUser?.id;

  if (!editAllowed) {
    return (
      <p>
        {user.firstName}
        {memberIsOwner ? "(Owner)" : ""}
      </p>
    );
  }

  return (
    <StackWithBorder
      text={`${user.firstName}${thisIsYou ? " (This is you)" : ""}`}
    >
      <Button
        loading={updateTeamInProgress}
        disable={
          updateTeamInProgress || !editAllowed || (thisIsYou && memberIsOwner)
        }
        onClick={() => {
          onRemove(user);
        }}
        primary
        style={{ minWidth: "150px" }}
      >
        {thisIsYou ? "Leave" : "Remove"}
      </Button>
      {memberIsOwner ? (
        <Button disable style={{ minWidth: "150px" }}>
          Owner
        </Button>
      ) : (
        <Button
          loading={updateTeamInProgress}
          disable={updateTeamInProgress || !editAllowed}
          onClick={() => {
            onSetOwner(user);
          }}
          primary
          style={{ minWidth: "150px" }}
        >
          Make Owner
        </Button>
      )}
    </StackWithBorder>
  );
};

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const EditTeam = ({ team }: { team: TeamResponseDTO }) => {
  if (team == null) {
    return null;
  }

  const loginState = useLoginContext();
  const { user } = loginState;

  const { showNotification } = useNotificationContext();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState("");

  const isTeamOwner = team.owner?.id === user?.id;

  const {
    value: didUpdateTeam,
    isFetching: updateTeamInProgress,
    error: updateTeamError,
    forcePerformRequest: sendSaveTeamRequest,
  } = useApi(
    async (apiClient, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await apiClient.updateTeam({
          ...team,
          id: team.id,
          title,
          description,
          teamImg: image,
        });
        showNotification("Saved");
        return true;
      }
      return false;
    },
    [team, title, description],
  );

  const acceptUserToTeam = async (userToAccept: UserListDto) => {
    await api.acceptUserToTeam(team.id, userToAccept.id);
    // TODO tell parent to reload team instead of history.go(0)
    history.go(0);
    showNotification("Accepted user");
  };

  const removeUserFromTeam = async (userToRemove: UserListDto) => {
    await api.removeUserFromTeam(team.id, userToRemove.id);
    // TODO tell parent to reload team
    history.go(0);
    showNotification("Removed user");
  };

  const onSetOwner = async (newOwner: UserListDto) => {
    await api.setOwner(team.id, newOwner.id);
    // TODO tell parent to reload team
    history.go(0);
    showNotification("Changed owner");
  };

  const {
    value: didDelete,
    isFetching: deleteInProgress,
    error: deleteError,
    forcePerformRequest: deleteTeam,
  } = useApi(async (apiClient, wasTriggeredManually) => {
    if (wasTriggeredManually) {
      if (confirm("Are you sure you want to delete this team?")) {
        await apiClient.deleteTeam(team.id);
        return true;
      }
    }
    return false;
  }, []);

  const handleSubmit = React.useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  const updateTeamDone =
    Boolean(didUpdateTeam) && !updateTeamInProgress && !updateTeamError;

  const didDeleteDone = Boolean(didDelete) && !deleteInProgress && !deleteError;

  if (updateTeamDone) {
    const history = useHistory();
    history.go(0);
  }

  if (didDeleteDone) {
    const history = useHistory();
    history.push("/teams");
  }

  React.useEffect(() => {
    if (team) {
      setTitle(team.title);
      setDescription(team.description);
      setImage(team.teamImg);
    }
  }, [team]);

  const isAdmin = user?.role === UserRole.Root;

  return (
    <Page>
      <PageHeader
        pageTitle={`Edit Team - ${team.title}`}
        buttonText="Save Changes"
        buttonOnClick={sendSaveTeamRequest}
        buttonLoading={updateTeamInProgress}
        subTitle={isAdmin ? undefined : "You are part of this team"}
      />
      {updateTeamError && (
        <div style={{ marginBottom: "1rem" }}>
          <Message type="error">
            <b>Update Team Error: </b> {updateTeamError.message}
          </Message>
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <TextInput
          title="Team Title"
          placeholder="Your team name"
          value={title}
          onChange={(value) => setTitle(value)}
          type={TextInputType.Text}
        />
        <TextInput
          title="Team Description"
          placeholder="Your team description (maybe also add the communication channel e.g. Discord, Signal, WhatsApp, etc. may add a link to the channel)"
          value={description}
          onChange={(value) => setDescription(value)}
          type={TextInputType.Area}
        />
        <div>
          <TextInput
            title="Team Image (URL; imgsize: 200x300px)"
            placeholder="Your team image"
            value={image}
            onChange={(value) => setImage(value)}
            type={TextInputType.Text}
          />
          {image !== "" ? (
            <RoundedImage
              src={image}
              style={{ width: "200px", height: "200px" }}
            />
          ) : null}
        </div>

        <div style={{ width: "100%", marginTop: "4rem" }}>
          <h1>Team Members</h1>
          <div style={{ marginTop: "1.5rem" }}>
            {team.users.map((teamMember) => (
              <React.Fragment key={teamMember.id}>
                <TeamMember
                  team={team}
                  user={teamMember}
                  onRemove={removeUserFromTeam}
                  updateTeamInProgress={updateTeamInProgress}
                  onSetOwner={onSetOwner}
                />
              </React.Fragment>
            ))}
            {team.requests.length > 0 && <h3>Requests</h3>}
            {(isTeamOwner || isAdmin) &&
              team.requests.map((requestingUser) => (
                <React.Fragment key={requestingUser.id}>
                  <TeamMemberRequest
                    user={requestingUser}
                    acceptUserToTeam={acceptUserToTeam}
                    updateTeamInProgress={updateTeamInProgress}
                  />
                  <Spacer />
                </React.Fragment>
              ))}
          </div>
        </div>
        {isTeamOwner || isAdmin ? (
          <div style={{ marginTop: "4rem" }}>
            <Card variant="outlined" style={{ background: "#ffcdd2" }}>
              <CardContent>
                <Subheading text={"Danger Zone"} />
                <p>
                  Please be aware: if you delete a team it is gone. We will not
                  be able to recover it.
                </p>
                <div style={{ marginTop: "1rem", width: "15rem" }}>
                  <Button
                    loading={deleteInProgress}
                    disable={deleteInProgress}
                    onClick={deleteTeam}
                    primary={true}
                    color="error"
                  >
                    Delete team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </form>
    </Page>
  );
};
