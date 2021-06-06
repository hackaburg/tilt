import * as Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import * as Enzyme from "enzyme";
import "jest-date-mock";
import "jest-enzyme";

Enzyme.configure({
  adapter: new Adapter(),
});
