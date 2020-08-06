import * as React from "react";
import { useMemo } from "react";
import FlexView from "react-flexview";
import { ApplicationDTO, QuestionDTO } from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { useSettingsContext } from "../../contexts/settings-context";
import { useApi } from "../../hooks/use-api";
import { Routes } from "../../routes";
import {
  isConfirmationExpired,
  percentageToString,
  roundDateToDay,
} from "../../util";
import { CircleChart } from "../base/circle-chart";
import { Collapsible } from "../base/collapsible";
import { Divider } from "../base/divider";
import { Col, Row } from "../base/grid";
import { Heading } from "../base/headings";
import { InternalLink } from "../base/link";
import { Text } from "../base/text";
import { TimeChart } from "../base/time-chart";
import { TitledNumber } from "../base/titled-number";
import { WorldMap } from "../base/worldmap";
import { Page } from "./page";

interface IChartContainerProps {
  children: React.ReactNode;
}

const ChartContainer = ({ children }: IChartContainerProps) => (
  <FlexView hAlignContent="left" grow>
    <FlexView column>{children as FlexView.Props["children"]}</FlexView>
  </FlexView>
);

interface IAnswerCount {
  [answer: string]: number;
}

interface IAnswersByQuestionID {
  [questionID: number]: IAnswerCount;
}

interface IQuestionsByID {
  [questionID: number]: QuestionDTO;
}

interface ICountByDate {
  [dateString: string]: number;
}

const emptyApplications = [] as readonly ApplicationDTO[];

/**
 * A page with fancy graphs and charts to get MAXIMUM insights into application data.
 */
export const Statistics = () => {
  const { settings } = useSettingsContext();
  const { value: applications } = useApi(
    async (api) => api.getAllApplications(),
    [],
  );

  const safeApplications = applications ?? emptyApplications;

  const allQuestions = useMemo(() => {
    return [
      ...settings.application.profileForm.questions,
      ...settings.application.confirmationForm.questions,
    ];
  }, [settings]);

  const questionsByID = useMemo(() => {
    return allQuestions.reduce<IQuestionsByID>(
      (accumulatedQuestions, question) => ({
        ...accumulatedQuestions,
        [question.id!]: question,
      }),
      {},
    );
  }, [allQuestions]);

  const answersByQuestionID = useMemo(() => {
    return safeApplications.reduce<IAnswersByQuestionID>(
      (accumulatedAnswers, application) => {
        for (const { questionID, value } of application.answers) {
          const question = questionsByID[questionID];

          if (!question) {
            continue;
          }

          const counts: IAnswerCount = accumulatedAnswers[questionID] ?? {};

          switch (question.configuration.type) {
            case QuestionType.Choices:
              const selectedChoices = value.split(",");

              for (const choice of selectedChoices) {
                const choiceCount = counts[choice] ?? 0;
                counts[choice] = choiceCount + 1;
              }
              break;

            case QuestionType.Country:
              const valueCount = counts[value] ?? 0;
              counts[value] = valueCount + 1;
              break;
          }

          accumulatedAnswers[questionID] = counts;
        }

        return accumulatedAnswers;
      },
      {},
    );
  }, [safeApplications, questionsByID]);

  const percentages = useMemo(() => {
    const counts = safeApplications.reduce(
      (accumulatedPercentages, application) => {
        if (application.user.admitted) {
          accumulatedPercentages.admitted++;
        }

        if (application.user.confirmed) {
          accumulatedPercentages.confirmed++;
        }

        if (application.user.declined) {
          accumulatedPercentages.declined++;
        } else if (isConfirmationExpired(application.user)) {
          accumulatedPercentages.expired++;
        }

        if (application.user.initialProfileFormSubmittedAt != null) {
          accumulatedPercentages.submitted++;
        }

        return accumulatedPercentages;
      },
      {
        admitted: 0,
        confirmed: 0,
        declined: 0,
        expired: 0,
        submitted: 0,
      },
    );

    const total = safeApplications.length || 1;

    return {
      admitted: percentageToString(counts.admitted / total),
      confirmed: percentageToString(counts.confirmed / total),
      declined: percentageToString(counts.declined / total),
      expired: percentageToString(counts.expired / total),
      submitted: percentageToString(counts.submitted / total),
    };
  }, [safeApplications]);

  const [
    applicationsOverTime,
    cummulativeApplicationsOverTime,
  ] = useMemo(() => {
    const counts = safeApplications.reduce<ICountByDate>(
      (countByDate, application) => {
        const date = application.user.initialProfileFormSubmittedAt;

        if (date == null) {
          return countByDate;
        }

        const dateString = roundDateToDay(date).toISOString();
        const count = countByDate[dateString] ?? 0;
        countByDate[dateString] = count + 1;

        return countByDate;
      },
      {},
    );

    const overTime = [...Object.entries(counts)]
      .map(([dateString, y]) => ({
        x: new Date(dateString),
        y,
      }))
      .sort((a, b) => a.x.getTime() - b.x.getTime());

    const cummulativeOverTime = overTime.reduce(
      (cummulative, day) => {
        cummulative.sum += day.y;
        cummulative.values.push({
          x: day.x,
          y: cummulative.sum,
        });

        return cummulative;
      },
      { values: [] as typeof overTime, sum: 0 },
    ).values;

    return [overTime, cummulativeOverTime];
  }, [safeApplications]);

  const statistics = allQuestions.map(({ id, configuration, title }) => {
    const key = `${title}-${id}`;
    const counts = answersByQuestionID[id!];

    if (!counts) {
      return null;
    }

    switch (configuration.type) {
      case QuestionType.Choices:
        return (
          <Collapsible key={key} title={title}>
            <ChartContainer>
              <CircleChart counts={counts} />
            </ChartContainer>
          </Collapsible>
        );

      case QuestionType.Country:
        return (
          <Collapsible key={key} title={title}>
            <ChartContainer>
              <WorldMap counts={counts} />
            </ChartContainer>
          </Collapsible>
        );

      default:
        return null;
    }
  });

  return (
    <Page>
      <Heading>Statistics</Heading>

      <FlexView shrink={false}>
        <Row>
          <Col>
            <TitledNumber title="Users" value={safeApplications.length} />
          </Col>
          <Col>
            <TitledNumber title="Applied" value={percentages.submitted} />
          </Col>
          <Col>
            <TitledNumber title="Admitted" value={percentages.admitted} />
          </Col>
          <Col>
            <TitledNumber title="Confirmed" value={percentages.confirmed} />
          </Col>
          <Col>
            <TitledNumber title="Declined" value={percentages.declined} />
          </Col>
          <Col>
            <TitledNumber title="Expired" value={percentages.expired} />
          </Col>
        </Row>
      </FlexView>

      <Divider />

      <Collapsible title="Applications over time">
        <FlexView shrink={false}>
          <Row>
            <Col>
              <ChartContainer>
                <TimeChart
                  values={applicationsOverTime}
                  title="Applications over time"
                />
              </ChartContainer>
            </Col>
            <Col>
              <ChartContainer>
                <TimeChart
                  values={cummulativeApplicationsOverTime}
                  title="Cummulative applications over time"
                />
              </ChartContainer>
            </Col>
          </Row>
        </FlexView>
      </Collapsible>

      <Divider />

      <Text>
        These statistics are automatically generated from all answers by all
        users. If you need detailed answers per user, go to the{" "}
        <InternalLink to={Routes.Admission}>admission</InternalLink> page.
      </Text>

      {statistics}
    </Page>
  );
};
