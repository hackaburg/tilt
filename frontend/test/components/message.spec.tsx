import { shallow } from "enzyme";
import * as React from "react";
import { Message } from "../../src/components/base/message";

describe("Message", () => {
  it("renders error messages", () => {
    const element = shallow(<Message type="error">text</Message>);

    expect(element).toMatchSnapshot();
  });

  it("renders warning messages", () => {
    const element = shallow(<Message type="warning">text</Message>);

    expect(element).toMatchSnapshot();
  });
});
