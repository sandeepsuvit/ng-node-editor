export interface Node {
  id: string;
  inputs: number;
  outputs: number;
  prevPosition: { x: number; y: number };
  currPosition: { x: number; y: number };
  inputEdges: Array<string>;
  outputEdges: Array<string>;
}

export interface NodeAddEvent {
  inputs: number;
  outputs: number;
}

export interface NodeDeleteEvent {
  id: string;
}

export interface NodeMouseDownEvent {
  id: string;
  x: number;
  y: number;
}

export interface NodeMouseEnterInputEvent {
  nodeId: string;
  index: number;
  inputX: number;
  inputY: number;
}

export interface NodeMouseLeaveInputEvent {
  nodeId: string;
  index: number;
}

export interface NodeMouseDownOutputEvent {
  nodeId: string;
  index: number;
  outputX: number;
  outputY: number;
}
