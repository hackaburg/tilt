import * as React from "react";
import { useActivity } from "../hooks/use-activity";
import { groupByMonth } from "../util";
import { ActivityEvent } from "./activity-event";
import { Heading, Subheading } from "./headings";
import { Placeholder } from "./placeholder";

/**
 * An overview over activities in tilt.
 */
export const Activity = () => {
  const activity = useActivity();
  const activityByMonth = groupByMonth(activity).map(({ month, data }) => (
    <div key={month}>
      <Subheading>{month}</Subheading>
      {data.map((event) => (
        <ActivityEvent event={event} key={JSON.stringify(event)} />
      ))}
    </div>
  ));

  return (
    <>
      <Heading>Activity</Heading>

      {!activity && (
        <>
          <Placeholder width="200px" height="0.7rem" />
          <br />
          <Placeholder width="100%" height="2rem" />
        </>
      )}

      {activityByMonth}
    </>
  );
};
