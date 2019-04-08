import { finishLogin, login, startLogin } from "../../src/actions/login";
import { StaticApi } from "../../src/api/static-api";

describe("login actions", () => {
  const api = new StaticApi();

  it("asynchronously logs the user in", async () => {
    expect.assertions(2);

    const email = "email";
    const password = "password";
    await api.login(email, password);

    const dispatch = jest.fn();
    const actions = login(email, password);
    await actions(dispatch);

    expect(dispatch).toBeCalledWith(startLogin());
    expect(dispatch).toBeCalledWith(finishLogin());
  });
});
