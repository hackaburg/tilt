import { shallow } from "enzyme";
import * as React from "react";
import { Message } from "../../src/components/message";

describe("Message", () => {
  it("renders error messages", () => {
    const element = shallow(<Message error>text</Message>);

    expect(element).toMatchSnapshot();
  });

  it("renders warning messages", () => {
    const element = shallow(<Message warn>text</Message>);

    expect(element).toMatchSnapshot();
  });
});
