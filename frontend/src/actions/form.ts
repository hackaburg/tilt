import { IAction } from ".";
import { FormType } from "../state";

/**
 * Form redux actions.
 */
export enum FormAction {
  SetType = "set_form_type",
}

/**
 * Creates an @see FormAction.SetType action.
 * @param type The type of the current form
 */
export const setFormType = (type: FormType): IAction<FormAction.SetType, FormType> => ({
  type: FormAction.SetType,
  value: type,
});

/**
 * Shorthand for `setFormType(FormType.None)`.
 */
export const resetFormType = () => setFormType(FormType.None);
