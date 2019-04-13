import { shallow } from "enzyme";
import * as React from "react";
import { App } from "../../src/components/app";
import { initialSettingsState } from "../../src/reducers/settings";

describe("App", () => {
  it("renders", () => {
    const fetchRole = jest.fn();
    const fetchSettings = jest.fn();
    const app = shallow((
      <App settings={initialSettingsState.frontend} fetchSettings={fetchSettings} fetchRole={fetchRole} />
    ));

    expect(app).toMatchSnapshot();
  });
});
