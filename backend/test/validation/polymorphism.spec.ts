import { plainToClass } from "class-transformer";
import { ArrayType } from "../../src/validation/polymorphism";

/**
 * A test enum.
 */
enum BaseType {
  Cat = "cat",
  Dog = "dog",
  Giraffe = "giraffe",
}

interface IBase {
  name: string;
}

interface ICat extends IBase {
  type: BaseType.Cat;
}

class Cat implements ICat {
  public type!: BaseType.Cat;
  public name!: string;
}

interface IDog extends IBase {
  type: BaseType.Dog;
}

class Dog implements IDog {
  public type!: BaseType.Dog;
  public name!: string;
}

type IAnimals = ICat | IDog;

interface IHome {
  pets: IAnimals[];
}

class Home implements IHome {
  @ArrayType<IAnimals>((values) => values.map((value) => {
    switch (value.type) {
      case BaseType.Cat:
        return Cat;

      case BaseType.Dog:
        return Dog;
    }
  }))
  public pets!: IAnimals[];
}

describe("ArrayType decorator", () => {
  it("transforms based on the type parser", () => {
    const raw: IHome = {
      pets: [
        {
          name: "Cat",
          type: BaseType.Dog,
        },
        {
          name: "Dog",
          type: BaseType.Cat,
        },
      ],
    };

    const home = plainToClass(Home, raw);
    expect(home).toBeInstanceOf(Home);
    expect(home.pets).toHaveLength(2);
    expect(home.pets[0]).toBeInstanceOf(Dog);
    expect(home.pets[1]).toBeInstanceOf(Cat);
  });
});
