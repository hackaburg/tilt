import { UserRole } from "../../../types/roles";
import { setFormType } from "../../src/actions/form";
import { login } from "../../src/actions/login";
import { finishRequest, startRequest } from "../../src/actions/request";
import { setRole } from "../../src/actions/role";
import { FormType } from "../../src/state";

describe("login actions", () => {
  it("asynchronously logs the user in", async () => {
    expect.assertions(4);

    const email = "email";
    const password = "password";
    const dispatch = jest.fn();
    const actions = login(email, password);
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startRequest());
    expect(dispatch).toBeCalledWith(setFormType(FormType.Login));
    expect(dispatch).toBeCalledWith(setRole(UserRole.User));
    expect(dispatch).toBeCalledWith(finishRequest());
  });
});
