import { finishSignup, signup, startSignup } from "../../src/actions/signup";
import { StaticApi } from "../../src/api/static-api";

describe("signup actions", () => {
  const api = new StaticApi();

  it("asynchronously fetches the settings", async () => {
    expect.assertions(2);

    const email = "email";
    const password = "password";
    const response = await api.signup(email, password);

    const dispatch = jest.fn();
    const actions = signup(email, password);
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startSignup());
    expect(dispatch).toBeCalledWith(finishSignup(response));
  });
});
