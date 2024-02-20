import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer, StyleableFlexContainer } from "../base/flex";
import { Heading, Subheading, Subsubheading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { TextInput, TextInputType } from "../base/text-input";
import { useApi } from "../../hooks/use-api";
import { Redirect } from "react-router";
import { Routes } from "../../routes";
import {
  Autocomplete,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  InputLabel,
  TextField,
  Typography,
} from "@mui/material";
import { MdDeleteOutline } from "react-icons/md";
import { UserListDto } from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { create } from "domain";

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
  let editable = true;

  const { value: teamById } = useApi(
    async (api) => api.getTeamByID(Number(params.get("id"))),
    [],
  );

  const [title, setTitle] = React.useState("");
  const [desciption, setDescription] = React.useState("");
  const [teamImg, setTeamImg] = React.useState("");
  const [users, setUsers] = React.useState([] as UserListDto[]);

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
    setUsers((users) => {
      const newUsers = [...users];
      newUsers[index] = value;
      return newUsers;
    });
  }

  function alreadyInList(user: UserListDto) {
    return users.some((u) => u.id === user.id);
  }

  React.useEffect(() => {
    if (teamById) {
      setTitle(teamById.title);
      setDescription(teamById.description);
      setTeamImg(teamById.teamImg);
      setUsers(createUserArray());
      editable = user?.id === Number(teamById?.users![0]);
    }
  }, [teamById]);

  function createUserArray() {
    let userArray = [] as UserListDto[];
    teamById?.users!.forEach((u) => {
      let foundUser = userList.find((user) => user.id === Number(u));
      userArray.push(foundUser!);
    });
    console.log("userList", userList);
    console.log("userArray", userArray);
    return userArray;
  }

  return (
    <Page>
      <HeaderContainer>
        <Heading text={`Edit Team - ${teamById?.title}`} />

        <NonGrowingFlexContainer>
          <a style={{ width: "15rem", marginTop: "1rem" }}>
            {editable ? (
              <Button
                loading={createTeamInProgress}
                disable={createTeamInProgress}
                onClick={sendCreateTeamRequest}
                primary={true}
              >
                Save Changes
              </Button>
            ) : null}
          </a>
        </NonGrowingFlexContainer>
      </HeaderContainer>
      <Subheading
        text={"Please be aware that only owners can edit a team"}
      ></Subheading>
      <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
        <TextInput
          title="Team Title"
          placeholder="Your team name"
          value={title}
          onChange={(value) => setTitle(value)}
          type={TextInputType.Text}
          isDisabled={!editable}
        />
        <TextInput
          title="Team Description"
          placeholder="Your team description"
          value={desciption}
          onChange={(value) => setDescription(value)}
          type={TextInputType.Area}
          isDisabled={!editable}
        />
        <div>
          <TextInput
            title="Team Image (URL; imgsize: 200x200px)"
            placeholder="Your team image"
            value={teamImg}
            onChange={(value) => setTeamImg(value)}
            type={TextInputType.Area}
            isDisabled={!editable}
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
            Select Team Members
          </InputLabel>
          {users.map((user, index) => (
            <div key={index} style={{ display: "flex" }}>
              <Autocomplete
                freeSolo
                style={{
                  width: index === 0 || !editable ? "100%" : "90%",
                  marginBottom: "1rem",
                }}
                disabled={!editable}
                value={user}
                options={userList}
                getOptionLabel={(option) => option.name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={index === 0 ? "Team Owner" : "Users"}
                    disabled={index === 0 || !editable}
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

          {editable ? (
            <div>
              <div style={{ marginTop: "1rem", width: "10rem" }}>
                <Button onClick={addMember} primary={true}>
                  Add member
                </Button>
              </div>
              {/*  <Card style={{ marginTop: "1rem", backgroundColor: "#ffd4d4" }}>
                <CardActionArea>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary">
                      Danger Zone
                    </Typography>
                    <div style={{ marginTop: "1rem", width: "15rem" }}>
                      <Button color="red">Delete Group</Button>
                    </div>
                  </CardContent>
                </CardActionArea>
              </Card> */}
            </div>
          ) : null}
        </div>
      </form>
    </Page>
  );
};
