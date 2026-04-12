import * as React from "react";
import { Subheading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { RoundedImage } from "../base/image";
import { Spacer } from "../base/flex";
import { TextInput, TextInputType } from "../base/text-input";
import { api, useApi } from "../../hooks/use-api";
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  InputLabel,
  TextField,
  Stack,
} from "@mui/material";
import { MdDeleteOutline } from "react-icons/md";
import { UserListDto, TeamResponseDTO } from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { useHistory } from "react-router-dom";
import { Message } from "../base/message";
import { UserRole } from "../../api/types/enums";
import { PageHeader } from "../base/page-header";
import { useNotificationContext } from "../../contexts/notification-context";

const TeamMemberRequest = ({ user, updateTeamInProgress, acceptUserToTeam }) => {
  return (
    <Stack direction={{ sm: "column", md: "row" }} spacing={{ xs: 1, sm: 2 }}>
      <TextField
        label={user.name}
        value={user.name}
        disabled
        style={{ width: "90%" }}
      />
      <Button
        loading={updateTeamInProgress}
        disable={updateTeamInProgress}
        onClick={() => { acceptUserToTeam(user) }}
        primary={true}
      >
        Add to Team
      </Button>
    </Stack>
  )
};

const TeamMember = ({ user, updateTeamInProgress, onRemove }) => {
  return (
    <Stack direction={{ sm: "column", md: "row" }} spacing={{ xs: 1, sm: 2 }}>
      <TextField
        label={JSON.stringify(user)}
        value={user.name}
        disabled
        style={{ width: "90%" }}
      />
      <Button
        loading={updateTeamInProgress}
        disable={updateTeamInProgress}
        onClick={() => { onRemove(user) }}
        primary={true}
      >
        Remove
      </Button>
    </Stack>
  )
};

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const EditTeam = ({ team }: { team: TeamResponseDTO }) => {
  const loginState = useLoginContext();
  const { user } = loginState;

  const { showNotification } = useNotificationContext();

  const [currentUserId, setCurrentUserId] = React.useState(0);
  const [isTeamOwner, setIsTeamOwner] = React.useState(false);
  const [, setIsTeamMember] = React.useState(false);
  const [id, setId] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState("");
  const [users, setUsers] = React.useState([] as UserListDto[]);
  const [requests, setRequests] = React.useState([] as UserListDto[]);

  const {
    value: didUpdateTeam,
    isFetching: updateTeamInProgress,
    error: updateTeamError,
    forcePerformRequest: sendSaveTeamRequest,
  } = useApi(
    async (apiClient, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await apiClient.updateTeam(
          id,
          title,
          description,
          image,
        );
        showNotification("Saved");
        return true;
      }
      return false;
    },
    [currentUserId, isTeamOwner, id, title, description, image, users, requests],
  );

  const acceptUserToTeam = async (user) => {
    await api.acceptUserToTeam(
      team.id,
      user.id,
    );
    // TODO tell parent to reload team instead of history.go(0)
    history.go(0);
    showNotification("Accepted user");
  }

  const removeUserFromTeam = async (user) => {
    await api.removeUserFromTeam(
      team.id,
      user.id,
    );
    // TODO tell parent to reload team
    history.go(0);
    showNotification("Removed user");
  }

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

  const { value: allUsers } = useApi(
    async (apiClient) => apiClient.getAllUsers(),
    [],
  );

  const userList = allUsers ?? [];

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

  function addMember() {
    setUsers([...users, { id: 0, name: "" }]);
  }

  function onChange(index: number, value: UserListDto) {
    setUsers((uList) => {
      const newUsers = [...uList];
      newUsers[index] = value;
      return newUsers;
    });
  }

  function alreadyInList(singleUser: UserListDto) {
    return users.some((u) => u.id === singleUser.id);
  }

  React.useEffect(() => {
    if (team) {
      setCurrentUserId(team.id);
      setId(team.id);
      setTitle(team.title);
      setDescription(team.description);
      setImage(team.teamImg);
      setUsers(team.users!);
      setRequests(team.requests!);
      setIsTeamOwner(team.users.length > 0 && user?.id === team.users![0].id);
      setIsTeamMember(team.users.some((u) => u.id === user?.id));
    }
  }, [team]);

  const isAdmin = user?.role === UserRole.Root;

  console.log("team", team)

  return (
    <Page>
      <PageHeader
        pageTitle={`Edit Team - ${team?.title}`}
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
          <h1>
            Team Members
          </h1>
          TODO show users + users who requested and button to accept them
          TODO button to leave team (here and in read-only)
          <div style={{ marginTop: "1.5rem" }}>
            These users requested to join this team (can only be changed by
            the team owner)
            {team.requests.length > 0 && <h3>Requests</h3>}
            {(isTeamOwner || isAdmin) && team.requests.map((user) => (
              <React.Fragment key={user.id}>
                <TeamMemberRequest
                  user={user}
                  acceptUserToTeam={acceptUserToTeam}
                  updateTeamInProgress={updateTeamInProgress}
                />
                <Spacer />
              </React.Fragment>
            ))}
            {team.users.length > 0 && <h3>Users</h3>}
            {team.users.map((user) => (
              <React.Fragment key={user.id}>
                <TeamMember
                  user={user}
                  onRemove={removeUserFromTeam}
                  updateTeamInProgress={updateTeamInProgress}
                />
                <Spacer />
              </React.Fragment>
            ))}
          </div>
        </div>
        {(isTeamOwner || isAdmin) ? (
          <div style={{ marginTop: "2rem" }}>
            <Card variant="outlined" style={{ background: "#ffcdd2" }}>
              <CardContent>
                <Subheading text={"Danger Zone"} />
                <p>
                  Please be aware if you delete a team it is gone. We will not
                  recover it.
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
