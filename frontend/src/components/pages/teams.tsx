import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Page } from "./page";
import { Button } from "../base/button";
import { Grid } from "@mui/material";
import { InternalLink } from "../base/link";
import { Routes } from "../../routes";
import { useApi } from "../../hooks/use-api";
import { TeamDTO } from "../../api/types/dto";

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
      <Grid container spacing={3} style={{ marginTop: "2rem" }}>
        {Array.from(teams).map((team: TeamDTO, index) => (
          <Grid item xs={12} md={4} lg={3}>
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
              </div>
            </div>
          </Grid>
        ))}
      </Grid>
    </Page>
  );
};
