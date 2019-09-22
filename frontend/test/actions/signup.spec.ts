import { finishRequest, startRequest } from "../../src/actions/request";
import { signup } from "../../src/actions/signup";
import { RequestTarget } from "../../src/state";
import { api } from "../__mocks__/api";

describe("signup actions", () => {
  it("asynchronously fetches the settings", async () => {
    expect.assertions(3);

    const email = "email";
    const password = "password";
    api.signup.mockResolvedValue(email);

    const dispatch = jest.fn();
    const actions = signup(email, password);
    await actions(dispatch);

    const target = RequestTarget.Signup;
    expect(dispatch).toBeCalledWith(startRequest(target));
    expect(api.signup).toBeCalledWith(email, password);
    expect(dispatch).toBeCalledWith(finishRequest(target));
  });
});
