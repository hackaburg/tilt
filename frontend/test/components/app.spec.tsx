import { shallow } from "enzyme";
import * as React from "react";
import { UserRole } from "../../../types/roles";
import { App } from "../../src/components/app";
import { initialSettingsState } from "../../src/reducers/settings";

describe("App", () => {
  it("renders", () => {
    const boot = jest.fn();
    const app = shallow((
      <App
        settings={initialSettingsState.frontend}
        boot={boot}
        role={UserRole.User}
        history={{} as any}
        location={{} as any}
        match={{} as any}
        staticContext={{} as any}
      />
    ));

    expect(app).toMatchSnapshot();
  });
});
