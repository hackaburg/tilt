import { Column } from "typeorm";

export function Longtext() {
  // Sqlite doesn't support longtext. I hate this, but it is what it is if we want
  // to keep backend tests and prepare tilt for the upcoming Hackaburg as quickly
  // as possible.
  if (process.env.NODE_ENV === "test") {
    return Column("text");
  }
  return Column("longtext");
}
