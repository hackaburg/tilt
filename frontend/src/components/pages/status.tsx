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
import { Heading, Subheading } from "../base/headings";
import { InternalLink } from "../base/link";
import { ProgressStep, ProgressStepState } from "../base/progress-step";
import { Text } from "../base/text";
import { Page } from "./page";
import { Divider } from "../base/divider";
import { SimpleCard } from "../base/simple-card";
import { Chip } from "@mui/material";

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
      {user! && (
        <>
          <Heading text={`Welcome ${user?.firstName}`} />
          <Divider />
          <Subheading text="The status of our application and all links for Hackaburg 2024 can be found here." />
        </>
      )}
      <SimpleCard>
        <ProgressStep
          index={1}
          title="Register"
          state={ProgressStepState.Completed}
        >
          <Text style={{ fontSize: "1.15rem" }}>
            You already registered and that's a good first step.
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
          {!user?.profileSubmitted && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                Please fill your{" "}
                <InternalLink to={Routes.ProfileForm}>
                  profile form
                </InternalLink>
                , any time between <b>01.03.2024 - 31.04.2024</b>
              </Text>
            </>
          )}
          {!user?.profileSubmitted && (
            <>
              <Spacer />
              <FlexRowContainer>
                <NonGrowingFlexContainer>
                  <a href={Routes.ProfileForm}>
                    <Button primary={true}>Fill profile form</Button>
                  </a>
                </NonGrowingFlexContainer>
              </FlexRowContainer>
            </>
          )}
          {user?.profileSubmitted && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                You successfully applied. 🎉 You can still edit your{" "}
                <InternalLink to={Routes.ProfileForm}>
                  profile form
                </InternalLink>
              </Text>
            </>
          )}
        </ProgressStep>

        <ProgressStep
          index={3}
          title="Get accepted"
          state={
            user?.admitted
              ? ProgressStepState.Completed
              : ProgressStepState.Pending
          }
        >
          {!user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                We will look through all applications and send you a acceptance
                mail unitl <b>01.05.2024</b>.
              </Text>
            </>
          )}
          {user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                Congratulations! You got accepted for Hackaburg 2024. 🎉
              </Text>
            </>
          )}
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
          {!user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                If you got accepted, you need to confirm your spot until{" "}
                <b>14.05.2024</b>
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
            </>
          )}
          {user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                You confirmed your spot. 🎉
              </Text>
            </>
          )}
          {user?.admitted && !user?.confirmed && (
            <>
              <Spacer />
              <FlexRowContainer>
                <NonGrowingFlexContainer>
                  <InternalLink to={Routes.ConfirmationFormApply}>
                    <Button primary={true}>Fill confirmation form</Button>
                  </InternalLink>
                </NonGrowingFlexContainer>
              </FlexRowContainer>

              <Spacer />

              <Text style={{ fontSize: "1.15rem" }}>
                You have{" "}
                <b>
                  {settings.application.hoursToConfirm} hours{" "}
                  {confirmationDays !== 0 && <> / {confirmationDays} day(s)</>}
                </b>{" "}
                to do this. If you don't confirm your spot, it'll be given to
                someone else after the window has passed.
              </Text>
            </>
          )}
          {deadline != null && user?.admitted && !user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                Your confirmation {isExpired ? <b>was</b> : "is"} due on{" "}
                <b>{dateToString(deadline)}</b>
                {user?.declined && (
                  <>
                    , but you <b>declined</b> your spot
                  </>
                )}
                . Please let us know if you can not make it so that we can hand
                over your spot to someone else.
              </Text>

              {!isNotAttending && user?.admitted && !user?.confirmed && (
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
          {!isNotAttending && !user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                If all goes well, we'll meet you at the event.
              </Text>
            </>
          )}
          {!isNotAttending && user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.15rem" }}>
                See you at the event {user.firstName}! 🎉
              </Text>
            </>
          )}
          {!isNotAttending && user?.confirmed && (
            <>
              <Spacer />
              <div
                style={{
                  backgroundColor: "lightgrey",
                  padding: "1rem",
                  borderRadius: "1rem",
                }}
              >
                <Text style={{ fontSize: "1.15rem" }}>
                  If you anyhow can't make it, please let us know as soon as
                  possible.
                </Text>

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
              </div>
            </>
          )}
        </ProgressStep>
      </SimpleCard>
    </Page>
  );
};
