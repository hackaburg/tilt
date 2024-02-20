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
import {
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Theme,
  useTheme,
} from "@mui/material";
import { ReactNode } from "react-markdown";
import { MdDeleteOutline } from "react-icons/md";

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 350,
    },
  },
};

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const CreateTeam = () => {
  const [title, setTitle] = React.useState("");
  const [desciption, setDescription] = React.useState("");
  const [teamImg, setTeamImg] = React.useState("");
  const [users, setUsers] = React.useState(["Markus Guder"]);
  const theme = useTheme();

  const {
    value: didCreateTeam,
    isFetching: createTeamInProgress,
    error: createTeamError,
    forcePerformRequest: sendCreateTeamRequest,
  } = useApi(
    async (api, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await api.createTeam(title, desciption, teamImg, users);
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

  function handleChange(
    event: SelectChangeEvent<never[]>,
    child: ReactNode,
  ): void {
    throw new Error("Function not implemented.");
  }

  function addMember() {
    setUsers([...users, ""]);
  }

  function getStyles(name: string, personName: string[], theme: Theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
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
          placeholder="Your team description"
          value={desciption}
          onChange={(value) => setDescription(value)}
          type={TextInputType.Text}
        />
        <TextInput
          title="Team Image (URL; imgsize: 200x200px)"
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
          {users.map((user, index) => (
            <div key={index}>
              <Select
                style={{
                  width: index === 0 ? "100%" : "90%",
                  marginBottom: "1rem",
                }}
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                multiple
                value={users}
                onChange={handleChange}
                input={<OutlinedInput label="Name" />}
                MenuProps={MenuProps}
                disabled={index === 0}
              >
                {userList.map((user) => (
                  <MenuItem
                    key={user.id}
                    value={user.name}
                    style={getStyles(user.name, users, theme)}
                  >
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
              {index === 0 ? null : (
                <MdDeleteOutline
                  size={30}
                  style={{ marginLeft: "2rem", cursor: "pointer" }}
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
