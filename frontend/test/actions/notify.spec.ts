import {
  hideNotification,
  notify,
  showNotification,
} from "../../src/actions/notify";

jest.useFakeTimers();

describe("notify actions", () => {
  it("shows a notification for a short time", async () => {
    expect.assertions(2);

    const message = "test";
    const dispatch = jest.fn();

    const promise = notify(message)(dispatch);
    jest.runAllTimers();
    await promise;

    expect(dispatch).toBeCalledWith(showNotification(message));
    expect(dispatch).toBeCalledWith(hideNotification());
  });
});
