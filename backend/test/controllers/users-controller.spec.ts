import { UsersController } from "../../src/controllers/users-controller";
import { User } from "../../src/entities/user";
import { UserRole } from "../../src/entities/user-role";
import { IApplicationService } from "../../src/services/application-service";
import { IUserService } from "../../src/services/user-service";
import { MockedService } from "../services/mock";
import { MockApplicationService } from "../services/mock/mock-application-service";
import { MockUserService } from "../services/mock/mock-user-service";

describe("UsersController", () => {
  let userService: MockedService<IUserService>;
  let applicationService: MockedService<IApplicationService>;
  let controller: UsersController;

  beforeEach(async () => {
    userService = new MockUserService();
    applicationService = new MockApplicationService();
    controller = new UsersController(
      userService.instance,
      applicationService.instance,
    );
  });

  it("signs up users", async () => {
    expect.assertions(2);

    const email = "test@foo.bar";
    const password = "password";
    const firstName = "john";
    const lastName = "doe";

    const user = new User();
    user.email = email;
    userService.mocks.signup.mockResolvedValue(user);

    const response = await controller.signup({
      data: {
        firstName,
        lastName,
        email,
        password,
      },
    });

    expect(response.email).toEqual(email);
    expect(userService.mocks.signup).toBeCalledWith(
      firstName,
      lastName,
      email,
      password,
    );
  });

  it("handles invalid signup requests", async () => {
    expect.assertions(1);
    const firstName = "john";
    const lastName = "doe";

    userService.mocks.signup.mockRejectedValue(0);
    const promise = controller.signup({
      data: {
        firstName,
        lastName,
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
    (user as any).id = 1;
    userService.mocks.findUserWithCredentials.mockResolvedValue(user);

    userService.mocks.getUser.mockResolvedValue({
      firstName: "firstName",
      lastName: "lastName",
    });

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
    (user as any).id = 1;
    user.role = UserRole.Moderator;
    userService.mocks.findUserWithCredentials.mockResolvedValue(user);
    userService.mocks.generateLoginToken.mockReturnValue("token");
    userService.mocks.getUser.mockResolvedValue({
      firstName: "firstName",
      lastName: "lastName",
    });
    const response = await controller.login({
      data: {
        email: "test@foo.bar",
        password: "password",
      },
    });

    expect(response.user.role).toBe(UserRole.Moderator);
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

  it("returns a new token for the given user", async () => {
    expect.assertions(2);

    const token = "token";
    const role = UserRole.Moderator;
    const user = new User();
    user.role = role;
    userService.mocks.generateLoginToken.mockReturnValue(token);
    userService.mocks.getUser.mockResolvedValue({
      firstName: "firstname",
      lastName: "lastName",
    });
    const response = await controller.refreshLoginToken(user);
    expect(response.token).toBe(token);
    expect(response.user.role).toBe(role);
  });
});
