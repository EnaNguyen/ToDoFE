import {
  Component,
  inject,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  DestroyRef,
  afterNextRender,
} from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import {
  interval,
  Observable,
  fromEvent,
  distinctUntilChanged,
  map,
  debounceTime,
  merge,
  combineLatest,
} from 'rxjs';
import { TodoStore } from './to-do.store';
import { ToDoCreateModal } from './to-do.create';
import { ToDoListTable } from './to-do.list';
import {} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRange } from './to-do.store';
import { SelectionFilter } from './models/to-do.model';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { ɵEmptyOutletComponent } from '@angular/router';
@Component({
  selector: 'app-to-do',
  standalone: true,
  imports: [ToDoCreateModal, ToDoListTable, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './to-do.html',
  styleUrl: './to-do.scss',
  providers: [TodoStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDoAdminComponent implements OnInit {
  private readonly store = inject(TodoStore);
  private readonly destroyRef = inject(DestroyRef);
  FilterSection = new FormGroup({
    SearchInput: new FormControl(''),
    StatusInput: new FormControl('0'),
    MinDateInput: new FormControl(''),
    MaxDateInput: new FormControl(''),
    PreviousPage: new FormControl(''),
    NextPage: new FormControl(''),
    PageIndex: new FormControl('1'),
    ItemsPerPage: new FormControl('10'),
  });

  readonly todos$ = this.store.toDoItems$;
  readonly loading$ = this.store.isLoading$;
  readonly error$ = this.store.error$;
  readonly numberPage$ = this.store.pageAmount$;
  readonly pageIndex$ = this.store.pageIndex$;
  readonly itemPerPage$ = this.store.itemPerPage$;
  constructor() {

  }
  ngOnInit() {
    this.store.loadToDos();
    this.FilterSection.get('SearchInput')
      ?.valueChanges.pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.store.filterSearchQueue(value || '');
      });
    this.FilterSection.get('StatusInput')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        this.store.filterSelectionQueue({ value: value || '', target: 'isCompleted' });
      });
    combineLatest([
      this.FilterSection.get('MinDateInput')!.valueChanges,
      this.FilterSection.get('MaxDateInput')!.valueChanges,
    ])
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(([minDate, maxDate]) => {
        this.store.filterDateRangeQueue({
          minDate: minDate || '',
          maxDate: maxDate || '',
        });
      });
    this.FilterSection.get('ItemsPerPage')
      ?.valueChanges.pipe(distinctUntilChanged())
      .subscribe((value) => {
        console.log('ItemsPerPage changed: ' + value);
        this.store.itemPerPageUpdate(parseInt(value || '10'));
      });
  }
}
