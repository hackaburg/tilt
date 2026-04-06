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
import { UserRole } from "../../api/types/enums";
import { TextField, Switch, FormControlLabel, Stack, Button } from "@mui/material";
import { ReadOnlyProject } from "./read-only-project";

const HeaderContainer = styled(NonGrowingFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * A gate component that checks if the current user is part of the team.
 * Renders the editor if user is a member, the viewer otherwise.
 */
export const ViewProject = () => {
  const loginState = useLoginContext();
  const { user } = loginState;

  const [project, setProject] = React.useState(null);
  const params = new URLSearchParams(document.location.search);
  const projectId = Number(params.get("id"))
  React.useEffect(
    () => { api.getProjectByID(projectId).then((project) => setProject(project))},
    []
  );

  const isTeamMember = React.useMemo(() => {
    return project?.team?.users?.some((id) => id === user?.id.toString()) ?? false;
  }, [project, user?.id]);

  const isAdmin = user?.role == UserRole.Root

  return isTeamMember || isAdmin ? (
    <EditProject project={project} />
  ) : (
    <ReadOnlyProject project={project}/>
  );
};

/**
 * A settings dashboard to configure all parts of tilt.
 */
const EditProject = ({ project }) => {
  const loginState = useLoginContext();
  const { user } = loginState;
  const params = new URLSearchParams(document.location.search);

  const [isTeamMember, setIsTeamMember] = React.useState(false);
  const [id, setId] = React.useState(0);
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState("");
  const [allowRating, setAllowRating] = React.useState(false);

  const {
    value: didUpdateProject,
    isFetching: updateProjectInProgress,
    error: updateProjectError,
    forcePerformRequest: sendSaveProjectRequest,
  } = useApi(
    async (apiClient, wasTriggeredManually) => {
      if (wasTriggeredManually) {
        await apiClient.updateProject(
          id,
          {
            title,
            description,
            image,
            allowRating,
          }
        );
        return true;
      }
      return false;
    },
    [id, title, description, image, allowRating],
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
    if (project) {
      setId(project.id);
      setTitle(project.title);
      setDescription(project.description);
      setImage(project.image);
      setAllowRating(project.allowRating);
      setIsTeamMember(project.team.users.includes(user?.id.toString()));
    }
  }, [project]);

  return (
    <Page>
      <HeaderContainer>
        <Heading text={`Edit Project - ${project?.title}`} />

        <NonGrowingFlexContainer>
          <a style={{ marginTop: "1rem" }}>
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
        {user?.role === UserRole.Root && (
          <FormControlLabel
            control={<Switch
              checked={allowRating}
              onChange={(event) => setAllowRating(event.target.checked)}
            />}
            label="Allow users to rate this project"
          />
        )}
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
