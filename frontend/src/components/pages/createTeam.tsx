import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { TextInput, TextInputType } from "../base/text-input";
import { useApi } from "../../hooks/use-api";
import { Redirect } from "react-router";
import { Routes } from "../../routes";
import { Autocomplete, Box, InputLabel, TextField } from "@mui/material";
import { MdDeleteOutline } from "react-icons/md";
import { UserListDto } from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { Message } from "../base/message";

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const CreateTeam = () => {
  const loginState = useLoginContext();
  const { user } = loginState;

  const [title, setTitle] = React.useState("");
  const [desciption, setDescription] = React.useState("");
  const [teamImg, setTeamImg] = React.useState("");
  const [users, setUsers] = React.useState([
    { id: user?.id, name: user?.firstName + " " + user?.lastName },
  ] as UserListDto[]);

  const {
    value: didCreateTeam,
    isFetching: createTeamInProgress,
    error: createTeamError,
    forcePerformRequest: sendCreateTeamRequest,
  } = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await api.createTeam(
          title,
          desciption,
          teamImg,
          users.map((u) => u.id),
        );
        return true;
      }
      return false;
    },
    [title, desciption, teamImg, users],
  );

  const { value: allUsers } = useApi(async (api) => api.getAllUsers(), []);

  const userList = allUsers ?? [];

  const handleSubmit = React.useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  const createTeamDone =
    Boolean(didCreateTeam) && !createTeamInProgress && !createTeamError;

  if (createTeamDone) {
    return <Redirect to={Routes.Teams} />;
  }

  function addMember() {
    setUsers([...users, { id: 0, name: "" }]);
  }

  function onChange(index: number, value: UserListDto) {
    setUsers((u) => {
      const newUsers = [...u];
      newUsers[index] = value;
      return newUsers;
    });
  }

  function alreadyInList(singleUser: UserListDto) {
    return users.some((u) => u.id === singleUser.id);
  }

  return (
    <Page>
      <HeaderContainer>
        <Heading text="Create New Team" />
        <NonGrowingFlexContainer>
          <a style={{ width: "15rem", marginTop: "1rem" }}>
            <Button
              loading={createTeamInProgress}
              disable={createTeamInProgress}
              onClick={sendCreateTeamRequest}
              primary={true}
            >
              Create
            </Button>
          </a>
        </NonGrowingFlexContainer>
      </HeaderContainer>
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        {createTeamError && (
          <Message type="error">
            <b>Create Team Error: </b> {createTeamError.message}
          </Message>
        )}
      </div>

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
          value={desciption}
          onChange={(value) => setDescription(value)}
          type={TextInputType.Area}
        />
        <TextInput
          title="Team Image (URL; imgsize: 200x300px); leave this field empty to get one of our cool animal images"
          placeholder="Your team image"
          value={teamImg}
          onChange={(value) => setTeamImg(value)}
          type={TextInputType.Text}
        />
        <div style={{ width: "100%" }}>
          <InputLabel
            style={{
              fontWeight: "bold",
              color: "black",
              marginBottom: "0.5rem",
            }}
            id="demo-multiple-name-label"
          >
            Select Team Members
          </InputLabel>
          {users.map((singleUser, index) => (
            <div key={index} style={{ display: "flex" }}>
              <Autocomplete
                freeSolo
                style={{
                  width: index === 0 ? "100%" : "90%",
                  marginBottom: "1rem",
                }}
                id="combo-box-demo"
                value={singleUser}
                options={userList}
                disabled={index === 0}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={index === 0 ? "Team Owner" : "Users"}
                    disabled={index === 0}
                  />
                )}
                renderOption={(props, option, state, ownerState) => (
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
              {index === 0 ? null : (
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

          <div style={{ marginTop: "1rem", width: "10rem" }}>
            <Button onClick={addMember} primary={true}>
              Add member
            </Button>
          </div>
        </div>
      </form>
    </Page>
  );
};
