import styled from "@emotion/styled";
import * as React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { ApplicationDTO } from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { debounceDuration } from "../../config";
import { useSettingsContext } from "../../contexts/settings-context";
import { isNameQuestion } from "../../heuristics";
import { performApiRequest, useApi } from "../../hooks/use-api";
import { useIsResponsive } from "../../hooks/use-is-responsive";
import { Nullable } from "../../state";
import { dateToString, filterSplit, isConfirmationExpired } from "../../util";
import { Button } from "../base/button";
import { Chevron } from "../base/chevron";
import { Code } from "../base/code";
import { Elevated } from "../base/elevated";
import {
  FlexColumnContainer,
  FlexRowColumnContainer,
  FlexRowContainer,
  HorizontalSpacer,
  StyleableFlexContainer,
  VerticallyCenteredContainer,
  VerticalSpacer,
} from "../base/flex";
import { FormFieldButton } from "../base/form-field-button";
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

const TableRow = styled.tr``;
const AdmittedRow = styled.tr`
  background-color: #fefacc;
`;

const ConfirmedRow = styled.tr`
  background-color: #d1f8bf;
`;

const ExpiredConfirmationRow = styled.tr`
  background-color: #ff9090;
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

const QuestionaireContainer = styled(StyleableFlexContainer)`
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
  concatinatedAnswers: string;
  email: string;
}

interface IApplicationsByUserID {
  [userID: number]: IUserApplication;
}

/**
 * Describes the type of a filter.
 */
const enum FilterType {
  Is,
  Not,
}

interface IFilter {
  type: FilterType;
  field: string;
}

const emptyApplications = [] as readonly ApplicationDTO[];

/**
 * One table to admit them all.
 */
export const Admission = () => {
  const { settings } = useSettingsContext();
  const questions = useMemo(() => {
    return [
      ...settings.application.profileForm.questions,
      ...settings.application.confirmationForm.questions,
    ];
  }, [settings]);

  const {
    isFetching,
    value: allApplications,
    error: fetchError,
    forcePerformRequest: reloadApplications,
  } = useApi(async (api) => api.getAllApplications(), []);

  const safeApplications = allApplications ?? emptyApplications;

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

        const email = application.user.email;

        return {
          ...accumulatedApplicationsByUserID,
          [application.user.id]: {
            answersByQuestionID,
            concatinatedAnswers: [...Object.values(answersByQuestionID), email]
              .join(" ")
              .toLowerCase(),
            email,
          },
        };
      },
      {},
    );
  }, [applicationsSortedByDate]);

  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, debounceDuration);

  const visibleApplications = useMemo(() => {
    const allFilters = debouncedQuery
      .trim()
      .toLowerCase()
      .split(/(\s|,)/)
      .filter((filter) => filter.trim().length > 0);

    if (allFilters.length === 0) {
      return applicationsSortedByDate;
    }

    const [specialFilters, exactFilters] = filterSplit(allFilters, (filter) =>
      /^(is|not):/.test(filter),
    );
    const compiledFilters = specialFilters.map<IFilter>((filter) => {
      const groups = filter.match(/(is|not):(.*)/)!;

      return {
        field: groups[2],
        type: groups[1] === "is" ? FilterType.Is : FilterType.Not,
      };
    });

    return applicationsSortedByDate.filter(({ user }) => {
      const { id, admitted, confirmed, declined } = user;
      const { concatinatedAnswers } = applicationsByUserID[id];

      const matchesSpecialFilters =
        compiledFilters.length === 0 ||
        compiledFilters.every(({ field, type }) => {
          switch (field) {
            case "admitted":
              if (type === FilterType.Is) {
                return admitted;
              } else {
                return !admitted;
              }

            case "confirmed":
              if (type === FilterType.Is) {
                return confirmed;
              } else {
                return !confirmed;
              }

            case "expired":
              const isExpired = isConfirmationExpired(user);

              if (type === FilterType.Is) {
                return isExpired;
              } else {
                return !isExpired;
              }

            case "declined":
              if (type === FilterType.Is) {
                return declined;
              } else {
                return !declined;
              }
          }

          return false;
        });

      if (!matchesSpecialFilters) {
        return false;
      }

      const matchesExactFilters =
        exactFilters.length === 0 ||
        exactFilters.every((filter) => concatinatedAnswers.includes(filter));

      return matchesExactFilters;
    });
  }, [debouncedQuery, applicationsSortedByDate, applicationsByUserID]);

  const probableNameQuestion = questions.find(isNameQuestion);

  const [selectedRowIDs, setSelectedRowIDs] = useState<readonly number[]>([]);
  const headerCheckboxRef = useRef<Nullable<HTMLInputElement>>(null);

  const visibleApplicationsSelectedCount = visibleApplications.filter(
    ({ user: { id } }) => selectedRowIDs.includes(id),
  ).length;

  const allVisibleSelected =
    visibleApplications.length > 0 &&
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

  const {
    error: admitError,
    isFetching: isAdmitting,
    forcePerformRequest: admit,
  } = useApi(
    async (api, wasForced) => {
      if (wasForced) {
        const applicationList = selectedRowIDs
          .map((id) => `- ${applicationsByUserID[id].email}`)
          .join("\n");

        const confirmed = confirm(
          `Are you sure you want to admit the following ${selectedRowIDs.length} application(s):\n\n${applicationList}\n\nThis will send out admission emails, which you can't undo.`,
        );

        if (!confirmed) {
          return;
        }

        await api.admit(selectedRowIDs);
        setSelectedRowIDs([]);
        reloadApplications();
      }
    },
    [selectedRowIDs, reloadApplications],
  );

  if (headerCheckboxRef.current) {
    headerCheckboxRef.current.checked = allVisibleSelected;
    headerCheckboxRef.current.indeterminate = someVisibleSelected;
  }

  const isResponsive = useIsResponsive();
  const tableRows = useMemo(() => {
    return visibleApplications.map(({ user }) => {
      const {
        id,
        email,
        createdAt,
        initialProfileFormSubmittedAt,
        confirmationExpiresAt,
        admitted,
        confirmed,
        declined,
      } = user;

      const name =
        probableNameQuestion != null
          ? applicationsByUserID[id].answersByQuestionID[
              probableNameQuestion.id!
            ]
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
      const questionsAndAnswers = !isRowExpanded
        ? null
        : questions
            .map((question) => {
              const answerValue = answersByQuestionID[question.id!];

              if (answerValue == null) {
                return;
              }

              let answer: React.ReactNode = <Text>{answerValue}</Text>;

              if (question.configuration.type === QuestionType.Text) {
                if (question.configuration.convertAnswerToUrl) {
                  const url = /^https?:\/\//.test(answerValue)
                    ? answerValue
                    : `http://${answerValue}`;
                  answer = (
                    <Text>
                      <ExternalLink to={url}>{url}</ExternalLink>
                    </Text>
                  );
                } else if (question.configuration.multiline) {
                  answer = answerValue
                    .trim()
                    .split("\n")
                    .filter((line) => line.length > 0)
                    .map((line, index) => (
                      <Text key={`${line}-${index}`}>{line}</Text>
                    ));
                }
              } else if (question.configuration.type === QuestionType.Choices) {
                const choices = answerValue
                  .split(",")
                  .map((choice, index) => (
                    <li key={`${choice}-${index}`}>{choice}</li>
                  ));

                answer = <ul>{choices}</ul>;
              }

              return (
                <FlexColumnContainer key={String(question.id)}>
                  <Text>
                    <b>{question.title}</b>
                  </Text>
                  {answer}
                </FlexColumnContainer>
              );
            })
            .filter((answer) => answer != null);

      const handleDeleteAccount = async () => {
        if (!confirm(`Are you sure you want to delete ${name}'s account?`)) {
          return;
        }

        try {
          await performApiRequest(async (api) => api.deleteUser(id));
          reloadApplications();
        } catch {
          // delete errors can be ignored
        }
      };

      const isNotAttending = isConfirmationExpired(user) || declined;
      let RowComponent = TableRow;

      if (isNotAttending) {
        RowComponent = ExpiredConfirmationRow;
      } else if (confirmed) {
        RowComponent = ConfirmedRow;
      } else if (admitted) {
        RowComponent = AdmittedRow;
      }

      return (
        <React.Fragment key={String(id)}>
          <RowComponent>
            <TableCell align="center">
              <input
                type="checkbox"
                checked={isRowSelected}
                onClick={handleSelectRow}
                readOnly
              />
            </TableCell>

            {!isResponsive && (
              <TableCell>
                <DetailsButton onClick={handleExpandRow}>
                  <VerticallyCenteredContainer>
                    {isRowExpanded ? "Collapse" : "Expand"}
                    <HorizontalSpacer />
                    <Chevron size={20} rotation={isRowExpanded ? 0 : -90} />
                  </VerticallyCenteredContainer>
                </DetailsButton>
              </TableCell>
            )}

            <TableCell>
              <ExternalLink to={`mailto:${email}`}>{email}</ExternalLink>
            </TableCell>

            <TableCell>{name}</TableCell>
          </RowComponent>

          <tr>
            {isRowExpanded && (
              <ExpandedCell colSpan={4}>
                <QuestionaireContainer>
                  <Subheading text="Application" />

                  {questionsAndAnswers != null &&
                  questionsAndAnswers.length > 0 ? (
                    questionsAndAnswers
                  ) : (
                    <Muted>This application appears to be empty.</Muted>
                  )}

                  <FlexRowContainer>
                    <FlexRowColumnContainer>
                      <Subheading text="Meta" />
                    </FlexRowColumnContainer>

                    <StyleableFlexContainer>
                      <Button onClick={handleDeleteAccount}>
                        Delete account
                      </Button>
                    </StyleableFlexContainer>
                  </FlexRowContainer>

                  <Text>
                    <b>Account created on:</b>
                  </Text>
                  <Text>{dateToString(createdAt)}</Text>

                  {initialProfileFormSubmittedAt != null && (
                    <>
                      <Text>
                        <b>Profile form submitted on:</b>
                      </Text>
                      <Text>{dateToString(initialProfileFormSubmittedAt)}</Text>
                    </>
                  )}

                  {confirmationExpiresAt != null && (
                    <>
                      <Text>
                        <b>Confirmation deadline:</b>
                      </Text>
                      <Text>{dateToString(confirmationExpiresAt)}</Text>
                    </>
                  )}

                  {declined && (
                    <Text>
                      This application was <b>declined</b>.
                    </Text>
                  )}
                </QuestionaireContainer>
              </ExpandedCell>
            )}
          </tr>
        </React.Fragment>
      );
    });
  }, [
    isResponsive,
    visibleApplications,
    probableNameQuestion,
    selectedRowIDs,
    expandedRowIDs,
    applicationsByUserID,
    questions,
  ]);

  const error = fetchError ?? admitError;

  return (
    <Page>
      <Heading text="Admission" />

      <Text>
        You can search for applications in the table below and admit multiple
        users at once. The below search bar will search all answers that match
        all space-separated filters provided, and also supports special filters
        such as <Code>is:admitted</Code>, <Code>not:confirmed</Code>,
        <Code>is:expired</Code> or <Code>not:declined</Code>. You can exchange{" "}
        <Code>is</Code> and <Code>not</Code> freely, however these four fields
        are the only available special filters.
      </Text>

      {error && (
        <Message error>
          <b>Error:</b> {error.message}
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

      {isFetching && <SuspenseFallback />}
      {allApplications != null && (
        <StyleableFlexContainer>
          <FormFieldButton
            field={
              <TextInput
                autoFocus
                placeholder="search for anything somebody might've answered"
                value={query}
                onChange={setQuery}
                title="Search applications"
              />
            }
            button={
              <Button
                disable={selectedRowIDs.length === 0}
                loading={isAdmitting}
                onClick={admit}
                primary
              >
                Admit
              </Button>
            }
          />

          <VerticalSpacer />

          <Elevated level={1}>
            <Table>
              <colgroup>
                <col style={{ width: "5%" }} />
                {!isResponsive && <col style={{ width: "10%" }} />}
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

                  {!isResponsive && <TableHeaderCell />}
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

          <VerticalSpacer />
        </StyleableFlexContainer>
      )}
    </Page>
  );
};
