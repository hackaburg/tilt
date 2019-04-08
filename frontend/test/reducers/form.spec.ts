import { resetFormType, setFormType } from "../../src/actions/form";
import { formReducer } from "../../src/reducers/form";
import { FormType } from "../../src/state";

describe("formReducer", () => {
  it("provides an initial state", () => {
    const state = formReducer(undefined, {} as any);
    expect(state).toBeDefined();
  });

  it("sets the form type", () => {
    const type = FormType.Login;
    const state = formReducer({ type: FormType.None }, setFormType(type));
    expect(state.type).toBe(type);
  });

  it("resets the form type", () => {
    const state = formReducer({ type: FormType.Login }, resetFormType());
    expect(state.type).toBe(FormType.None);
  });
});
