import { shallow } from "enzyme";
import * as React from "react";
import { App } from "../../src/components/app";

describe("App", () => {
  it("renders", () => {
    const app = shallow((
      <App />
    ));

    expect(app).toMatchSnapshot();
  });
});
