import styled from "@emotion/styled";
import * as React from "react";
import { NonGrowingFlexContainer } from "../base/flex";
import { Heading, Subheading } from "../base/headings";
import { Button } from "../base/button";
import { InternalLink } from "../base/link";
import { Collapsible } from "../base/collapsible";
import { Divider } from "../base/divider";

const HeaderContainer = styled(NonGrowingFlexContainer)`
  justify-content: space-between;
  flex-direction: row;
`;

/**
 * pageTitle           button
 * ---
 * subTitle >
 *   collapsibleText
 */
export const PageHeader = ({
  pageTitle,
  buttonText = null,
  buttonHref = null,
  buttonOnClick = null,
  buttonLoading = false,
  buttonDisable = false,
  subTitle = null,
  collapsibleText = null,
}) => {
  const button = buttonText && (
    <Button
      primary={true}
      onClick={buttonOnClick}
      loading={buttonLoading}
      disable={buttonLoading || buttonDisable}
    >{buttonText}</Button>
  );

  return (
    <HeaderContainer style={{ "flex-direction": "column" }}>
      <div style={{ display: "flex", "justify-content": "space-between" }}>
        <Heading text={pageTitle} />
        {buttonText && (
          buttonHref ? (
            <InternalLink to={buttonHref}>{button}</InternalLink>
          ) : (
            button
          )
        )}
      </div>
      <Divider />
      {collapsibleText ? (
        <Collapsible title={subTitle}>
          {collapsibleText}
        </Collapsible>
      ) : subTitle && <Subheading text={subTitle} />}
    </HeaderContainer>
  )
}
