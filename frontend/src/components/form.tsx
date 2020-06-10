import styled from "@emotion/styled";
import * as React from "react";
import { IFormSettings } from "../../../types/settings";
import { Heading } from "./headings";
import { Question } from "./question";

const Container = styled.div`
  border-top: 1px dashed #eee;
  margin-top: 1rem;
`;

interface IFormProps {
  form: IFormSettings;
  values?: readonly any[];
}

/**
 * A form for users to fill out
 */
export const Form = ({ form }: IFormProps) => {
  const questions = form.questions.map((question, index) => (
    <Container key={index}>
      <Question onChange={() => {}} value={""} question={question} />
    </Container>
  ));

  return (
    <>
      <Heading>{form.title}</Heading>
      {questions}
    </>
  );
};
