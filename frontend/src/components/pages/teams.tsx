import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { Chip, Grid } from "@mui/material";
import { InternalLink } from "../base/link";
import { Routes } from "../../routes";
import { useApi } from "../../hooks/use-api";
import { TeamDTO } from "../../api/types/dto";
import { GrGroup } from "react-icons/gr";
import { Link } from "react-router-dom";
import { Collapsible } from "../base/collapsible";

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Teams = () => {
  const { value: allTeams } = useApi(async (api) => api.getAllTeams(), []);

  const teams = allTeams ?? [];

  return (
    <Page>
      <HeaderContainer>
        <Heading text="Teams" />
        <NonGrowingFlexContainer>
          <a style={{ width: "15rem", marginTop: "1rem" }}>
            <InternalLink to={Routes.CreateTeam}>
              <Button primary={true}>Create New Team</Button>
            </InternalLink>
          </a>
        </NonGrowingFlexContainer>
      </HeaderContainer>

      <Collapsible title="Create or join a team. Get more information.">
        This is a new feature this year. You can create or join a team. You can
        add other users to your team and remove them as well. The team owner can
        delete the team and remove users from the team. If you want to join a
        team you can send a request to join the team and the team owner can
        accept or reject the request.
        <br></br>
        <br></br>
        Please be aware that this is the beta version of the team feature. If
        you have any feedback or suggestions, please let us know.
        <a href="mailto:support@hackaburg.de">support@hackaburg.de</a>
      </Collapsible>
      <Grid container spacing={3} style={{ marginTop: "2rem" }}>
        {Array.from(teams).map((team: TeamDTO, index) => (
          <Grid item xs={12} md={6} lg={4} xl={3} key={index}>
            <Link
              to={`/edit-team?id=${team.id}`}
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
                  src={team.teamImg}
                  alt={team.title}
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
                    {team.title}
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
                    {team.description}
                  </p>
                  <div>
                    <b>Team Size</b>
                    <Chip
                      icon={<GrGroup />}
                      style={{ marginLeft: "0.5rem" }}
                      label={team.users!.length + " members"}
                      variant="outlined"
                      size="medium"
                    />
                  </div>
                </div>
              </div>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
};
