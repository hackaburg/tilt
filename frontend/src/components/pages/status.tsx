import * as React from "react";
import { useLoginContext } from "../../contexts/login-context";
import { useSettingsContext } from "../../contexts/settings-context";
import { dateToString, isConfirmationExpired } from "../../util";
import { Heading } from "../base/headings";
import { ProgressStep, ProgressStepState } from "../base/progress-step";
import { Text } from "../base/text";
import { Page } from "./page";

/**
 * The start page every user sees after logging in.
 */
export const Status = () => {
  const { settings } = useSettingsContext();
  const { user } = useLoginContext();

  const confirmationDays = Math.floor(settings.application.hoursToConfirm / 24);
  const isExpired = user == null ? false : isConfirmationExpired(user);
  const deadline = user?.confirmationExpiresAt;

  return (
    <Page>
      <Heading>Application status</Heading>

      <ProgressStep
        index={1}
        title="Register"
        state={ProgressStepState.Completed}
      >
        <Text>
          We had to start this progress meter somewhere. You already registered
          and we think that's a good first step.
        </Text>
      </ProgressStep>

      <ProgressStep
        index={2}
        title="Apply"
        state={
          user?.initialProfileFormSubmittedAt != null
            ? ProgressStepState.Completed
            : ProgressStepState.Pending
        }
      >
        <Text>
          You answer a few questions so we get to know you, any time between{" "}
          <b>{dateToString(settings.application.allowProfileFormFrom)}</b> and{" "}
          <b>{dateToString(settings.application.allowProfileFormUntil)}</b>.
        </Text>
      </ProgressStep>

      <ProgressStep
        index={3}
        title="Get acceptance e-mail"
        state={
          user?.admitted
            ? ProgressStepState.Completed
            : ProgressStepState.Pending
        }
      >
        <Text>
          We'll go through applications in batches. Hang tight, we'll let you
          know once we selected your application, but it might take some time.
        </Text>
      </ProgressStep>

      <ProgressStep
        index={4}
        title="Confirm your spot"
        state={
          user?.confirmed
            ? ProgressStepState.Completed
            : isExpired
            ? ProgressStepState.Failed
            : ProgressStepState.Pending
        }
      >
        <Text>
          If you received an acceptance e-mail, you still need to confirm your
          spot and provide some final information like your dietary needs.
        </Text>
        <Text>
          You have{" "}
          <b>
            {settings.application.hoursToConfirm} hours{" "}
            {confirmationDays !== 0 && <> / {confirmationDays} day(s)</>}
          </b>{" "}
          to do this. If you don't confirm your spot, it'll be given to someone
          else after the window has passed.
        </Text>

        {deadline != null && (
          <Text>
            Your confirmation {isExpired ? <b>was</b> : "is"} due on{" "}
            <b>{dateToString(deadline)}</b>.
          </Text>
        )}
      </ProgressStep>

      <ProgressStep
        index={5}
        title="The event"
        state={
          user?.confirmed
            ? ProgressStepState.Completed
            : isExpired
            ? ProgressStepState.Failed
            : ProgressStepState.Pending
        }
      >
        <Text>If all goes well, we'll meet you at the event.</Text>
      </ProgressStep>
    </Page>
  );
};
