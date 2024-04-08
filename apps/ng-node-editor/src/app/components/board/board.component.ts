import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { EdgeComponent } from '../edge/edge.component';
import { Edge, EdgeInputConnection } from '../edge/edge.interface';
import { NodeComponent } from '../node/node.component';
import {
  Node,
  NodeAddEvent,
  NodeMouseDownEvent,
  NodeMouseDownOutputEvent,
  NodeMouseEnterInputEvent,
  NodeMouseLeaveInputEvent,
} from '../node/node.interface';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, ButtonComponent, NodeComponent, EdgeComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
})
export class BoardComponent implements OnInit {
  // Reference to the board wrapper element
  @ViewChild('boardWrapper', { static: true }) boardWrapperElemRef!: ElementRef;
  // Reference to the board element
  @ViewChild('board', { static: true }) boardElemRef!: ElementRef;

  // Global scale factor for the board
  scaleFactor = 1;

  // Handler for grabbing
  isGrabbing = false;

  // register for clicked position
  clickedPosition: { x: number; y: number } = { x: -1, y: -1 };

  // Selected node reference
  selectedNodeId: string | null = null;

  // All existing nodes
  nodes: Array<Node> = [];

  // New Node Edge reference
  newEdge: Edge | null = null;

  // Connection to an input node
  edgeInsideInput: EdgeInputConnection | null = null;

  // All existing edges
  edges: Array<Edge> = [];

  // Selected edge reference
  selectedEdgeId: string | null = null;

  ngOnInit(): void {
    this.registerOnMouseWheelEvent();
  }

  private registerOnMouseWheelEvent(): void {
    const boardElem = this.toNativeElem(this.boardElemRef);

    // Register wheel event listner
    boardElem.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        // Update scale
        this.scaleFactor = this.scaleFactor + event.deltaY * -0.005;

        // Restrict the scale
        this.scaleFactor = Math.min(Math.max(1, this.scaleFactor), 2);

        // Apply scale transforms
        boardElem.style.transform = `scale(${this.scaleFactor})`;
        boardElem.style.marginTop = `${(this.scaleFactor - 1) * 50}vh`;
        boardElem.style.marginLeft = `${(this.scaleFactor - 1) * 50}vw`;
      },
      { passive: false }
    );
  }

  /**
   * Convert angular element reference to HTML element
   *
   * @param elemRef Element reference
   * @returns
   */
  private toNativeElem(elemRef: ElementRef): HTMLElement {
    return elemRef.nativeElement;
  }

  /**
   * Trigger changes when user clicks on the board
   *
   * @param event Mouse event
   */
  handleOnMouseDownBoardEvent(event: MouseEvent): void {
    // Reset the selected node when mouse down on board
    this.selectedNodeId = null;
    // Reset the selected edge when mouse down on board
    this.selectedEdgeId = null;

    this.isGrabbing = true;
    this.clickedPosition = { x: event.x, y: event.y };
  }

  /**
   * Trigger changes when user mouse event completes
   *  - New node edge creation happens in this case
   *
   * @returns
   */
  handleOnMouseUpBoardEvent(): void {
    // Reset the clicked position
    this.clickedPosition = { x: -1, y: -1 };

    // stop grabbing of the board
    this.isGrabbing = false;

    // Reset if a new edge  is being set and not inside input region
    if (this.newEdge !== null && this.edgeInsideInput === null) {
      this.newEdge = null;
    }

    // Add to global edges if a new edge and is inside input region
    if (this.newEdge !== null && this.edgeInsideInput !== null) {
      const startingNodeId = this.newEdge.startId;
      const endingNodeId = this.edgeInsideInput.nodeId;

      // Get the starting node
      const startingNode = this.nodes.find(
        (node) => node.id === startingNodeId
      );
      // Get the ending node
      const endingNode = this.nodes.find((node) => node.id === endingNodeId);

      // Get the reference to the wrapper element
      const wrapperElem = this.toNativeElem(this.boardWrapperElemRef);

      if (startingNode && endingNode && wrapperElem) {
        // Unique id for the edges
        const edgeId = `edge_${startingNode.id}_${this.newEdge.outputIndex}_${endingNode.id}_${this.edgeInsideInput.index}`;

        // Check if we are create a duplicate connection with an already existing connection
        if (
          startingNode.outputEdges.includes(edgeId) &&
          endingNode.inputEdges.includes(edgeId)
        ) {
          this.newEdge = null;
          return;
        }

        // Extract the wrapper element values
        const { scrollLeft, scrollTop } = wrapperElem;

        // Update the output edges
        startingNode.outputEdges = [...startingNode.outputEdges, edgeId];

        // Update the input edges
        endingNode.inputEdges = [...endingNode.inputEdges, edgeId];

        // Update the previous start position
        this.newEdge.prevStartPosition = {
          x: (this.newEdge.currStartPosition.x + scrollLeft) / this.scaleFactor,
          y: (this.newEdge.currStartPosition.y + scrollTop) / this.scaleFactor,
        };

        // Update the previous end position
        this.newEdge.prevEndPosition = {
          x: (this.edgeInsideInput.inputX + scrollLeft) / this.scaleFactor,
          y: (this.edgeInsideInput.inputY + scrollTop) / this.scaleFactor,
        };

        // Update the current end position
        this.newEdge.currEndPosition = {
          x: (this.edgeInsideInput.inputX + scrollLeft) / this.scaleFactor,
          y: (this.edgeInsideInput.inputY + scrollTop) / this.scaleFactor,
        };

        // Add the new edge to the list of edges
        this.edges = [
          ...this.edges,
          {
            ...this.newEdge,
            // Update the new edge id here
            id: edgeId,
            endId: endingNode.id,
            // Update the input index
            inputIndex: this.edgeInsideInput.index,
          },
        ];

        // Deselect the new edge
        this.newEdge = null;
      }
    }
  }

  /**
   * Trigger event operations when mouse is moved over the board after clicking
   * - Updates the selected node position
   * - Updates the selected nodes edges position
   *
   * @param event Mouse event
   */
  handleOnMouseMoveBoardEvent(event: MouseEvent): void {
    // user has clicked somewhere
    if (this.clickedPosition.x >= 0 && this.clickedPosition.y >= 0) {
      const deltaX = event.x - this.clickedPosition.x;
      const deltaY = event.y - this.clickedPosition.y;

      // Check to see if the user has clicked on the node
      if (this.selectedNodeId != null) {
        // Get the selected node
        const node = this.nodes.find((node) => node.id === this.selectedNodeId);

        if (node) {
          // Update the node position
          node.currPosition = {
            x: (node.prevPosition.x + deltaX) / this.scaleFactor,
            y: (node.prevPosition.y + deltaY) / this.scaleFactor,
          };

          // Update the input edge positions
          for (let i = 0; i < node.inputEdges.length; i++) {
            const edgeId = node.inputEdges[i];
            const edge = this.edges.find((edge) => edge.id === edgeId);
            if (edge) {
              edge.currEndPosition = {
                x: (edge.prevEndPosition.x + deltaX) / this.scaleFactor,
                y: (edge.prevEndPosition.y + deltaY) / this.scaleFactor,
              };
            }
          }

          // Update the output edge positions
          for (let i = 0; i < node.outputEdges.length; i++) {
            const edgeId = node.outputEdges[i];
            const edge = this.edges.find((edge) => edge.id === edgeId);
            if (edge) {
              edge.currStartPosition = {
                x: (edge.prevStartPosition.x + deltaX) / this.scaleFactor,
                y: (edge.prevStartPosition.y + deltaY) / this.scaleFactor,
              };
            }
          }
        }
      } else {
        // User has clicked on the board
        // Get the reference to the wrapper element
        const wrapperElem = this.toNativeElem(this.boardWrapperElemRef);

        if (wrapperElem) {
          wrapperElem.scrollBy(-deltaX, -deltaY);
          this.clickedPosition = { x: event.x, y: event.y };
        }
      }
    }

    // User updates the existing edge position
    if (this.newEdge !== null) {
      // Get the reference to the wrapper element
      const wrapperElem = this.toNativeElem(this.boardWrapperElemRef);

      if (wrapperElem) {
        // Update the end position on mouse click and drag
        this.newEdge.currEndPosition = {
          x: (event.x + wrapperElem.scrollLeft) / this.scaleFactor,
          y: (event.y + wrapperElem.scrollTop) / this.scaleFactor,
        };
      }
    }
  }

  /**
   * Creating a new node
   *
   * @param addEvent Mouse event
   */
  handleOnClickNodeAddEvent(addEvent: NodeAddEvent): void {
    const randX = Math.random() * window.innerWidth;
    const randY = Math.random() * window.innerHeight;

    this.nodes = [
      // Existing list of nodes on the screen
      ...this.nodes,
      // Create a new node
      {
        id: `node_${Math.random().toString(36).substring(2, 8)}`,
        inputs: addEvent.inputs,
        outputs: addEvent.outputs,
        prevPosition: { x: randX, y: randY },
        currPosition: { x: randX, y: randY },
        // Initially these values will be empty
        inputEdges: [],
        outputEdges: [],
      },
    ];
  }

  /**
   * Remove an existing selected node
   *
   * @param $event boolean
   * @returns
   */
  handleOnClickNodeDeleteEvent($event: boolean): void {
    if ($event && this.selectedNodeId) {
      const node = this.nodes.find((node) => node.id === this.selectedNodeId);

      // Check if node exist
      if (!node) {
        this.selectedNodeId = null;
        return;
      }

      // Remove any output edges
      if (node.outputEdges.length > 0) {
        for (const edgeId of node.outputEdges) {
          this.handleOnDeleteEdgeEvent(edgeId);
        }
      }

      // Remove any input edges
      if (node.inputEdges.length > 0) {
        for (const edgeId of node.inputEdges) {
          this.handleOnDeleteEdgeEvent(edgeId);
        }
      }

      // Remove the reference node from the list
      this.nodes = this.nodes.filter((node) => node.id !== this.selectedNodeId);
      this.selectedNodeId = null;
    }
  }

  /**
   * Trigger event when mouse click happens on the node
   * - Updates the previous positions of the node
   * - Updates the previous positions of the edges
   *
   * @param $event Mouse event
   */
  handleOnMouseDownNodeEvent($event: NodeMouseDownEvent): void {
    console.log('handleOnMouseDownNodeEvent', $event);
    // Extract the event details
    const { id, x, y } = $event;

    // Reset the selected edge when mouse down on board
    this.selectedEdgeId = null;

    // Selected node
    this.selectedNodeId = id;
    // Update the clicked position on the board
    this.clickedPosition = { x, y };

    // Get the details of the selected node
    const node = this.nodes.find((node) => node.id === this.selectedNodeId);

    if (node) {
      // Update the node previous position
      node.prevPosition = {
        x: node.currPosition.x * this.scaleFactor,
        y: node.currPosition.y * this.scaleFactor,
      };

      // Update the input edge positions
      for (let i = 0; i < node.inputEdges.length; i++) {
        const edgeId = node.inputEdges[i];
        const edge = this.edges.find((edge) => edge.id === edgeId);
        if (edge) {
          edge.prevEndPosition = {
            x: edge.currEndPosition.x * this.scaleFactor,
            y: edge.currEndPosition.y * this.scaleFactor,
          };
        }
      }

      // Update the output edge positions
      for (let i = 0; i < node.outputEdges.length; i++) {
        const edgeId = node.outputEdges[i];
        const edge = this.edges.find((edge) => edge.id === edgeId);
        if (edge) {
          edge.prevStartPosition = {
            x: edge.currStartPosition.x * this.scaleFactor,
            y: edge.currStartPosition.y * this.scaleFactor,
          };
        }
      }
    }
  }

  /**
   * Trigger event operation when mouse is clicked on the node outputs
   * - This is the starting point of edge creation
   *
   * @param $event Custom event
   */
  handleOnMouseDownNodeOutputEvent($event: NodeMouseDownOutputEvent): void {
    console.log('handleOnMouseDownOutputEvent', $event);
    // Deselect the node
    this.selectedNodeId = null;

    // Extract from event
    const { nodeId, index, outputX, outputY } = $event;

    // Get the reference to the wrapper element
    const wrapperElem = this.toNativeElem(this.boardWrapperElemRef);

    if (wrapperElem) {
      // Extract from wrapper element
      const { scrollLeft, scrollTop } = wrapperElem;

      // Calculated positions
      const prevStartPosition = {
        x: (outputX + scrollLeft) / this.scaleFactor,
        y: (outputY + scrollTop) / this.scaleFactor,
      };

      const currStartPosition = {
        x: (outputX + scrollLeft) / this.scaleFactor,
        y: (outputY + scrollTop) / this.scaleFactor,
      };

      const prevEndPosition = {
        x: (outputX + scrollLeft) / this.scaleFactor,
        y: (outputY + scrollTop) / this.scaleFactor,
      };

      const currEndPosition = {
        x: (outputX + scrollLeft) / this.scaleFactor,
        y: (outputY + scrollTop) / this.scaleFactor,
      };

      // Create the new edge
      this.newEdge = {
        id: '',
        startId: nodeId,
        outputIndex: index,
        endId: '',
        inputIndex: -1,
        prevStartPosition,
        currStartPosition,
        prevEndPosition,
        currEndPosition,
      };
    }
  }

  /**
   * Trigger event operation when edge connections are made from output node to input node
   * - Update to the input made here
   *
   * @param $event Custom event
   */
  handleOnMouseEnterNodeInputEvent($event: NodeMouseEnterInputEvent): void {
    console.log('handleOnMouseEnterInputEvent', $event);

    // Extract the event values
    const { nodeId, index, inputX, inputY } = $event;

    // Update the edge input when drag ends on an input edge
    this.edgeInsideInput = {
      nodeId,
      index,
      inputX,
      inputY,
    };
  }

  /**
   * Trigger operation when mouse leaves the input of any node
   * - Here we reset the edge that is newly created
   *
   * @param $event Custom event
   */
  handleOnMouseLeaveNodeInputEvent($event: NodeMouseLeaveInputEvent): void {
    console.log('handleOnMouseLeaveInputEvent', $event);

    // Extract the event values
    const { nodeId, index } = $event;

    // Reset the edge selection
    if (
      this.edgeInsideInput?.nodeId === nodeId &&
      this.edgeInsideInput.index === index
    ) {
      this.edgeInsideInput = null;
    }
  }

  /**
   * Trigger operation when mouse click happens on the edge
   * - Here we choose the selected edge
   *
   * @param edgeId Edge id
   */
  handleOnMouseDownEdgeEvent(edgeId: string): void {
    // Deselect node
    this.selectedNodeId = null;

    // Updated the selected edge
    this.selectedEdgeId = edgeId;
  }

  /**
   * Trigger operation when delete button is clicked on the selected edge
   * - Here we remove connects of the edge from the node and removes the node itself
   *
   * @param edgeId Edge id
   */
  handleOnDeleteEdgeEvent(edgeId: string): void {
    const edge = this.edges.find((edge) => edge.id === edgeId);
    if (edge) {
      // Delete the edge from the start node
      const startingNode = this.nodes.find((node) => node.id == edge.startId);
      if (startingNode) {
        startingNode.outputEdges = [
          ...startingNode.outputEdges.filter((edgeId) => edgeId !== edge.id),
        ];
      }

      // Delete the edge from the end node
      const endingNode = this.nodes.find((node) => node.id === edge.endId);
      if (endingNode) {
        endingNode.inputEdges = [
          ...endingNode.inputEdges.filter((edgeId) => edgeId !== edge.id),
        ];
      }

      // Delete the edges from the global edges
      this.edges = [...this.edges.filter((edge) => edge.id !== edgeId)];
    }
  }
}
