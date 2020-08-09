import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
import FlexView from "react-flexview";
import type { AnswerDTO } from "../../api/types/dto";
import { useLoginContext } from "../../contexts/login-context";
import { useSettingsContext } from "../../contexts/settings-context";
import { useApi } from "../../hooks/use-api";
import { useDerivedState } from "../../hooks/use-derived-state";
import { isBetween, isConfirmationExpired } from "../../util";
import { Button } from "../base/button";
import { Divider } from "../base/divider";
import { HorizontalSpacer } from "../base/flex";
import { Heading } from "../base/headings";
import { Message } from "../base/message";
import { Muted } from "../base/muted";
import { Placeholder } from "../base/placeholder";
import { Page } from "../pages/page";
import { StringifiedUnifiedQuestion } from "./stringified-unified-question";

/**
 * An enum describing the type of form we want to render.
 */
export enum FormType {
  ProfileForm = "profile_form",
  ConfirmationForm = "confirmation_form",
}

const SubmitContainer = styled(FlexView)`
  padding: 3rem 0;
`;

interface IFormProps {
  type: FormType;
}

interface IFormState {
  readonly [K: number]: string;
}

/**
 * A form for users to fill out
 */
export const Form = ({ type }: IFormProps) => {
  const { settings } = useSettingsContext();
  const title =
    type === FormType.ProfileForm
      ? settings.application.profileForm.title
      : settings.application.confirmationForm.title;

  const { user } = useLoginContext();
  const isExpired = user == null ? false : isConfirmationExpired(user);
  const isNotAttending = user?.declined || isExpired;

  const now = Date.now();
  const isProfileFormAvailable =
    !user?.admitted &&
    isBetween(
      settings.application.allowProfileFormFrom.getTime(),
      now,
      settings.application.allowProfileFormUntil.getTime(),
    );

  const isConfirmationFormAvailable =
    user != null &&
    user.confirmationExpiresAt != null &&
    user.confirmationExpiresAt.getTime() >= now;

  const isFormDisabled =
    isNotAttending ||
    (type === FormType.ProfileForm
      ? !isProfileFormAvailable
      : !isConfirmationFormAvailable);

  const { value: form, error: initialFetchError } = useApi(
    async (api) =>
      type === FormType.ProfileForm
        ? api.getProfileForm()
        : api.getConfirmationForm(),
    [type],
  );

  const [state, setState] = useDerivedState<IFormState>(() => {
    if (!form) {
      return {};
    }

    const questionDerivedState = form.questions.reduce<IFormState>(
      (derivedState, { id }) =>
        id == null ? derivedState : { ...derivedState, [id]: "" },
      {},
    );

    const answerDerivedState = form.answers.reduce<IFormState>(
      (derivedState, { questionID, value }) => ({
        ...derivedState,
        [questionID]: value,
      }),
      questionDerivedState,
    );

    return answerDerivedState;
  }, [form]);

  const [synchronizedAnswers, setSynchronizedAnswers] = useState<
    readonly AnswerDTO[] | null
  >(null);

  const handleSubmit = useCallback(() => {
    setSynchronizedAnswers(
      [...Object.entries(state)].map<AnswerDTO>(([questionID, value]) => ({
        questionID: Number(questionID),
        value,
      })),
    );
  }, [state]);

  const { updateUser } = useLoginContext();
  const [isDirty, setIsDirty] = useState(false);
  const { error: submitError, isFetching: isSubmitting } = useApi(
    async (api) => {
      if (synchronizedAnswers == null) {
        return;
      }

      if (type === FormType.ProfileForm) {
        await api.storeProfileFormAnswers(synchronizedAnswers);
        updateUser((value) =>
          value == null
            ? null
            : {
                ...value,
                initialProfileFormSubmittedAt: new Date(),
              },
        );
      } else {
        await api.storeConfirmationFormAnswers(synchronizedAnswers);
        updateUser((value) =>
          value == null
            ? null
            : {
                ...value,
                confirmed: true,
              },
        );
      }

      setIsDirty(false);
    },
    [type, synchronizedAnswers],
  );

  const handleQuestionValueChange = (questionID: number, value: string) => {
    setState((currentState) => ({
      ...currentState,
      [questionID]: value,
    }));
    setIsDirty(true);
  };

  if (initialFetchError) {
    return (
      <Message error>
        <b>Error fetching form:</b> {initialFetchError.message}
      </Message>
    );
  }

  if (!form) {
    return (
      <Page>
        <Heading>{title}</Heading>
        <Placeholder width="100%" height="7rem" />
        <br />
        <Placeholder width="100%" height="7rem" />
        <br />
        <Placeholder width="100%" height="7rem" />
      </Page>
    );
  }

  const questions = form.questions.map((question) => {
    if (question.parentID != null) {
      const parentAnswer = state[question.parentID];

      if (question.showIfParentHasValue !== parentAnswer) {
        return null;
      }
    }

    return (
      <FlexView key={String(question.id)} column shrink={false}>
        <Divider />

        <StringifiedUnifiedQuestion
          onChange={(value) => handleQuestionValueChange(question.id!, value)}
          value={state[question.id!] ?? ""}
          question={question}
          isDisabled={isFormDisabled}
        />
      </FlexView>
    );
  });

  return (
    <Page>
      <Heading>{title}</Heading>
      {questions}

      <SubmitContainer hAlignContent="right" shrink={false}>
        <FlexView vAlignContent="center" grow>
          <FlexView column grow>
            {submitError && (
              <Message error>
                <b>Error: </b> {submitError.message}
              </Message>
            )}
          </FlexView>

          {!isDirty && !isFormDisabled && (
            <FlexView shrink={false}>
              <Muted>All changes saved</Muted>
            </FlexView>
          )}

          <HorizontalSpacer />

          <FlexView shrink>
            <Button
              primary
              onClick={handleSubmit}
              loading={isSubmitting}
              disable={!isDirty || isFormDisabled}
            >
              Submit
            </Button>
          </FlexView>
        </FlexView>
      </SubmitContainer>
    </Page>
  );
};
