import { Service, Token } from "typedi";
import { IService } from ".";
import { Question } from "../entities/question";

interface IQuestionGraphNode {
  question: Question;
  parentNode: IQuestionGraphNode | null;
  childNodes: IQuestionGraphNode[];
}

type QuestionID = Question["id"];

/**
 * A graph of parent and child questions.
 */
export type QuestionGraph = ReadonlyMap<QuestionID, IQuestionGraphNode>;

/**
 * A service to build question graphs.
 */
export interface IQuestionGraphService extends IService {
  /**
   * Generates a map containing a graph of the questions indexed by the
   * questions' reference names.
   * @param questions A list of questions to build a graph from
   */
  buildQuestionGraph(questions: readonly Question[]): QuestionGraph;
}

/**
 * A token used to inject a concrete question graph service.
 */
export const QuestionGraphServiceToken = new Token<IQuestionGraphService>();

@Service(QuestionGraphServiceToken)
export class QuestionGraphService implements IQuestionGraphService {
  /**
   * @inheritdoc
   */
  public async bootstrap(): Promise<void> {
    return;
  }

  /**
   * Validates that no child questions from this question reference a previous question.
   * @param node The current node in the graph
   * @param path All already seen nodes in this search
   */
  private throwOnCycleInNode(
    node: IQuestionGraphNode,
    path: IQuestionGraphNode[],
  ) {
    for (const child of node.childNodes) {
      if (path.includes(child)) {
        throw new CyclicQuestionGraphError([
          ...path.map(({ question: { id } }) => id),
          child.question.id,
        ]);
      }

      this.throwOnCycleInNode(child, [...path, child]);
    }
  }

  /**
   * Walks the graph to verify there are no cycles.
   * @param graph The graph to validate
   */
  private throwOnCycles(graph: QuestionGraph): void {
    for (const node of graph.values()) {
      this.throwOnCycleInNode(node, [node]);
    }
  }

  /**
   * @inheritdoc
   */
  public buildQuestionGraph(questions: readonly Question[]): QuestionGraph {
    const graph = new Map<QuestionID, IQuestionGraphNode>();

    for (const question of questions) {
      graph.set(question.id, {
        childNodes: [],
        parentNode: null,
        question,
      });
    }

    for (const question of questions) {
      const node = graph.get(question.id);
      const parentQuestionID = node?.question?.parentID;

      if (!node || parentQuestionID == null) {
        continue;
      }

      const parentNode = graph.get(parentQuestionID);

      if (!parentNode) {
        throw new InvalidQuestionGraphError();
      }

      if (node.parentNode != null) {
        throw new InvalidQuestionGraphError();
      }

      node.parentNode = parentNode;
      parentNode.childNodes.push(node);
    }

    this.throwOnCycles(graph);

    return graph;
  }
}

export class InvalidQuestionGraphError extends Error {
  constructor() {
    super("Question graph is malformed");
  }
}

export class CyclicQuestionGraphError extends Error {
  constructor(questionIDs: number[]) {
    super(`Cycle in question graph detected: ${questionIDs.join(" => ")}`);
  }
}
