import { ActivityType, IActivity } from "../../../types/activity";
import { addActivities } from "../../src/actions/activity";
import { activityReducer, initialActivitiesState } from "../../src/reducers/activity";

describe("activityReducer", () => {
  it("provides an initial state", () => {
    const state = activityReducer(undefined, {} as any);
    expect(state).toBe(initialActivitiesState);
  });

  it("adds activities to empty state", () => {
    const activities: IActivity[] = [
      {
        data: {
          type: ActivityType.Signup,
        },
        timestamp: new Date().getTime(),
        user: {
          email: "test@foo.bar",
        },
      },
    ];

    const state = activityReducer(undefined, addActivities(activities));
    expect(state).toHaveLength(activities.length);
  });

  it("appends activities to existing ones", () => {
    const activities: IActivity[] = [
      {
        data: {
          type: ActivityType.Signup,
        },
        timestamp: new Date().getTime(),
        user: {
          email: "test@foo.bar",
        },
      },
    ];

    const previousState: IActivity[] = [
      {
        data: {
          type: ActivityType.EmailVerified,
        },
        timestamp: new Date().getTime(),
        user: {
          email: "test@foo.bar",
        },
      },
    ];

    const state = activityReducer(previousState, addActivities(activities));
    expect(state).toHaveLength(2);
    expect(state![1]).toBe(activities[0]);
  });
});
