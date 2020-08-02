import { shallow } from "enzyme";
import * as React from "react";
import { Button } from "../../src/components/base/button";

describe("Button", () => {
  it("renders the given text inside the button", () => {
    const text = "test";
    const element = shallow(<Button>{text}</Button>);

    expect(element).toHaveText(text);
  });

  it("handles click events", () => {
    const callback = jest.fn();
    const element = shallow(<Button onClick={callback}>Text</Button>);

    element.simulate("click");
    expect(callback).toBeCalled();
  });

  it("respects the disable prop", () => {
    const callback = jest.fn();
    const element = shallow(
      <Button onClick={callback} disable>
        Text
      </Button>,
    );

    element.simulate("click");
    expect(callback).not.toBeCalled();
  });

  it("respects the loading prop", () => {
    const callback = jest.fn();
    const element = shallow(
      <Button onClick={callback} loading>
        Text
      </Button>,
    );

    element.simulate("click");
    expect(callback).not.toBeCalled();
  });
});
