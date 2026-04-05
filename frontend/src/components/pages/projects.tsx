import styled from "@emotion/styled";
import * as React from "react";
import { useState, useEffect } from "react";
import { Divider } from "../base/divider";
import { StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Page } from "./page";
import { api } from "../../hooks/use-api";

console.log("alskdjfla", api)

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Projects = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [settings, setSettings] = useState({});

  // Do this only on mount
  useEffect(
    () => {
      api.getAllProjects().then((projects) => {
        setAllProjects(projects)
      });

      api.getSettings().then((settings) => {
        setSettings(settings)
      });
    },
    []
  );

  return (
    <Page>
      <HeaderContainer>
        <Heading text="Projects " />
      </HeaderContainer>
      <Divider />
      {allProjects.map(project => <div>project</div>)}
    </Page>
  );
};
