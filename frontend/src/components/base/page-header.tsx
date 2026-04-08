import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer } from "../base/flex";
import { Heading, Subheading } from "../base/headings";
import { Button } from "../base/button";
import { InternalLink } from "../base/link";
import { Collapsible } from "../base/collapsible";
import { Routes } from "../../routes";
import { Divider } from "../base/divider";

const HeaderContainer = styled(NonGrowingFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

interface IPageHeaderProps {
  pageTitle: string;
  buttonText?: string;
  buttonHref?: Routes;
  buttonOnClick?: () => any;
  buttonLoading?: boolean;
  buttonDisable?: boolean;
  subTitle?: string;
  collapsibleText?: string;
  marginBottom?: string | number;
}

/**
 * pageTitle           button
 * ---
 * subTitle >
 *   collapsibleText
 */
export const PageHeader = ({
  pageTitle,
  buttonText,
  buttonHref,
  buttonOnClick,
  buttonLoading = false,
  buttonDisable = false,
  subTitle,
  collapsibleText,
  marginBottom = "2rem",
}: IPageHeaderProps) => {
  const button = buttonText && (
    <Button
      primary={true}
      onClick={buttonOnClick}
      loading={buttonLoading}
      disable={buttonLoading || buttonDisable}
    >
      {buttonText}
    </Button>
  );

  return (
    <HeaderContainer style={{ flexDirection: "column", marginBottom }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Heading text={pageTitle} />
        {buttonText &&
          (buttonHref ? (
            <InternalLink to={buttonHref}>{button}</InternalLink>
          ) : (
            button
          ))}
      </div>
      <Divider />
      {collapsibleText ? (
        <Collapsible title={subTitle ?? ""}>{collapsibleText}</Collapsible>
      ) : (
        subTitle && <Subheading text={subTitle} />
      )}
    </HeaderContainer>
  );
};
