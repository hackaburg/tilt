import { UserRole } from "../../../types/roles";
import { login } from "../../src/actions/login";
import { finishRequest, startRequest } from "../../src/actions/request";
import { setRole } from "../../src/actions/role";
import { RequestTarget } from "../../src/state";
import { api } from "../__mocks__/api";

describe("login actions", () => {
  it("asynchronously logs the user in", async () => {
    expect.assertions(4);

    api.login.mockResolvedValue(UserRole.User);

    const email = "email";
    const password = "password";
    const dispatch = jest.fn();
    const actions = login(email, password);
    await actions(dispatch);

    const target = RequestTarget.Login;
    expect(dispatch).toBeCalledWith(startRequest(target));
    expect(api.login).toBeCalledWith(email, password);
    expect(dispatch).toBeCalledWith(setRole(UserRole.User));
    expect(dispatch).toBeCalledWith(finishRequest(target));
  });
});
