import { render } from "enzyme";
import * as React from "react";
import { ChoicesQuestion } from "../../src/components/forms/choices-question";

describe("ChoicesQuestion", () => {
  const choices = ["foo", "bar", "foobar"];

  it("renders a select", () => {
    const component = render(
      <ChoicesQuestion
        question={
          {
            configuration: {
              choices,
              displayAsDropdown: true,
            },
          } as any
        }
        selected={[]}
        onSelectedChanged={jest.fn()}
      />,
    );

    const select = component.find("select");
    expect(select.length).toBe(1);
  });

  it("renders checkboxes", () => {
    const component = render(
      <ChoicesQuestion
        question={
          {
            configuration: {
              allowMultiple: true,
              choices,
            },
          } as any
        }
        selected={[]}
        onSelectedChanged={jest.fn()}
      />,
    );

    const select = component.find("input[type='checkbox']");
    expect(select.length).toBe(3);
  });

  it("renders radios", () => {
    const component = render(
      <ChoicesQuestion
        question={
          {
            configuration: {
              choices,
            },
          } as any
        }
        selected={[]}
        onSelectedChanged={jest.fn()}
      />,
    );

    const select = component.find("input[type='radio']");
    expect(select.length).toBe(3);
  });
});
