import { UserRole } from "../../../types/roles";
import { setRole } from "../../src/actions/role";
import { roleReducer } from "../../src/reducers/role";

describe("roleReducer", () => {
  it("provides default state", () => {
    const state = roleReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("sets the user role", () => {
    const role = UserRole.Moderator;
    const state = roleReducer(UserRole.User, setRole(role));
    expect(state).toBe(role);
  });
});
