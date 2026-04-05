import styled from "@emotion/styled";
import * as React from "react";
import { useState, useEffect } from "react";
import { Chip, Grid } from "@mui/material";
import { GrGroup } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Divider } from "../base/divider";
import { NonGrowingFlexContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Button } from "../base/button";
import { InternalLink } from "../base/link";
import { Collapsible } from "../base/collapsible";
import { Page } from "./page";
import { useApi } from "../../hooks/use-api";
import { Routes } from "../../routes";
import { TeamDTO } from "../../api/types/dto";
import { api } from "../../hooks/use-api";

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * - Show all projects visible to the user (owned + rating allowed)
 * - Let users rate them
 * - Create and Delete projects
 * - Offer menu to edit title and description of their own project
 * - Admins can enable or disable rating for individual projects
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
        <Heading text="Projects" />
      </HeaderContainer>

      <Collapsible title="Rate Projects. Get more information.">
        At the end of the event, other peoples projects will show up here, and we need
        you to rate them based on arious criteria, to help decide the winning team.
      </Collapsible>
      <Grid container spacing={3} style={{ marginTop: "2rem" }}>
        {allProjects.map((project: ProjectDTO, index) => (
          <Grid item xs={12} md={6} lg={4} xl={3} key={index}>
            <Link
              to={`/edit-project?id=${project.id}`}
              style={{ color: "black", textDecoration: "none" }}
            >
              <div
                style={{
                  borderRadius: "1rem",
                  boxShadow:
                    "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
                }}
              >
                <img
                  src={project.image || project.team.teamImg}
                  alt={project.title}
                  style={{
                    width: "100%",
                    height: "10rem",
                    borderTopLeftRadius: "1rem",
                    borderTopRightRadius: "1rem",
                    objectFit: "cover",
                  }}
                />
                <div style={{ padding: "1rem" }}>
                  <p
                    style={{
                      fontSize: "1.5rem",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      margin: "0rem",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {project.title}
                  </p>
                  <p
                    style={{
                      minHeight: "6.5rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {project.description}
                  </p>
                </div>
              </div>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
};
