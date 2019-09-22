import { ActivityType, IActivity } from "../../../types/activity";
import { addActivities, fetchActivities } from "../../src/actions/activity";
import { finishRequest, startRequest } from "../../src/actions/request";
import { RequestTarget } from "../../src/state";
import { api } from "../__mocks__/api";

describe("activity actions", () => {
  it("asynchronously fetches activities", async () => {
    expect.assertions(4);

    const activities: IActivity[] = [
      {
        data: {
          type: ActivityType.Signup,
        },
        timestamp: new Date().getTime(),
        user: null as any,
      },
    ];

    api.getActivities.mockResolvedValue(activities);

    const dispatch = jest.fn();
    const actions = fetchActivities();
    await actions(dispatch);

    const target = RequestTarget.Activities;
    expect(dispatch).toBeCalledWith(startRequest(target));
    expect(api.getActivities).toBeCalled();
    expect(dispatch).toBeCalledWith(addActivities(activities));
    expect(dispatch).toBeCalledWith(finishRequest(target));
  });
});
