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
  Subscription,
} from 'rxjs';
import { TodoStore } from './to-do-store';
import { ToDoCreateModal } from './to-do.create';
import { ToDoListTable } from './to-do-list';
import {} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateRange } from './to-do-store';
@Component({
  selector: 'app-to-do',
  standalone: true,
  imports: [HttpClientModule, ToDoCreateModal, ToDoListTable, CommonModule],
  templateUrl: './to-do.html',
  styleUrl: './to-do.scss',
  providers: [TodoStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToDoAdminComponent implements OnInit {
  private readonly store = inject(TodoStore);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('statusToDo') statusInput!: ElementRef<HTMLSelectElement>;
  @ViewChild('minDateInput') minDateInput!: ElementRef<HTMLInputElement>;
  @ViewChild('maxDateInput') maxDateInput!: ElementRef<HTMLInputElement>;
  readonly todos$ = this.store.toDoItems$;
  readonly loading$ = this.store.isLoading$;
  readonly error$ = this.store.error$;

  constructor() {
    afterNextRender(() => {
      if (this.searchInput?.nativeElement) {
        const subSearch = fromEvent(this.searchInput.nativeElement, 'input')
          .pipe(
            map((e: Event) => (e.target as HTMLInputElement).value.trim()),
            distinctUntilChanged(),
            debounceTime(300),
          )
          .subscribe((query) => this.store.searchToDo(query));

        this.destroyRef.onDestroy(() => subSearch.unsubscribe());
      } else {
        console.warn('Không tìm thấy #searchInput');
        return;
      }
      if (this.statusInput?.nativeElement) {
        const subStatus = fromEvent(this.statusInput.nativeElement, 'change')
          .pipe(map(() => this.statusInput.nativeElement.value))
          .subscribe((value) => {
            let filterValue: boolean | null = null;

            if (value === '1') filterValue = true;
            else if (value === '-1') filterValue = false;
            this.store.filterStatus(filterValue);
          });
        this.destroyRef.onDestroy(() => subStatus.unsubscribe());
      } else {
        console.warn('Không tìm thấy #statusInput');
        return;
      }
      if (!this.minDateInput || !this.maxDateInput) {
        console.warn('Không tìm thấy #statusInput');
        return;
      } else {
        const minDate$ = fromEvent(this.minDateInput.nativeElement, 'change').pipe(
          map(() => this.minDateInput.nativeElement.value as string),
          distinctUntilChanged(),
        );
        const maxDate$ = fromEvent(this.maxDateInput.nativeElement, 'change').pipe(
          map(() => this.maxDateInput.nativeElement.value as string),
          distinctUntilChanged(),
        );
        const dateRange$ = merge(minDate$, maxDate$).pipe(
          debounceTime(300),
          map(() => ({
            minDate: this.minDateInput.nativeElement.value || '',
            maxDate: this.maxDateInput.nativeElement.value || '',
          } as DateRange)),
        );
        const subDueDate = dateRange$.subscribe(range => {
          this.store.filterDateRange(range);
        })
        this.destroyRef.onDestroy(()=>subDueDate.unsubscribe());
      }
    });
  }
  ngOnInit() {
    this.store.loadToDos();
  }
}
