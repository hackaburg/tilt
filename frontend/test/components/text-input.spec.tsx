import { mount, render } from "enzyme";
import * as React from "react";
import { TextInput, TextInputType } from "../../src/components/text-input";

const generateEvent = (value: string) => ({
  target: {
    value,
  },
});

describe("TextInput", () => {
  it("renders a textarea", () => {
    const component = render((
      <TextInput
        type={TextInputType.Area}
        value=""
        onChange={jest.fn()}
      />
    ));

    const area = component.find("textarea");
    expect(area).toHaveLength(1);
  });

  it("renders a text input for no type", () => {
    const component = render((
      <TextInput
        value=""
        onChange={jest.fn()}
      />
    ));

    const input = component.find("input[type='text']");
    expect(input).toHaveLength(1);
  });

  it("renders a text input", () => {
    const component = render((
      <TextInput
        type={TextInputType.Text}
        value=""
        onChange={jest.fn()}
      />
    ));

    const input = component.find("input[type='text']");
    expect(input).toHaveLength(1);
  });

  it("renders a password input", () => {
    const component = render((
      <TextInput
        type={TextInputType.Password}
        value=""
        onChange={jest.fn()}
      />
    ));

    const input = component.find("input[type='password']");
    expect(input).toHaveLength(1);
  });

  it("renders a number input", () => {
    const component = render((
      <TextInput
        type={TextInputType.Number}
        value=""
        onChange={jest.fn()}
      />
    ));

    const input = component.find("input[type='number']");
    expect(input).toHaveLength(1);
  });

  it("parses the input for number inputs", () => {
    const onChange = jest.fn();
    const component = mount((
      <TextInput
        type={TextInputType.Number}
        value=""
        onChange={onChange}
      />
    ));

    const input = component.find("input");
    input.simulate("change", generateEvent("10"));
    expect(onChange).toBeCalledWith(10);
  });

  it("leaves the input for regular inputs untouched", () => {
    const onChange = jest.fn();
    const component = mount((
      <TextInput
        value=""
        onChange={onChange}
      />
    ));

    const input = component.find("input");
    const value = "foo";
    input.simulate("change", generateEvent(value));
    expect(onChange).toBeCalledWith(value);
  });
});
