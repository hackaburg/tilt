import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useState } from "react";
import FlexView from "react-flexview";
import type { AnswerDTO } from "../api/types/dto";
import { useSettingsContext } from "../contexts/settings-context";
import { useApi } from "../hooks/use-api";
import { useDerivedState } from "../hooks/use-derived-state";
import { Button } from "./button";
import { Divider } from "./divider";
import { Heading } from "./headings";
import { Message } from "./message";
import { Page } from "./page";
import { Placeholder } from "./placeholder";
import { StringifiedUnifiedQuestion } from "./questions/stringified-unified-question";

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

  const { error: submitError, isFetching: isSubmitting } = useApi(
    async (api) => {
      if (synchronizedAnswers == null) {
        return;
      }

      if (type === FormType.ProfileForm) {
        api.storeProfileFormAnswers(synchronizedAnswers);
      } else {
        api.storeConfirmationFormAnswers(synchronizedAnswers);
      }
    },
    [type, synchronizedAnswers],
  );

  const handleQuestionValueChange = (questionID: number, value: string) => {
    setState((currentState) => ({
      ...currentState,
      [questionID]: value,
    }));
  };

  if (initialFetchError || submitError) {
    const message = initialFetchError?.message ?? submitError?.message;
    return (
      <Message error>
        <b>Error:</b> {message}
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
        />
      </FlexView>
    );
  });

  return (
    <Page>
      <Heading>{title}</Heading>
      {questions}

      <SubmitContainer hAlignContent="right" shrink={false}>
        <Button primary onClick={handleSubmit} loading={isSubmitting}>
          Submit
        </Button>
      </SubmitContainer>
    </Page>
  );
};
