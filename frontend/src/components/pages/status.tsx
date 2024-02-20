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
          <Subheading text="The status of our application and all links for Hackaburg can be found here." />
        </>
      )}
      <SimpleCard>
        <ProgressStep
          index={1}
          title="Register"
          state={ProgressStepState.Completed}
        >
          <Subheading text="You already registered and that's a good first step." />
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
          {!user?.admitted && (
            <>
              <Text style={{ fontSize: "1.25rem" }}>
                Please fill your{" "}
                <InternalLink to={Routes.ProfileForm}>
                  profile form
                </InternalLink>
                , any time between{" "}
                <b>{dateToString(settings.application.allowProfileFormFrom)}</b>{" "}
                and{" "}
                <b>
                  {dateToString(settings.application.allowProfileFormUntil)}
                </b>
                .
              </Text>
            </>
          )}
          {!user?.admitted && (
            <>
              <Spacer />
              <FlexRowContainer>
                <NonGrowingFlexContainer>
                  <a href={Routes.ProfileFormApply}>
                    <Button primary={true}>Fill profile form</Button>
                  </a>
                </NonGrowingFlexContainer>
              </FlexRowContainer>
            </>
          )}
          {user?.admitted && (
            <>
              <Text style={{ fontSize: "1.25rem" }}>
                You successfully applied. 🎉
              </Text>
            </>
          )}
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
          {!user?.confirmed && (
            <>
              <Text>
                We'll go through applications in batches. Hang tight, we'll let
                you know once we selected your application, but it might take
                some time.
              </Text>
            </>
          )}
          {user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.25rem" }}>
                Congratulations! You got accepted for Hackaburg 2024.
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
              <Text>
                If you received an acceptance e-mail, you still need to confirm
                your spot and provide some final information like your dietary
                needs
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
              <Text style={{ fontSize: "1.25rem" }}>
                You confirmed your spot. 🎉
              </Text>
            </>
          )}
          {user?.admitted && !user?.confirmed && (
            <>
              <Spacer />
              <FlexRowContainer>
                <NonGrowingFlexContainer>
                  <a href={Routes.ConfirmationFormApply}>
                    <Button primary={true}>Fill confirmation form</Button>
                  </a>
                </NonGrowingFlexContainer>
              </FlexRowContainer>

              <Spacer />

              <Text>
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
              <Text>
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
              <Text>If all goes well, we'll meet you at the event.</Text>
            </>
          )}
          {!isNotAttending && user?.confirmed && (
            <>
              <Text style={{ fontSize: "1.25rem" }}>
                See you at the event {user.firstName}! 🎉
              </Text>
            </>
          )}
          <Spacer />
          <Divider />
          <Text style={{ fontSize: "1.25rem" }}>
            If you anyhow can't make it, please let us know as soon as possible.
          </Text>
          {!isNotAttending && user?.confirmed && (
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
        </ProgressStep>
      </SimpleCard>
    </Page>
  );
};
