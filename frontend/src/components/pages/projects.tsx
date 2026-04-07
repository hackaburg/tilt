import styled from "@emotion/styled";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import * as React from "react";
import { useState, useEffect } from "react";
import { Chip, Grid } from "@mui/material";
import { GrGroup } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Divider } from "../base/divider";
import { NonGrowingFlexContainer, NonGrowingFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Button } from "../base/button";
import { InternalLink } from "../base/link";
import { Collapsible } from "../base/collapsible";
import { Page } from "./page";
import { useApi } from "../../hooks/use-api";
import { Routes } from "../../routes";
import { TeamDTO } from "../../api/types/dto";
import { api } from "../../hooks/use-api";
import { PageHeader } from "../base/page-header";
import { useLoginContext } from "../../contexts/login-context";
import { UserRole } from "../../api/types/enums";

const HeaderContainer = styled(NonGrowingFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

const arraySum = (array) => {
  return array.reduce((partialSum, a) => partialSum + a, 0);
}

/**
 * A table displaying the average rating per criterion, and the total sum
 * for each project.
 */
const RatingResults = () => {
  const [ratingResults, setRatingResults] = useState([]);
  const [criteria, setCriteria] = React.useState([]);

  useEffect(
    () => {
      api.getRatingResults().then((stuff) => {
        setRatingResults(stuff)
      });

      api.getAllCriteria().then((criteria) => {
        setCriteria(criteria);
      });
    },
    []
  );

  return (
    <div style={{ marginTop: "2em"  }}>
      <h2>Results</h2>
      <p>(Only visible to admins)</p>
      {
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project</TableCell>
                {criteria.map(criterion => (
                  <TableCell key={criterion.id} align="center">
                    {criterion.title}
                  </TableCell>
                ))}
                <TableCell key="CriterionSum" align="center">
                Sum
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ratingResults.map(resultForProject => (
                <TableRow key={resultForProject.project.id}>
                  <TableCell>
                    {resultForProject.project.title} #{resultForProject.project.id}
                  </TableCell>
                  {criteria.map(criterion => (
                    <TableCell key={criterion.id} align="center">
                      {
                        resultForProject
                          .averagesPerCriterion
                          .find((a) => a.criterion.id == criterion.id)?.average
                      }
                    </TableCell>
                  ))}
                  <TableCell key="CriterionSum" align="center">
                  {arraySum(resultForProject.averagesPerCriterion.map(({ average }) => average))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      }
    </div>
  )
}

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
  const loginState = useLoginContext();
  const { user } = loginState;

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
      <PageHeader
        pageTitle="Projects"
        subTitle="Rate Projects"
        collapsibleText="At the end of the event, other peoples projects will show up
          here, and we need you to rate them based on arious criteria, to help decide
          the winning team."
      />
      <Grid container spacing={3}>
        {allProjects.map((project: ProjectDTO, index) => (
          <Grid item xs={12} md={6} lg={4} xl={3} key={index}>
            <Link
              to={`/project?id=${project.id}`}
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
      {user.role === UserRole.Root && (
        <RatingResults />
      )}
    </Page>
  );
};
