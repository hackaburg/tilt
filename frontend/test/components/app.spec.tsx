import { shallow } from "enzyme";
import * as React from "react";
import { UserRole } from "../../../types/roles";
import { App } from "../../src/components/app";

describe("App", () => {
  it("renders", () => {
    const boot = jest.fn();
    const app = shallow(
      <App
        settings={null}
        boot={boot}
        role={UserRole.User}
        history={{} as any}
        location={{} as any}
        match={{} as any}
        staticContext={{} as any}
      />,
    );

    expect(app).toMatchSnapshot();
  });
});
