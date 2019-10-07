import * as React from "react";
import { useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from "redux";
import { IActivity } from "../../../types/activity";
import { fetchActivities } from "../actions/activity";
import { IState } from "../state";
import { groupByMonth } from "../util";
import { ActivityEvent } from "./activity-event";
import { Heading, Subheading } from "./headings";
import { Placeholder } from "./placeholder";

interface IActivityProps {
  activity: IActivity[] | null;
  dispatchFetchActivities: typeof fetchActivities;
}

/**
 * An overview over activities in tilt.
 */
export const Activity = ({
  activity,
  dispatchFetchActivities,
}: IActivityProps) => {
  useEffect(() => {
    if (!activity) {
      dispatchFetchActivities();
    }
  }, []);

  const descendingActivities = (activity || []).sort(
    (a, b) => b.timestamp - a.timestamp,
  );
  const activityByMonth = groupByMonth(descendingActivities).map(
    ({ month, data }) => (
      <div key={month}>
        <Subheading>{month}</Subheading>
        {data.map((event) => (
          <ActivityEvent event={event} key={JSON.stringify(event)} />
        ))}
      </div>
    ),
  );

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

const mapStateToProps = (state: IState) => ({
  activity: state.activity,
});

const mapDispatchToProps = (dispatch: Dispatch) => {
  return bindActionCreators(
    {
      dispatchFetchActivities: fetchActivities,
    },
    dispatch,
  );
};

/**
 * The activity component connected to the redux store.
 */
export const ConnectedActivity = connect(
  mapStateToProps,
  mapDispatchToProps,
)(Activity);
