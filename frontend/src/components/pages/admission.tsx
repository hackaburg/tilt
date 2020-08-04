import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import FlexView from "react-flexview";
import { useDebounce } from "use-debounce";
import { debounceDuration } from "../../config";
import { useSettingsContext } from "../../contexts/settings-context";
import { isNameQuestion } from "../../heuristics";
import { useApi } from "../../hooks/use-api";
import { Nullable } from "../../state";
import { Chevron } from "../base/chevron";
import { Elevated } from "../base/elevated";
import { Heading, Subheading } from "../base/headings";
import { ExternalLink } from "../base/link";
import { Message } from "../base/message";
import { Muted } from "../base/muted";
import { SuspenseFallback } from "../base/suspense-fallback";
import { Text } from "../base/text";
import { TextInput } from "../base/text-input";
import { Page } from "./page";

const Table = styled.table`
  border-collapse: collapse;
  overflow-x: auto;
  width: 100%;
`;

const TableHead = styled.thead`
  background-color: #333;
  color: white;
`;

const TableHeaderCell = styled.th`
  font-weight: bold;
  text-align: left;
  padding: 0.75rem 1rem;

  border-right: 1px solid #555;

  :last-of-type {
    border: none;
  }
`;

const TableRow = styled.tr`
  :nth-of-type(4n - 1) {
    background-color: #f7f7f7;
  }

  :hover {
    background-color: #efefef;
  }
`;

const TableCell = styled.td`
  border-right: 1px solid #e0e0e0;
  padding: 0.75rem 1rem;

  :last-of-type {
    border: none;
  }
`;

const ExpandedCell = styled.td`
  box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.1);
`;

const QuestionaireContainer = styled(FlexView)`
  padding: 1rem;
`;

const DetailsButton = styled.button`
  border: none;
  background-color: transparent;
  cursor: pointer;
  font-size: inherit;
  color: currentColor;
`;

interface IAnswersByQuestionID {
  [questionID: number]: string;
}

interface IUserApplication {
  answersByQuestionID: IAnswersByQuestionID;
  answers: string[];
}

interface IApplicationsByUserID {
  [userID: number]: IUserApplication;
}

/**
 * One table to admit them all.
 */
export const Admission = () => {
  const { settings } = useSettingsContext();
  const questions = [
    ...settings.application.profileForm.questions,
    ...settings.application.confirmationForm.questions,
  ];

  const { isFetching, value: allApplications, error: fetchError } = useApi(
    async (api) => api.getAllApplications(),
    [],
  );

  const safeApplications = allApplications ?? [];

  const applicationsSortedByDate = useMemo(() => {
    const sorted = [...safeApplications];
    const now = Date.now();

    sorted.sort(
      (a, b) =>
        (a.user.initialProfileFormSubmittedAt?.getTime() ?? now) -
        (b.user.initialProfileFormSubmittedAt?.getTime() ?? now),
    );

    return sorted;
  }, [safeApplications]);

  const applicationsByUserID = useMemo(() => {
    return applicationsSortedByDate.reduce<IApplicationsByUserID>(
      (accumulatedApplicationsByUserID, application) => {
        const answersByQuestionID = application.answers.reduce<
          IAnswersByQuestionID
        >(
          (accumulatedAnswersByQuestionID, answer) => ({
            ...accumulatedAnswersByQuestionID,
            [answer.questionID]: answer.value,
          }),
          {},
        );

        return {
          ...accumulatedApplicationsByUserID,
          [application.user.id]: {
            answers: [
              ...Object.values(answersByQuestionID),
              application.user.email,
            ],
            answersByQuestionID,
          },
        };
      },
      {},
    );
  }, [applicationsSortedByDate]);

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, debounceDuration);

  const visibleApplications = useMemo(() => {
    const trimmedQuery = debouncedQuery.trim();

    if (trimmedQuery === "") {
      return applicationsSortedByDate;
    }

    const queryFields = trimmedQuery.toLowerCase().split(/(\s|,)/);

    return applicationsSortedByDate.filter(({ user: { id } }) => {
      const { answers } = applicationsByUserID[id];

      return answers.some((answer) =>
        queryFields.some((queryField) =>
          answer.toLowerCase().includes(queryField),
        ),
      );
    });
  }, [debouncedQuery, applicationsSortedByDate, applicationsByUserID]);

  const probableNameQuestion = questions.find(isNameQuestion);

  const [selectedRowIDs, setSelectedRowIDs] = useState<readonly number[]>([]);
  const headerCheckboxRef = useRef<Nullable<HTMLInputElement>>(null);

  const visibleApplicationsSelectedCount = visibleApplications.filter(
    ({ user: { id } }) => selectedRowIDs.includes(id),
  ).length;

  const allVisibleSelected =
    visibleApplicationsSelectedCount === visibleApplications.length;
  const noVisibleSelected = visibleApplicationsSelectedCount === 0;
  const someVisibleSelected = !allVisibleSelected && !noVisibleSelected;

  const [expandedRowIDs, setExpandedRowIDs] = useState<readonly number[]>([]);

  const handleSelectHeaderCheckbox = useCallback(() => {
    const visibleIDs = visibleApplications.map(({ user: { id } }) => id);

    if (allVisibleSelected) {
      setSelectedRowIDs((value) =>
        value.filter((id) => !visibleIDs.includes(id)),
      );

      return;
    }

    setSelectedRowIDs((value) => {
      const set = new Set([...visibleIDs, ...value]);
      return [...set];
    });
  }, [allVisibleSelected, visibleApplications]);

  if (headerCheckboxRef.current) {
    headerCheckboxRef.current.checked = allVisibleSelected;
    headerCheckboxRef.current.indeterminate = someVisibleSelected;
  }

  const tableRows = visibleApplications.map(({ user: { id, email } }) => {
    const name =
      probableNameQuestion != null
        ? applicationsByUserID[id].answersByQuestionID[probableNameQuestion.id!]
        : null;

    const isRowSelected = selectedRowIDs.includes(id);
    const handleSelectRow = () => {
      setSelectedRowIDs((value) => {
        if (isRowSelected) {
          return value.filter((applicationID) => applicationID !== id);
        }

        return [...value, id];
      });
    };

    const isRowExpanded = expandedRowIDs.includes(id);
    const handleExpandRow = () => {
      setExpandedRowIDs((value) => {
        if (isRowExpanded) {
          return value.filter((applicationID) => applicationID !== id);
        }

        return [...value, id];
      });
    };

    const { answersByQuestionID } = applicationsByUserID[id];
    const questionsAndAnswers =
      isRowExpanded &&
      questions.map((question) => {
        const answer = answersByQuestionID[question.id!];

        if (answer == null) {
          return;
        }

        return (
          <Text key={String(question.id)}>
            <b>{question.title}:</b> {answer}
          </Text>
        );
      });

    return (
      <React.Fragment key={String(id)}>
        <TableRow>
          <TableCell align="center">
            <input
              type="checkbox"
              checked={isRowSelected}
              onClick={handleSelectRow}
              readOnly
            />
          </TableCell>

          <TableCell>
            <DetailsButton onClick={handleExpandRow}>
              <FlexView vAlignContent="center">
                {isRowExpanded ? "Collapse" : "Expand"}
                <FlexView width="0.5rem" />
                <Chevron size={20} rotation={isRowExpanded ? 0 : -90} />
              </FlexView>
            </DetailsButton>
          </TableCell>

          <TableCell>
            <ExternalLink to={`mailto:${email}`}>{email}</ExternalLink>
          </TableCell>

          <TableCell>{name}</TableCell>
        </TableRow>

        <tr>
          {isRowExpanded && (
            <ExpandedCell colSpan={4}>
              <QuestionaireContainer column grow>
                <Subheading>{name}</Subheading>
                {questionsAndAnswers}
              </QuestionaireContainer>
            </ExpandedCell>
          )}
        </tr>
      </React.Fragment>
    );
  });

  return (
    <Page>
      <Heading>Admission</Heading>

      {isFetching && <SuspenseFallback />}
      {fetchError && (
        <Message error>
          <b>Error:</b> {fetchError.message}
        </Message>
      )}

      {probableNameQuestion == null && (
        <Message warn>
          <b>Warnings:</b>
          <ul>
            <li>
              We couldn't find a "name" question. Are you asking for this
              information?
            </li>
          </ul>
        </Message>
      )}

      {allApplications == null ? (
        <Muted>No applications found</Muted>
      ) : (
        <FlexView column grow>
          <TextInput
            autoFocus
            placeholder="search for anything somebody might've answered"
            value={query}
            onChange={setQuery}
            title="Search applications"
          />

          <FlexView height="1rem" />

          <Elevated level={1}>
            <Table>
              <colgroup>
                <col style={{ width: "5%" }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "45%" }} />
              </colgroup>

              <TableHead>
                <tr>
                  <TableHeaderCell align="center">
                    <input
                      type="checkbox"
                      ref={headerCheckboxRef}
                      onClick={handleSelectHeaderCheckbox}
                    />
                  </TableHeaderCell>
                  <TableHeaderCell />
                  <TableHeaderCell>E-mail</TableHeaderCell>
                  <TableHeaderCell>Name</TableHeaderCell>
                </tr>
              </TableHead>

              <tbody>
                {tableRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Muted>No applications found</Muted>
                    </TableCell>
                  </TableRow>
                ) : (
                  tableRows
                )}
              </tbody>
            </Table>
          </Elevated>
        </FlexView>
      )}
    </Page>
  );
};
