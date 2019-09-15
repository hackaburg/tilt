import "reflect-metadata";
import { Container } from "typedi";
import { Tilt } from "./services/tilt-service";

const tilt = Container.get(Tilt);
tilt.bootstrap();
