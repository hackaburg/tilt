import * as React from "react";
import { connect } from "react-redux";
import styled from "styled-components";
import { IState } from "../state";

const Container = styled.div`
  padding: 4rem 0rem;
  text-align: center;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 20vh;
`;

interface ISidebarLogoProps {
  sidebarImageUrl: string;
}

/**
 * The sidebar logo.
 */
export const SidebarLogo = ({ sidebarImageUrl }: ISidebarLogoProps) => (
  <Container>
    <Image src={sidebarImageUrl} />
  </Container>
);

const mapStateToProps = (state: IState) => ({
  sidebarImageUrl: state.settings.frontend.sidebarImage,
});

/**
 * The sidebar logo connected to the redux store.
 */
export const ConnectedSidebarLogo = connect(mapStateToProps)(SidebarLogo);
