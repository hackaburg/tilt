import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer } from "../base/flex";
import { Heading, Subheading } from "../base/headings";
import { Button } from "../base/button";
import { InternalLink } from "../base/link";
import { Collapsible } from "../base/collapsible";
import { Routes } from "../../routes";
import { Divider } from "../base/divider";
import { mediaBreakpoints } from "../../config";

const HeaderContainer = styled(NonGrowingFlexContainer)`
  justify-content: space-between;
  flex-direction: column;
`;

const HeadingButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: row;

  @media screen and (max-width: ${mediaBreakpoints.tablet}) {
    flex-direction: column;
  }
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
    <HeaderContainer style={{ marginBottom }}>
      <HeadingButtonContainer>
        <Heading text={pageTitle} />
        {buttonText &&
          (buttonHref ? (
            <a href={buttonHref} style={{ width: "fit-content" }}>
              {button}
            </a>
          ) : (
            button
          ))}
      </HeadingButtonContainer>
      <Divider />
      {collapsibleText ? (
        <Collapsible title={subTitle ?? ""}>{collapsibleText}</Collapsible>
      ) : (
        subTitle && <Subheading text={subTitle} />
      )}
    </HeaderContainer>
  );
};
