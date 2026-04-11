import * as React from "react";
import { Page } from "./page";
import { Button } from "../base/button";
import { TextInput, TextInputType } from "../base/text-input";
import { useApi } from "../../hooks/use-api";
import { Redirect } from "react-router";
import { Routes } from "../../routes";
import { Autocomplete, Box, InputLabel, TextField, Alert } from "@mui/material";
import { MdDeleteOutline } from "react-icons/md";
import { UserListDto } from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { Message } from "../base/message";
import { PageHeader } from "../base/page-header";

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const CreateTeam = () => {
  const loginState = useLoginContext();
  const { user } = loginState;

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [teamImg, setTeamImg] = React.useState("");

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
          description,
          teamImg,
        );
        return true;
      }
      return false;
    },
    [title, description, teamImg],
  );

  const handleSubmit = React.useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  const createTeamDone =
    Boolean(didCreateTeam) && !createTeamInProgress && !createTeamError;

  if (createTeamDone) {
    return <Redirect to={Routes.Teams} />;
  }

  if (user.team != null) {
    return (
      <Page>
        <PageHeader pageTitle="Create New Team"/>
        <Alert severity="error">You are already in a team</Alert>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        pageTitle="Create New Team"
        buttonText="Create"
        buttonOnClick={sendCreateTeamRequest}
        buttonLoading={createTeamInProgress}
      />
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
          value={description}
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
      </form>
    </Page>
  );
};
