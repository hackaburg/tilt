import styled from "@emotion/styled";
import * as React from "react";
import { useMemo } from "react";
import { ApplicationDTO, QuestionDTO } from "../../api/types/dto";
import { QuestionType } from "../../api/types/enums";
import { useSettingsContext } from "../../contexts/settings-context";
import { useApi } from "../../hooks/use-api";
import { Routes } from "../../routes";
import { isConfirmationExpired, roundDateToDay } from "../../util";
import { CircleChart } from "../base/circle-chart";
import { Divider } from "../base/divider";
import {
  FlexRowColumnContainer,
  FlexRowContainer,
  NonGrowingFlexContainer,
  StyleableFlexContainer,
} from "../base/flex";
import { Heading, Subheading } from "../base/headings";
import { InternalLink } from "../base/link";
import { Text } from "../base/text";
import { TimeChart } from "../base/time-chart";
import { TitledNumber } from "../base/titled-number";
import { WorldMap } from "../base/worldmap";
import { Page } from "./page";
import { SimpleCard } from "../base/simple-card";
import { Grid } from "@mui/material";

const ChartContainer = styled(StyleableFlexContainer)`
  width: min(400px, 100vw);
  postion: relative;
  margin: auto;
`;

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

        if (application.user.checkedIn) {
          accumulatedPercentages.checkedIn++;
        }

        if (application.user.confirmed) {
          accumulatedPercentages.confirmed++;
          accumulatedPercentages.confirmedNetto++;
        }

        if (application.user.declined) {
          accumulatedPercentages.declined++;
        } else if (isConfirmationExpired(application.user)) {
          accumulatedPercentages.expired++;
        }

        if (application.user.confirmed && application.user.declined) {
          accumulatedPercentages.confirmedNetto--;
        }

        if (application.user.initialProfileFormSubmittedAt != null) {
          accumulatedPercentages.submitted++;
        }

        return accumulatedPercentages;
      },
      {
        admitted: 0,
        checkedIn: 0,
        confirmed: 0,
        confirmedNetto: 0,
        declined: 0,
        expired: 0,
        submitted: 0,
      },
    );

    return {
      admitted: counts.admitted,
      checkedIn: counts.checkedIn,
      confirmed: counts.confirmed,
      declined: counts.declined,
      expired: counts.expired,
      submitted: counts.submitted,
      confirmedNetto: counts.confirmedNetto,
    };
  }, [safeApplications]);

  const [applicationsOverTime, cummulativeApplicationsOverTime] =
    useMemo(() => {
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
          <FlexRowColumnContainer>
            <SimpleCard>
              <Subheading text={title} />
              <Divider />
              <ChartContainer>
                <CircleChart counts={counts} />
              </ChartContainer>
            </SimpleCard>
          </FlexRowColumnContainer>
        );

      /*case QuestionType.Country:
        return (
          <SimpleCard>
            <Subheading text={title} />
            <Divider />
            <WorldMap counts={counts} />
          </SimpleCard>
        );*/

      default:
        return null;
    }
  });

  return (
    <Page>
      <NonGrowingFlexContainer>
        <Heading text="Statistics" />
        <Divider />

        <FlexRowContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <TitledNumber title="Users" value={safeApplications.length} />
            </SimpleCard>
          </FlexRowColumnContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <TitledNumber title="Applied" value={percentages.submitted} />
            </SimpleCard>
          </FlexRowColumnContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <TitledNumber title="Admitted" value={percentages.admitted} />
            </SimpleCard>
          </FlexRowColumnContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <TitledNumber title="Confirmed" value={percentages.confirmed} />
            </SimpleCard>
          </FlexRowColumnContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <TitledNumber title="Declined" value={percentages.declined} />
            </SimpleCard>
          </FlexRowColumnContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <TitledNumber
                title="Confirmed Netto"
                value={percentages.confirmedNetto}
              />
            </SimpleCard>
          </FlexRowColumnContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <TitledNumber title="Expired" value={percentages.expired} />
            </SimpleCard>
          </FlexRowColumnContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <TitledNumber title="Checked in" value={percentages.checkedIn} />
            </SimpleCard>
          </FlexRowColumnContainer>
        </FlexRowContainer>

        <FlexRowContainer>
          <FlexRowColumnContainer>
            <SimpleCard>
              <Subheading text="Applications over time" />
              <Divider></Divider>
              <FlexRowContainer>
                <FlexRowColumnContainer>
                  <TimeChart
                    values={applicationsOverTime}
                    title="Applications over time"
                  />
                </FlexRowColumnContainer>
                <FlexRowColumnContainer>
                  <TimeChart
                    values={cummulativeApplicationsOverTime}
                    title="Cummulative applications over time"
                  />
                </FlexRowColumnContainer>
              </FlexRowContainer>
            </SimpleCard>
          </FlexRowColumnContainer>
        </FlexRowContainer>

        <div style={{ padding: "1.9rem" }}>
          <Grid container spacing={4} justifyContent="center">
            {statistics}
          </Grid>
        </div>

        <Text>
          These statistics are automatically generated from all answers by all
          users. If you need detailed answers per user, go to the{" "}
          <InternalLink to={Routes.Admission}>admission</InternalLink> page.
        </Text>
      </NonGrowingFlexContainer>
    </Page>
  );
};
