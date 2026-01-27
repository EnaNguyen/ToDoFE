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
  take,
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
  imports: [ToDoCreateModal, ToDoListTable, CommonModule, FormsModule, ReactiveFormsModule, ɵEmptyOutletComponent],
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
  //store Observable
  readonly todos$ = this.store.toDoItems$;
  readonly itemInPage$ = this.store.select((state) => state.itemInPage);
  readonly loading$ = this.store.isLoading$;
  readonly error$ = this.store.error$;
  readonly pageIndex$ = this.store.pageIndex$;
  readonly itemPerPage$ = this.store.itemPerPage$;
  readonly totalPages$ = this.store.totalPages$;
  
  readonly pageNumbers$ = combineLatest([
    this.pageIndex$,
    this.totalPages$
  ]).pipe(
    map(([currentPage, totalPages]) => {
      const pages = [];
      const maxPageLinks = 5;
      
      if (!totalPages) totalPages = 1;
      
      if (totalPages <= maxPageLinks) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        if (currentPage! > 3) pages.push(0);
        
        const start = Math.max(2, currentPage! - 1);
        const end = Math.min(totalPages - 1, currentPage! + 1);
        
        for (let i = start; i <= end; i++) {
          if (!pages.includes(i)) pages.push(i);
        }
        
        if (currentPage! < totalPages - 2) pages.push(0); 
        if (!pages.includes(totalPages)) pages.push(totalPages);
      }
      
      return pages;
    })
  );
  
  constructor() {}
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
  
  goToPage(page: number) {
    if (page !== 0) {
      this.store.setPageIndex(page);
    }
  }
  
  previousPage() {
    this.pageIndex$.pipe(take(1)).subscribe((currentPage) => {
      if (currentPage && currentPage > 1) {
        this.store.setPageIndex(currentPage - 1);
      }
    });
  }
  
  nextPage() {
    combineLatest([
      this.pageIndex$,
      this.totalPages$
    ]).pipe(take(1)).subscribe(([currentPage, totalPages]) => {
      if (currentPage && totalPages && currentPage < totalPages) {
        this.store.setPageIndex(currentPage + 1);
      }
    });
  }
}
