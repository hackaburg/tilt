import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer, StyleableFlexContainer } from "../base/flex";
import { Heading, Subheading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { TextInput, TextInputType } from "../base/text-input";
import { api, useApi } from "../../hooks/use-api";
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  InputLabel,
  TextField,
} from "@mui/material";
import { MdDeleteOutline } from "react-icons/md";
import { UserListDto } from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { useHistory } from "react-router-dom";
import { Message } from "../base/message";

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const EditTeam = () => {
  const loginState = useLoginContext();
  const { user } = loginState;
  const params = new URLSearchParams(document.location.search);

  const { value: teamById } = useApi(
    async (apiClient) => apiClient.getTeamByID(Number(params.get("id"))),
    [],
  );

  const [currentUserId, setCurrentUserId] = React.useState(0);
  const [editable, setEditable] = React.useState(false);
  const [isTeamMember, setIsTeamMember] = React.useState(false);
  const [id, setId] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [desciption, setDescription] = React.useState("");
  const [teamImg, setTeamImg] = React.useState("");
  const [users, setUsers] = React.useState([] as UserListDto[]);
  const [request, setRequest] = React.useState([] as UserListDto[]);

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
          desciption,
          teamImg,
          users.map((u) => u.id),
        );
        return true;
      }
      return false;
    },
    [currentUserId, editable, id, title, desciption, teamImg, users, request],
  );

  const {
    value: didSendRequestToJoin,
    forcePerformRequest: sendRequestToJoin,
  } = useApi(async (apiClient, wasTriggeredManually) => {
    if (wasTriggeredManually) {
      await apiClient.requestToJoinTeam(Number(params.get("id")));
      return true;
    }
    return false;
  }, []);

  async function acceptUserToTeam(userId: number) {
    await api.acceptUserToTeam(
      Number(params.get("id")),
      request.find((u) => u.id === userId)!.id,
    );
    history.go(0);
  }

  const {
    value: didDelete,
    isFetching: deleteInProgress,
    error: deleteError,
    forcePerformRequest: deleteGroup,
  } = useApi(async (apiClient, wasTriggeredManually) => {
    if (wasTriggeredManually) {
      if (confirm("Are you sure you want to delete this team?")) {
        await apiClient.deleteTeam(Number(params.get("id")));
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

  if (updateTeamDone || didSendRequestToJoin) {
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
    if (teamById) {
      setCurrentUserId(Number(params.get("id")));
      setId(teamById.id);
      setTitle(teamById.title);
      setDescription(teamById.description);
      setTeamImg(teamById.teamImg);
      setUsers(teamById.users!);
      setRequest(teamById.requests!);
      setEditable(user?.id === Number(teamById?.users![0].id));
      setIsTeamMember(teamById.users!.some((u) => u.id === user?.id));
    }
  }, [teamById]);

  function notInUserList() {
    return (
      !users.some((u) => u.id === user?.id) &&
      !request.some((u) => u.id === user?.id)
    );
  }

  return (
    <Page>
      <HeaderContainer>
        <Heading text={`Edit Team - ${teamById?.title}`} />

        <NonGrowingFlexContainer>
          <a style={{ width: "15rem", marginTop: "1rem" }}>
            {isTeamMember ? (
              <Button
                loading={updateTeamInProgress}
                disable={updateTeamInProgress}
                onClick={sendSaveTeamRequest}
                primary={true}
              >
                Save Changes
              </Button>
            ) : null}
            {!editable && notInUserList() ? (
              <Button onClick={sendRequestToJoin} primary={true}>
                Request to join team
              </Button>
            ) : null}
          </a>
        </NonGrowingFlexContainer>
      </HeaderContainer>
      {!isTeamMember ? null : (
        <Subheading text={"You are part of this team"}></Subheading>
      )}
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        {updateTeamError && (
          <Message type="error">
            <b>Update Team Error: </b> {updateTeamError.message}
          </Message>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
        <TextInput
          title="Team Title"
          placeholder="Your team name"
          value={title}
          onChange={(value) => setTitle(value)}
          type={TextInputType.Text}
          isDisabled={!isTeamMember}
        />
        <TextInput
          title="Team Description"
          placeholder="Your team description (maybe also add the communication channel e.g. Discord, Signal, WhatsApp, etc. may add a link to the channel)"
          value={desciption}
          onChange={(value) => setDescription(value)}
          type={TextInputType.Area}
          isDisabled={!isTeamMember}
        />
        <div>
          <TextInput
            title="Team Image (URL; imgsize: 200x300px)"
            placeholder="Your team image"
            value={teamImg}
            onChange={(value) => setTeamImg(value)}
            type={TextInputType.Text}
            isDisabled={!isTeamMember}
          />
          {teamImg !== "" ? (
            <img src={teamImg} style={{ width: "200px", height: "200px" }} />
          ) : null}
        </div>
        <div style={{ width: "100%", marginTop: "1rem" }}>
          <InputLabel
            style={{
              fontWeight: "bold",
              color: "black",
              marginBottom: "0.5rem",
            }}
            id="demo-multiple-name-label"
          >
            Team Members (can only be changed by the team owner)
          </InputLabel>
          <div style={{ marginTop: "1.5rem" }}>
            {users.map((singleUser, index) => (
              <div key={index} style={{ display: "flex" }}>
                <Autocomplete
                  freeSolo
                  style={{
                    width: index === 0 || !editable ? "100%" : "90%",
                    marginBottom: "1rem",
                  }}
                  disabled={!editable}
                  value={singleUser}
                  options={userList}
                  getOptionLabel={(option) =>
                    typeof option === "string" ? option : option.name
                  }
                  renderInput={(paramsAuto) => (
                    <TextField
                      {...paramsAuto}
                      sx={{
                        background:
                          singleUser.id === currentUserId ? "#3fb28f" : "white",
                      }}
                      label={index === 0 ? "Team Owner" : "Users"}
                      disabled={index === 0 || !editable}
                    />
                  )}
                  renderOption={(props, option, _state, ownerState) => (
                    <Box
                      sx={{
                        borderRadius: "8px",
                        margin: "5px",
                        padding: "5px",
                      }}
                      component="li"
                      {...props}
                      aria-disabled={alreadyInList(option)}
                    >
                      {ownerState.getOptionLabel(option)}{" "}
                      {alreadyInList(option) ? " - already a member" : ""}
                    </Box>
                  )}
                  onChange={(_e, v) => onChange(index, v as UserListDto)}
                />
                {index === 0 || !editable ? null : (
                  <MdDeleteOutline
                    size={30}
                    style={{
                      marginLeft: "2rem",
                      marginTop: "0.75rem",
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      const newUsers = [...users];
                      newUsers.splice(index, 1);
                      setUsers(newUsers);
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {editable ? (
            <div>
              <div style={{ marginTop: "1rem", width: "10rem" }}>
                <Button onClick={addMember} primary={true}>
                  Add member
                </Button>
              </div>
            </div>
          ) : null}
        </div>
        {request.length > 0 ? (
          <div>
            <InputLabel
              style={{
                fontWeight: "bold",
                color: "black",
                marginBottom: "0.5rem",
                marginTop: "2rem",
              }}
              id="demo-multiple-name-label"
            >
              These users requested to join this team (can only be changed by
              the team owner)
            </InputLabel>
            {request.map((r, index) => (
              <div key={index} style={{ display: "flex" }}>
                <TextField
                  label="Users"
                  value={r.name}
                  disabled
                  style={{ width: "90%" }}
                />
                <div
                  style={{
                    width: "10rem",
                    marginLeft: "1rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {!editable ? null : (
                    <Button
                      loading={updateTeamInProgress}
                      disable={updateTeamInProgress}
                      onClick={async () => {
                        await acceptUserToTeam(r.id);
                      }}
                      primary={true}
                    >
                      Add to Team
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {editable ? (
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
                    onClick={deleteGroup}
                    primary={true}
                    color="error"
                  >
                    Delete Group
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
