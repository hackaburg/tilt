import * as React from "react";
import { FlexColumnContainer } from "../base/flex";
import { Heading } from "../base/headings";
import { Text } from "../base/text";

/**
 * A "you're signed up wait for the email" message.
 */
export const SignupDone = () => (
  <FlexColumnContainer>
    <Heading text="Done." />
    <Text>We've sent you an email with a button to verify yourself.</Text>
    <Text>
      It might take a minute or two to arrive, and to be safe, please also check
      your junk mail.
    </Text>
  </FlexColumnContainer>
);
