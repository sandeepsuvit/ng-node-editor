export interface Edge {
  id: string;
  startId: string;
  endId: string;
  inputIndex: number;
  outputIndex: number;
  prevStartPosition: { x: number; y: number };
  currStartPosition: { x: number; y: number };
  prevEndPosition: { x: number; y: number };
  currEndPosition: { x: number; y: number };
}

export interface EdgeInputConnection {
  nodeId: string;
  index: number;
  inputX: number;
  inputY: number;
}
