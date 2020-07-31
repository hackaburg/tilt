import { Question } from "../../src/entities/question";
import {
  IQuestionGraphService,
  QuestionGraphService,
} from "../../src/services/question-service";

describe("QuestionGraphService", () => {
  let service: IQuestionGraphService;

  const createQuestion = (id: number, parent?: Question): Question => {
    const question = new Question();
    (question as any).id = id;
    question.parentID = parent?.id ?? null;
    return question;
  };

  beforeEach(async () => {
    service = new QuestionGraphService();
    await service.bootstrap();
  });

  it("builds graphs", () => {
    const question1 = createQuestion(1);
    const question2 = createQuestion(2);
    const question3 = createQuestion(3);

    const question4 = createQuestion(4, question1);
    const question5 = createQuestion(5, question2);

    const question6 = createQuestion(6, question4);
    const question7 = createQuestion(7, question6);
    const question8 = createQuestion(8, question6);

    const questions = [
      question1,
      question2,
      question3,
      question4,
      question5,
      question6,
      question7,
      question8,
    ];

    const graph = service.buildQuestionGraph(questions);

    const allNodes = [...graph.values()];
    expect(allNodes).toHaveLength(questions.length);

    const node4 = graph.get(question4.id);
    expect(node4).toBeDefined();
    expect(node4?.childNodes).toHaveLength(1);
    expect(node4?.parentNode?.question.id).toBe(question4.parentID);

    const node6 = graph.get(question6.id);
    expect(node6).toBeDefined();
    expect(node6?.parentNode?.question.id).toBe(question4.id);
    expect(node6?.childNodes).toHaveLength(2);
    expect(node6?.childNodes[0].question.id).toBe(question7.id);
    expect(node6?.childNodes[1].question.id).toBe(question8.id);
  });

  it("detects cycles", () => {
    const question1 = createQuestion(1);
    const question2 = createQuestion(2, question1);
    const question3 = createQuestion(3, question2);
    const question4 = createQuestion(4, question3);

    // 1 => 2 => 3 => 4 => 1
    question1.parentID = question4.id;

    const questions = [question1, question2, question3, question4];
    expect(() => service.buildQuestionGraph(questions)).toThrow();
  });

  it("throws on invalid graphs", () => {
    const question1 = createQuestion(1);
    const question2 = createQuestion(2, question1);

    // question1 is an unknown question
    const questions = [question2];
    expect(() => service.buildQuestionGraph(questions)).toThrow();
  });
});
