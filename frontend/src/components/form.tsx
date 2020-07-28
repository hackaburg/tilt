import styled from "@emotion/styled";
import * as React from "react";
import type { FormSettingsDTO } from "../api/types/dto";
import { Heading } from "./headings";
import { UnifiedQuestion } from "./questions/unified-question";

const Container = styled.div`
  border-top: 1px dashed #eee;
  margin-top: 1rem;
`;

interface IFormProps {
  form: FormSettingsDTO;
  values?: readonly any[];
}

/**
 * A form for users to fill out
 */
export const Form = ({ form }: IFormProps) => {
  const questions = form.questions.map((question, index) => (
    <Container key={index}>
      <UnifiedQuestion onChange={() => 0} value={""} question={question} />
    </Container>
  ));

  return (
    <>
      <Heading>{form.title}</Heading>
      {questions}
    </>
  );
};
