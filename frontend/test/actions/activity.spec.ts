import { ActivityType, IActivity } from "../../../types/activity";
import { addActivities, fetchActivities } from "../../src/actions/activity";
import { finishRequest, startRequest } from "../../src/actions/request";
import { api } from "../__mocks__/api";

describe("activity actions", () => {
  it("asynchronously fetches activities", async () => {
    expect.assertions(4);

    const activities: IActivity[] = [
      {
        type: ActivityType.Signup,
      },
    ];

    api.getActivities.mockResolvedValue(activities);

    const dispatch = jest.fn();
    const actions = fetchActivities();
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startRequest());
    expect(api.getActivities).toBeCalled();
    expect(dispatch).toBeCalledWith(addActivities(activities));
    expect(dispatch).toBeCalledWith(finishRequest());
  });
});
