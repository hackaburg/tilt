import styled from "@emotion/styled";
import * as React from "react";
import { useSettingsContext } from "../contexts/settings-context";

const Container = styled.div`
  padding: 4rem 0rem;
  text-align: center;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 20vh;
`;

/**
 * The sidebar logo.
 */
export const SidebarLogo = () => {
  const { settings } = useSettingsContext();
  return (
    <Container>
      <Image src={settings?.frontend.sidebarImage} />
    </Container>
  );
};
