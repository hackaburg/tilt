import * as Enzyme from "enzyme";
import * as Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import "jest-date-mock";
import "jest-enzyme";

Enzyme.configure({
  adapter: new Adapter(),
});
