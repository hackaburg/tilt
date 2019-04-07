const createStyledComponentsTransformer = require("typescript-plugin-styled-components").default;
const transformer = createStyledComponentsTransformer();

module.exports = () => ({
  before: [
    transformer,
  ],
});
