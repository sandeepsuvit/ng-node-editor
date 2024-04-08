import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Edge } from './edge.interface';

@Component({
  selector: 'app-edge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edge.component.html',
  styleUrl: './edge.component.scss',
})
export class EdgeComponent {
  // Edge selected
  @Input() selected = false;

  @Input() isNew!: boolean;
  @Input() edge!: Edge;

  // Edge events tiggers
  @Output() mouseDownEdgeEvent = new EventEmitter<string>();
  @Output() deleteEdgeEvent = new EventEmitter<string>();

  /**
   * Get the data co-ordinates for the edge
   *
   * @returns svg co-ordinates
   */
  getDataCoordiates(): string {
    // Extract the values from the selected edge
    const x0 = this.edge.currStartPosition.x;
    const y0 = this.edge.currStartPosition.y;
    const x1 = this.edge.currEndPosition.x;
    const y1 = this.edge.currEndPosition.y;

    return `M ${x0} ${y0} C ${
      // Represent the starting curvature
      x0 + this.calculateOffset(Math.abs(x1 - x0))
    } ${y0}, ${
      // Represent the ending curvature
      x1 - this.calculateOffset(Math.abs(x1 - x0))
    } ${y1}, ${x1} ${y1}`;
  }

  /**
   * Create the transform property for the edge delete button
   *
   * @returns css transforms
   */
  getTransforms(): string {
    // Fetch the middle position
    const middlePoint = {
      // TODO: Find a way to update this when the value changes
      x:
        this.edge.currStartPosition.x +
        (this.edge.currEndPosition.x - this.edge.currStartPosition.x) / 2,
      y:
        this.edge.currStartPosition.y +
        (this.edge.currEndPosition.y - this.edge.currStartPosition.y) / 2,
    };

    const tralsated = `translate(${middlePoint.x}, ${
      middlePoint.y - (this.selected ? 24 : 0)
    })`;

    // Get the translated value
    return tralsated;
  }

  /**
   * Fix edge styling to avoid overlaps
   *
   * @param value Number
   * @returns
   */
  private calculateOffset(value: number): number {
    return value / 2;
  }

  /**
   * Trigger to handle the mouse click on the edge
   *
   * @param $event Mouse event
   */
  handleOnMouseDownEdgeEvent($event: MouseEvent): void {
    // Disable click on board event
    $event.stopPropagation();
    this.mouseDownEdgeEvent.emit(this.edge.id);
  }

  /**
   * Trigger to handle the delete of the edge
   *
   * @param $event Mouse event
   */
  handleOnClickDeleteEdgeEvent($event: MouseEvent): void {
    // Disable click on board event
    $event.stopPropagation();
    this.deleteEdgeEvent.emit(this.edge.id);
  }
}
