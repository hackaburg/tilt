const fortunes = [
  "get some sleep",
  "it's late, why don't you do this tomorrow",
  "I don't want to do this now either",
  "your free trial has expired",
  "undefined",
  "TypeError: undefined is not a function",
  "^C^C^C^C",
  ":wq",
];

/**
 * Returns a random fortune, used to display as mock text.
 */
export const randomFortune = () => {
  const index = Math.floor(fortunes.length * Math.random());
  return fortunes[index];
};
