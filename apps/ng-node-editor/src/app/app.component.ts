import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BoardComponent } from './components/board/board.component';

@Component({
  standalone: true,
  imports: [RouterModule, BoardComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'ng-node-editor';
}
