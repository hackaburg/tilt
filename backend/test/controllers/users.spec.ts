import { UserRole } from "../../../types/roles";
import { UsersController } from "../../src/controllers/users";
import { User } from "../../src/entities/user";
import { IUserService } from "../../src/services/user";
import { MockedService } from "../services/mock";
import { MockUserService } from "../services/mock/users";

describe("UsersController", () => {
  let userService: MockedService<IUserService>;
  let controller: UsersController;

  beforeEach(async () => {
    userService = new MockUserService();
    controller = new UsersController(userService.instance);
  });

  it("signs up users", async () => {
    expect.assertions(2);

    const email = "test@foo.bar";
    const password = "password";

    const user = new User();
    user.email = email;
    userService.mocks.signup.mockResolvedValue(user);

    const response = await controller.signup({
      data: {
        email,
        password,
      },
    });

    expect(response.email).toEqual(email);
    expect(userService.mocks.signup).toBeCalledWith(email, password);
  });

  it("handles invalid signup requests", async () => {
    expect.assertions(1);

    userService.mocks.signup.mockRejectedValue(0);
    const promise = controller.signup({
      data: {
        email: "test@foo.bar",
        password: "password",
      },
    });
    await expect(promise).rejects.toBeDefined();
  });

  it("verifies users with their token", async () => {
    expect.assertions(1);

    const token = "verify me pls";
    await controller.verify(token);
    expect(userService.mocks.verifyUserByVerifyToken).toBeCalledWith(token);
  });

  it("handles invalid verify requests", async () => {
    expect.assertions(1);

    userService.mocks.verifyUserByVerifyToken.mockRejectedValue(0);
    const promise = controller.verify("");
    await expect(promise).rejects.toBeDefined();
  });

  it("generates tokens for valid credentials", async () => {
    expect.assertions(1);

    const user = new User();
    user.id = 1;
    userService.mocks.findUserWithCredentials.mockResolvedValue(user);

    const token = "token";
    userService.mocks.generateLoginToken.mockReturnValue(token);
    const response = await controller.login({
      data: {
        email: "test@foo.bar",
        password: "password",
      },
    });

    expect(response.token).toBe(token);
  });

  it("returns the user's role on login", async () => {
    expect.assertions(1);

    const user = new User();
    user.id = 1;
    user.role = UserRole.Moderator;
    userService.mocks.findUserWithCredentials.mockResolvedValue(user);
    userService.mocks.generateLoginToken.mockReturnValue("token");
    const response = await controller.login({
      data: {
        email: "test@foo.bar",
        password: "password",
      },
    });

    expect(response.role).toBe(UserRole.Moderator);
  });

  it("throws on invalid credentials", async () => {
    expect.assertions(1);

    userService.mocks.findUserWithCredentials.mockResolvedValue(undefined);
    const promise = controller.login({
      data: {
        email: "test@foo.bar",
        password: "password",
      },
    });

    expect(promise).rejects.toBeDefined();
  });
});
