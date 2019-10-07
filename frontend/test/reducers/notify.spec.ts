import { hideNotification, showNotification } from "../../src/actions/notify";
import { notifyReducer } from "../../src/reducers/notify";

describe("notifyReducer", () => {
  it("provides default state", () => {
    const state = notifyReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("shows a notification", () => {
    const message = "test";
    const state = notifyReducer(
      {
        show: false,
        text: "",
      },
      showNotification(message),
    );

    expect(state.show).toBeTruthy();
    expect(state.text).toBe(message);
  });

  it("hides the notification", () => {
    const state = notifyReducer(
      {
        show: true,
        text: "",
      },
      hideNotification(),
    );

    expect(state.show).toBeFalsy();
  });
});
