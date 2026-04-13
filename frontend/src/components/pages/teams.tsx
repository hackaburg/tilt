import * as React from "react";
import { Page } from "./page";
import { Chip, Grid } from "@mui/material";
import { Routes } from "../../routes";
import { useApi } from "../../hooks/use-api";
import { TeamDTO } from "../../api/types/dto";
import { GrGroup } from "react-icons/gr";
import { Link } from "react-router-dom";
import { PageHeader } from "../base/page-header";

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Teams = () => {
  const { value: allTeams } = useApi(async (api) => api.getAllTeams(), []);

  const teams = allTeams ?? [];

  return (
    <Page>
      <PageHeader
        pageTitle="Teams"
        buttonText="Create New Team"
        buttonHref={Routes.CreateTeam}
        subTitle="Create or join a team"
        collapsibleText="You can create or join a team. As the team owner you can
          accept users who want to join, remove users, or delete the whole team.
          If you want to join a team, go to the teams page and hit the button."
      />
      <Grid container spacing={3}>
        {Array.from(teams).map((team: TeamDTO, index) => (
          <Grid item xs={12} md={6} lg={4} xl={3} key={index}>
            <Link
              to={`/team?id=${team.id}`}
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
