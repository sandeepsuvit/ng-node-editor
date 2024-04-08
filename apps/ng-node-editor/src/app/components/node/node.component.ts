import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  Node,
  NodeMouseDownEvent,
  NodeMouseDownOutputEvent,
  NodeMouseEnterInputEvent,
  NodeMouseLeaveInputEvent,
} from './node.interface';

@Component({
  selector: 'app-node',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './node.component.html',
  styleUrl: './node.component.scss',
})
export class NodeComponent {
  // Reference node
  @Input() node!: Node;

  // Node selected
  @Input() selected = false;

  // Node event triggers
  @Output() mouseDownNodeEvent = new EventEmitter<NodeMouseDownEvent>();
  @Output() mouseEnterNodeInputEvent =
    new EventEmitter<NodeMouseEnterInputEvent>();
  @Output() mouseDownNodeOutputEvent =
    new EventEmitter<NodeMouseDownOutputEvent>();
  @Output() mouseLeaveNodeInputEvent =
    new EventEmitter<NodeMouseLeaveInputEvent>();

  /**
   * Create the transform property for the node
   *
   * @returns
   */
  getTransforms(): string {
    return `translate(${this.node.currPosition.x}px, ${this.node.currPosition.y}px)`;
  }

  /**
   * Create an array from the number passed
   *
   * @param number Number of elements for the array
   * @returns
   */
  toArrayOfNumbers(number: number): Array<number> {
    return [...Array(Number(number))];
  }

  /**
   * Trigger action when mouse is clicked on the node
   *
   * @param event Mouse event
   */
  handleOnMouseDown(event: MouseEvent): void {
    // Prevert the click on board
    event.stopPropagation();

    // Publish the current node position
    this.mouseDownNodeEvent.emit({
      id: this.node.id,
      // Get the co-ordinates from the mouse event
      x: event.x,
      y: event.y,
    });
  }

  /**
   * Trigger action when mouse enters the input node
   *
   * @param inputRefElem Reference of the element
   * @param index
   */
  handleMouseEnterInput(inputRefElem: HTMLElement, index: number): void {
    const centerX =
      inputRefElem.getBoundingClientRect().left +
      Math.abs(
        inputRefElem.getBoundingClientRect().right -
          inputRefElem.getBoundingClientRect().left
      ) /
        2;

    const centerY =
      inputRefElem.getBoundingClientRect().top +
      Math.abs(
        inputRefElem.getBoundingClientRect().bottom -
          inputRefElem.getBoundingClientRect().top
      ) /
        2;

    // Publish the input position
    this.mouseEnterNodeInputEvent.emit({
      nodeId: this.node.id,
      index,
      inputX: centerX,
      inputY: centerY,
    });
  }

  /**
   * Trigger action when mouse leaves the input node
   *
   * @param index Index of the node
   */
  handleMouseLeaveInput(index: number): void {
    // Publish the input position
    this.mouseLeaveNodeInputEvent.emit({
      nodeId: this.node.id,
      index,
    });
  }

  /**
   * Trigger action when mouse click happens on the output node
   *
   * @param outputRefElem Reference element
   * @param event Mouse event
   * @param index Index of the node
   */
  handleMouseDownOutput(
    outputRefElem: HTMLElement,
    event: MouseEvent,
    index: number
  ): void {
    // Disable drag node (so it wont trigger board events)
    event.stopPropagation();

    const centerX =
      outputRefElem.getBoundingClientRect().left +
      Math.abs(
        outputRefElem.getBoundingClientRect().right -
          outputRefElem.getBoundingClientRect().left
      ) /
        2;

    const centerY =
      outputRefElem.getBoundingClientRect().top +
      Math.abs(
        outputRefElem.getBoundingClientRect().bottom -
          outputRefElem.getBoundingClientRect().top
      ) /
        2;

    // Publish the output position
    this.mouseDownNodeOutputEvent.emit({
      nodeId: this.node.id,
      index,
      outputX: centerX,
      outputY: centerY,
    });
  }
}
