import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer, StyleableFlexContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { ApplicationSettings } from "../settings/application-settings";
import { EmailSettings } from "../settings/email-settings";
import { FrontendSettings } from "../settings/frontend-settings";
import { Page } from "./page";
import { SimpleCard } from "../base/simple-card";
import { Button } from "../base/button";
import { Grid } from "@mui/material";

const HeaderContainer = styled(StyleableFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

const ButtonContainer = styled(StyleableFlexContainer)`
  flex-basis: 0;
`;

function createTeam() {
  alert("Not implemented");
}

const teams = [
  {
    name: "Team 1",
    img: "https://via.placeholder.com/150",
    members: ["User 1", "User 2"],
  },
  {
    name: "Team 2",
    img: "https://via.placeholder.com/150",
    members: ["User 3", "User 4"],
  },
  {
    name: "Team 3",
    img: "https://via.placeholder.com/150",
    members: ["User 5", "User 6"],
  },
  {
    name: "Team 4",
    img: "https://via.placeholder.com/150",
    members: ["User 5", "User 6"],
  },
  {
    name: "Team 5",
    img: "https://via.placeholder.com/150",
    members: ["User 5", "User 6"],
  },
];

const TeamCard = styled.span`
  border-radius: 1rem;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 10px 36px 0px,
    rgba(0, 0, 0, 0.06) 0px 0px 0px 1px;
`;

/**
 * A settings dashboard to configure all parts of tilt.
 */
export const Teams = () => (
  <Page>
    <HeaderContainer>
      <Heading text="Teams" />
      <NonGrowingFlexContainer>
        <a style={{ width: "15rem", marginTop: "1rem" }}>
          <Button onClick={createTeam} primary={true}>
            Create New Team
          </Button>
        </a>
      </NonGrowingFlexContainer>
    </HeaderContainer>
    <Grid container spacing={3} style={{ marginTop: "2rem" }}>
      {Array.from(teams).map((team, index) => (
        <Grid item xs={12} md={4}>
          <div
            style={{
              borderRadius: "1rem",
              boxShadow:
                "rgba(0, 0, 0, 0.16) 0px 10px 36px 0px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px",
            }}
          >
            <img
              src={team.img}
              alt={team.name}
              style={{ width: "100%", height: "10rem" }}
            />
            <div style={{ padding: "1rem" }}>
              <Heading text={team.name} />
              <ul>
                {team.members.map((member) => (
                  <li>{member}</li>
                ))}
              </ul>
            </div>
          </div>
        </Grid>
      ))}
    </Grid>
  </Page>
);
