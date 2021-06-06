import * as React from "react";
import { useCallback } from "react";
import { useLoginContext } from "../../contexts/login-context";
import { useSettingsContext } from "../../contexts/settings-context";
import { useApi } from "../../hooks/use-api";
import { Routes } from "../../routes";
import { dateToString, isConfirmationExpired } from "../../util";
import { Button } from "../base/button";
import {
  FlexRowContainer,
  NonGrowingFlexContainer,
  Spacer,
} from "../base/flex";
import { Heading } from "../base/headings";
import { InternalLink } from "../base/link";
import { ProgressStep, ProgressStepState } from "../base/progress-step";
import { Text } from "../base/text";
import { Page } from "./page";

/**
 * The start page every user sees after logging in.
 */
export const Status = () => {
  const { settings } = useSettingsContext();
  const { user, updateUser } = useLoginContext();

  const confirmationDays = Math.floor(settings.application.hoursToConfirm / 24);
  const isExpired = user == null ? false : isConfirmationExpired(user);
  const isNotAttending = isExpired || user?.declined;
  const deadline = user?.confirmationExpiresAt;

  const { isFetching: isDecliningSpot, forcePerformRequest: declineSpot } =
    useApi(
      async (api, wasForced) => {
        if (wasForced) {
          await api.declineSpot();

          updateUser((value) =>
            value == null
              ? null
              : {
                  ...value,
                  declined: true,
                },
          );
        }
      },
      [updateUser],
    );

  const handleDeclineSpot = useCallback(() => {
    const isSure = confirm(
      "Are you sure you want to decline your spot?\n\nThis action is irreversible!",
    );

    if (!isSure) {
      return;
    }

    declineSpot();
  }, [declineSpot]);

  return (
    <Page>
      <Heading text="Application status" />

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
          You answer a few questions in our{" "}
          <InternalLink to={Routes.ProfileForm}>profile form</InternalLink> so
          we get to know you, any time between{" "}
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
          user?.confirmed && !isNotAttending
            ? ProgressStepState.Completed
            : isNotAttending
            ? ProgressStepState.Failed
            : ProgressStepState.Pending
        }
      >
        <Text>
          If you received an acceptance e-mail, you still need to confirm your
          spot and provide some final information like your dietary needs
          {user?.admitted && (
            <>
              {" "}
              in our{" "}
              <InternalLink to={Routes.ConfirmationForm}>
                confirmation form
              </InternalLink>
            </>
          )}
          .
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
          <>
            <Text>
              Your confirmation {isExpired ? <b>was</b> : "is"} due on{" "}
              <b>{dateToString(deadline)}</b>
              {user?.declined && (
                <>
                  , but you <b>declined</b> your spot
                </>
              )}
              .
            </Text>

            {!isNotAttending && (
              <>
                <Spacer />

                <FlexRowContainer>
                  <NonGrowingFlexContainer>
                    <Button
                      loading={isDecliningSpot}
                      disable={isNotAttending}
                      onClick={handleDeclineSpot}
                    >
                      I can't make it
                    </Button>
                  </NonGrowingFlexContainer>
                </FlexRowContainer>
              </>
            )}
          </>
        )}
      </ProgressStep>

      <ProgressStep
        index={5}
        title="The event"
        state={
          user?.confirmed && !isNotAttending
            ? ProgressStepState.Completed
            : isNotAttending
            ? ProgressStepState.Failed
            : ProgressStepState.Pending
        }
      >
        <Text>If all goes well, we'll meet you at the event.</Text>
      </ProgressStep>
    </Page>
  );
};
