import { setFormType } from "../../src/actions/form";
import { finishRequest, startRequest } from "../../src/actions/request";
import { signup } from "../../src/actions/signup";
import { FormType } from "../../src/state";

describe("signup actions", () => {
  it("asynchronously fetches the settings", async () => {
    expect.assertions(3);

    const email = "email";
    const password = "password";

    const dispatch = jest.fn();
    const actions = signup(email, password);
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startRequest());
    expect(dispatch).toBeCalledWith(setFormType(FormType.Signup));
    expect(dispatch).toBeCalledWith(finishRequest());
  });
});
