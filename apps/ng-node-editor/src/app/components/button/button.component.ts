import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NodeAddEvent } from '../node/node.interface';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent implements OnInit {
  @Input() showDelete!: boolean;

  // Button Event triggers
  @Output() nodeAddedEvent = new EventEmitter<NodeAddEvent>();
  @Output() nodeDeleteEvent = new EventEmitter<boolean>(false);

  isOpen = false;

  // Reference to the add new node form
  addNodeFrm!: FormGroup;

  constructor(private formBuilder: FormBuilder) {}

  get inputControl() {
    return this.addNodeFrm.get('inputs') as FormControl;
  }

  get outputControl() {
    return this.addNodeFrm.get('outputs') as FormControl;
  }

  ngOnInit(): void {
    this.initAddNodeFrm();
  }

  /**
   * Initialize the form
   */
  private initAddNodeFrm() {
    this.addNodeFrm = this.formBuilder.group({
      inputs: [1, [Validators.min(1), Validators.max(4)]],
      outputs: [1, [Validators.min(1), Validators.max(4)]],
    });
  }

  /**
   * Handle add action
   */
  onClickAdd(): void {
    this.isOpen = !this.isOpen;

    // Reset the form after add operation
    this.initAddNodeFrm();
  }

  /**
   * Handle delete action
   */
  onClickDelete(): void {
    this.nodeDeleteEvent.emit(true);
  }

  /**
   * Handle submit of the form
   *
   * @returns
   */
  onSubmitAddNode(): void {
    // Validation rules - limit the number of inputs and outputs to 4
    if (
      this.inputControl.value > 4 ||
      this.inputControl.value <= 0 ||
      this.outputControl.value > 4 ||
      this.outputControl.value <= 0
    ) {
      return;
    }

    // Call to trigger the board for creating the node
    this.nodeAddedEvent.emit(this.addNodeFrm.getRawValue());

    // Close the dropdown after successfull add
    this.isOpen = false;

    // Reset the form after add operation
    this.initAddNodeFrm();
  }

  /**
   * Handle close of the dropdown
   */
  onCloseDropdown() {
    // Close the dropdown
    this.isOpen = false;

    // Reset the form
    this.initAddNodeFrm();
  }
}
