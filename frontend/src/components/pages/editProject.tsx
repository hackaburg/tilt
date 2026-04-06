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
export const EditProject = () => {
  const loginState = useLoginContext();
  const { user } = loginState;
  const params = new URLSearchParams(document.location.search);

  const { value: projectById } = useApi(
    async (apiClient) => apiClient.getProjectByID(Number(params.get("id"))),
    [],
  );

  const [isTeamMember, setIsTeamMember] = React.useState(false);
  const [id, setId] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState("");

  const {
    value: didUpdateProject,
    isFetching: updateProjectInProgress,
    error: updateProjectError,
    forcePerformRequest: sendSaveProjectRequest,
  } = useApi(
    async (apiClient, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        console.log("Update", {
          title,
          description,
          image,
        })
        await apiClient.updateProject(
          id,
          {
            title,
            description,
            image,
          }
        );
        return true;
      }
      return false;
    },
    [id, title, description, image],
  );

  const { value: allUsers } = useApi(
    async (apiClient) => apiClient.getAllUsers(),
    [],
  );

  const handleSubmit = React.useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
  }, []);

  const updateProjectDone =
    Boolean(didUpdateProject) && !updateProjectInProgress && !updateProjectError;

  React.useEffect(() => {
    if (projectById) {
      setId(projectById.id);
      setTitle(projectById.title);
      setDescription(projectById.description);
      setImage(projectById.image);
      setIsTeamMember(projectById.team.users.includes(user?.id.toString()));
    }
  }, [projectById]);

  return (
    <Page>
      <HeaderContainer>
        <Heading text={`Edit Project - ${projectById?.title}`} />

        <NonGrowingFlexContainer>
          <a style={{ width: "15rem", marginTop: "1rem" }}>
            {isTeamMember ? (
              <Button
                loading={updateProjectInProgress}
                disable={updateProjectInProgress}
                onClick={sendSaveProjectRequest}
                primary={true}
              >
                Save Changes
              </Button>
            ) : null}
          </a>
        </NonGrowingFlexContainer>
      </HeaderContainer>
      {!isTeamMember ? null : (
        <Subheading text={"You are part of the team of this project"}></Subheading>
      )}
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        {updateProjectError && (
          <Message type="error">
            <b>Update Project Error: </b> {updateProjectError.message}
          </Message>
        )}
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: "2rem" }}>
        <TextInput
          title="Project Title"
          placeholder="Your project name"
          value={title}
          onChange={(value) => setTitle(value)}
          type={TextInputType.Text}
          isDisabled={!isTeamMember}
        />
        <TextInput
          title="Project Description"
          placeholder="Your project description"
          value={description}
          onChange={(value) => setDescription(value)}
          type={TextInputType.Area}
          isDisabled={!isTeamMember}
        />
        <div>
          <TextInput
            title="Project Image (URL; imgsize: 200x300px)"
            placeholder="Your project image"
            value={image}
            onChange={(value) => setImage(value)}
            type={TextInputType.Text}
            isDisabled={!isTeamMember}
          />
          {image !== "" ? (
            <img src={image} style={{ width: "200px", height: "200px" }} />
          ) : null}
        </div>
      </form>
    </Page>
  );
};
