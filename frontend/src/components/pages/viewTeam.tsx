import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer, NonGrowingFlexContainer } from "../base/flex";
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

const HeaderContainer = styled(NonGrowingFlexContainer)`
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
  const [isTeamOwner, setIsTeamOwner] = React.useState(false);
  const [isTeamMember, setIsTeamMember] = React.useState(false);
  const [id, setId] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
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
          description,
          teamImg,
          users.map((u) => u.id),
        );
        return true;
      }
      return false;
    },
    [currentUserId, isTeamOwner, id, title, description, teamImg, users, request],
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
      setIsTeamOwner(user?.id === Number(teamById?.users![0].id));
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
        <Heading text={`${teamById?.title}`} />
      </HeaderContainer>
      {!isTeamMember ? null : (
        <Subheading text={"You are part of this team"}></Subheading>
      )}
      <div style={{ marginTop: "2rem" }}>
        <h3>{title}</h3>
        <p>{description}</p>
        <div>
          {teamImg !== "" ? (
            <img src={teamImg} style={{ width: "200px", height: "200px" }} />
          ) : null}
          {!isTeamOwner && notInUserList() ? (
            <Button onClick={sendRequestToJoin} primary={true}>
              Request to join
            </Button>
          ) : null}
        </div>

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
            {users.map((singleUser, index) => (
              <div key={index} style={{ display: "flex" }}>
                {singleUser}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Page>
  );
};
