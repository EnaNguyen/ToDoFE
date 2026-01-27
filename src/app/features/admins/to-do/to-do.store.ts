import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Observable, range, of, debounceTime, distinctUntilChanged, filter, Subject } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  CreateToDo,
  SelectionFilter,
  ToDoFilter,
  ToDoResponse,
  UpdateToDo,
} from './models/to-do.model';
import { formatDate, compareDates } from '../../../shared/utils/date.utils';
export interface TodoItem {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  dueDate: string;
  fullName: string;
}
export interface DateRange {
  minDate: string;
  maxDate: string;
}
export interface TodoState {
  toDoItems: TodoItem[];
  allToDoItems: TodoItem[];
  isLoading: boolean;
  filter: ToDoFilter | null;
  error: string | null;
  itemsPerPage?: number;
  pageIndex?: number;
  itemInPage: TodoItem[];
  totalPages?: number;
}

const initialState: TodoState = {
  toDoItems: [],
  allToDoItems: [],
  isLoading: false,
  filter: {
    searchInput: '',
  },
  error: null,
  itemsPerPage: 5,
  pageIndex: 1,
  itemInPage: [],
  totalPages: 1,
};
@Injectable()
export class TodoStore extends ComponentStore<TodoState> {
  private filterTrigger$ = new Subject<ToDoFilter>();

  constructor() {
    super(initialState);
    this.setupFilterChangeListener();
  }

  private readonly setupFilterChangeListener = () => {
    this.filterTrigger$
      .pipe(
        debounceTime(350),
        distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
        tap((filter) => {
          console.log('Filter changed, fetching:', filter);
          this.filterServer(filter);
        }),
      )
      .subscribe();
  };
  private readonly http = inject(HttpClient);
  readonly toDoItems$: Observable<TodoItem[]> = this.select((state) => state.toDoItems);
  readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
  readonly error$: Observable<string | null> = this.select((state) => state.error);
  readonly queue$: Observable<ToDoFilter | null> = this.select((state) => state.filter);
  readonly pageIndex$: Observable<number | null> = this.select((state) => state.pageIndex!);
  readonly itemPerPage$: Observable<number | null> = this.select((state) => state.itemsPerPage!);
  readonly totalPages$: Observable<number | null> = this.select((state) => state.totalPages!);
  readonly setToDos = this.updater((state, toDoItems: TodoItem[]) => {
    const newFilter: ToDoFilter = {
      ...state.filter,
      searchInput: state.filter?.searchInput || '',
      itemPerPage: 10,
      pageIndex: 1,
    };
    this.filterTrigger$.next(newFilter);
    return {
      ...state,
      toDoItems,
      allToDoItems: toDoItems,
      isLoading: false,
      error: null,
    };
  });
  readonly paginationToDos = this.updater((state, response: ToDoResponse) => {
    return {
      ...state,
      toDoItems: response.toDoItems,
      allToDoItems: response.toDoItems,
      isLoading: false,
      error: null,
      itemsPerPage: response.itemsPerPage || response.itemPerPage || 10,
      pageIndex: response.pageIndex || response.currentPage + 1 || 1,
      totalPages: response.totalPages || response.toTalPages || 1,
      itemInPage: response.itemInPage,
    };
  });
  readonly addToDo = this.updater((state, newToDo: TodoItem) => ({
    ...state,
    toDoItems: [...state.toDoItems, newToDo],
    isLoading: false,
    error: null,
  }));
  readonly updateToDo = this.updater((state, updatedItem: TodoItem) => ({
    ...state,
    toDoItems: state.toDoItems.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    isLoading: false,
    error: null,
  }));
  readonly removeToDo = this.updater((state, id: number) => ({
    ...state,
    toDoItems: state.toDoItems.filter((todo) => todo.id !== id),
    isLoading: false,
    error: null,
  }));
  readonly statusChange = this.updater((state, id: number) => {
    const updatedItems = state.allToDoItems.map((item) =>
      item.id === id ? { ...item, isCompleted: !item.isCompleted } : item,
    );
    return {
      ...state,
      allToDoItems: updatedItems,
      toDoItems: updatedItems,
      isLoading: false,
      error: null,
    };
  });
  readonly setError = this.updater((state, error: string) => ({
    ...state,
    isLoading: false,
    error,
  }));
  readonly itemPerPageUpdate = this.updater<number>((state, itemsPerPageVariable: number) => {
    console.log('Updater called with:', itemsPerPageVariable);
    const newFilter: ToDoFilter = {
      ...state.filter,
      searchInput: state.filter?.searchInput || '',
      itemPerPage: itemsPerPageVariable,
      pageIndex: 1,
    };
    this.filterTrigger$.next(newFilter);
    return {
      ...state,
      itemsPerPage: itemsPerPageVariable,
      filter: newFilter,
      pageIndex: 1,
    };
  });
  readonly setPageIndex = this.updater((state, newPage: number) => {
    if (!state.filter) {
      return state;
    }
    const newFilter: ToDoFilter = {
      ...state.filter,
      pageIndex: newPage,
    };
    this.filterTrigger$.next(newFilter);
    return {
      ...state,
      pageIndex: newPage,
      filter: newFilter,
    };
  });
  readonly filterSearchQueue = this.updater<string>((state, query$) => {
    console.log('Filtering with query:', query$);
    const newFilter = {
      ...state.filter,
      searchInput: query$,
    };
    this.filterTrigger$.next(newFilter as ToDoFilter);
    const test = {
      ...state,
      toDoItems: state.allToDoItems,
      isLoading: false,
      error: null,
      filter: newFilter,
    };
    console.log(test);
    return test;
  });
  readonly filterDateRangeQueue = this.updater((state, dateRange: DateRange) => {
    let beginDate = new Date().toString();
    let endDate = new Date().toString();

    if (dateRange.minDate) {
      beginDate = formatDate(dateRange.minDate);
    }
    if (dateRange.maxDate) {
      endDate = formatDate(dateRange.maxDate);
    }

    let newFilter = { ...state.filter } as ToDoFilter;

    if (dateRange.minDate && dateRange.maxDate) {
      if (state.filter?.rangeFilters) {
        const updatedRanges = state.filter.rangeFilters.map((range) => {
          if (range.target === 'DueDate') {
            return {
              ...range,
              start: beginDate,
              end: endDate,
              whichType: 'date',
              target: 'DueDate',
            };
          }
          return range;
        });
        newFilter = {
          ...state.filter,
          searchInput: state.filter.searchInput,
          rangeFilters: updatedRanges,
        };
      } else {
        newFilter = {
          ...state.filter,
          searchInput: state.filter?.searchInput || '',
          rangeFilters: [
            {
              target: 'DueDate',
              start: beginDate,
              end: endDate,
              whichType: 'date',
            },
          ],
        };
      }
      this.filterTrigger$.next(newFilter);
      return {
        ...state,
        filter: newFilter,
      };
    }
    return state;
  });
  readonly filterStatusQueue = this.updater((state, stat: boolean | null) => {
    if (state.filter?.comboboxes) {
      return {
        ...state,
        filter: {
          ...state.filter,
          searchInput: state.filter?.searchInput || '',
          comboboxes: state.filter.comboboxes.map((cb) => {
            if (cb.label === 'isCompleted') {
              return {
                ...cb,
                value: stat === null ? '' : stat ? 'true' : 'false',
              };
            }
            return cb;
          }),
        },
      };
    }
    return state;
  });
  readonly filterSelectionQueue = this.updater((state, selection: SelectionFilter) => {
    console.log('Selection Filter:', selection);
    let newFilter = { ...state.filter } as ToDoFilter;

    if (state.filter?.selections) {
      const updatedSelections = state.filter.selections.map((sel) => {
        if (sel.target === selection.target) {
          return selection;
        }
        return sel;
      });
      newFilter = {
        ...state.filter,
        searchInput: state.filter?.searchInput || '',
        selections: updatedSelections,
      };
    } else {
      newFilter = {
        ...state.filter,
        searchInput: state.filter?.searchInput || '',
        selections: [selection],
      };
    }
    this.filterTrigger$.next(newFilter);
    return {
      ...state,
      filter: newFilter,
    };
  });
  readonly filterServer = this.effect<ToDoFilter>((filter$) =>
    filter$.pipe(
      tap(() => this.patchState({ isLoading: true, error: null })),

      switchMap((filter: ToDoFilter) =>
        this.http.post<ToDoResponse>(`${environment.apiUrl}/todo/filter`, filter).pipe(
          tap((items) => {
            console.log('Filtered todos:', items);
            this.paginationToDos(items);
          }),
          tap(() => this.patchState({ isLoading: false })),
          catchError((err) => {
            console.error(err);
            this.patchState({
              error: 'Failed to filter todos',
              isLoading: false,
            });
            return of([]);
          }),
        ),
      ),
    ),
  );
  readonly loadToDos = this.effect<void>((params$) =>
    params$.pipe(
      tap(() => this.patchState({ isLoading: true, error: null })),
      switchMap(() =>
        this.http.get<TodoItem[]>(`${environment.apiUrl}/todo`).pipe(
          tap((item) => {
            console.log('API data:', item);
            this.patchState({ isLoading: false });
          }),
          tap((items) => this.setToDos(items)),
          catchError((err) => {
            this.patchState({
              error: `Can't load to do list`,
              isLoading: false,
            });
            return of([]);
          }),
        ),
      ),
    ),
  );
  readonly createToDo = this.effect<CreateToDo>((toDoItems$) =>
    toDoItems$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((toDoItem) => this.http.post<TodoItem>(`${environment.apiUrl}/todo`, toDoItem)),
      tap((response) => {
        this.addToDo(response);
      }),
      tap(() => this.patchState({ isLoading: false })),
      catchError((err) => {
        this.setError('Fail to create a To Do');
        this.patchState({
          isLoading: false,
          error: 'Create To Do failed, Please try again',
        });
        return of(null);
      }),
    ),
  );
  readonly UpdateToDo = this.effect<UpdateToDo>((toDoItem$) =>
    toDoItem$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((toDoItem) =>
        this.http.put<TodoItem>(`${environment.apiUrl}/todo`, toDoItem).pipe(
          tap((updatedItem: TodoItem) => {
            console.log('API updated Todo:', updatedItem);
            this.updateToDo(updatedItem);
          }),
          tap(() => this.patchState({ isLoading: false })),
          catchError((err) => {
            this.setError('Fail to update this To Do');
            this.patchState({
              isLoading: false,
              error: 'Update To Do fail, Please try again',
            });
            return of(null);
          }),
        ),
      ),
    ),
  );
  readonly RemoveToDo = this.effect<number>((ItemId) =>
    ItemId.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((a) =>
        this.http.delete<number>(`${environment.apiUrl}/todo/${a}`).pipe(
          tap(() => {
            this.removeToDo(a);
          }),
          tap(() => this.patchState({ isLoading: false })),
          catchError((err) => {
            this.setError('Fail to remove this To Do');
            this.patchState({
              isLoading: false,
              error: 'Remove To Do fail, Please try again',
            });
            return of(null);
          }),
        ),
      ),
    ),
  );
  readonly updateStatusToDo = this.effect<number>((Item) =>
    Item.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((a) =>
        this.http.get<number>(`${environment.apiUrl}/todo/status/${a}`).pipe(
          tap(() => {
            this.statusChange(a);
          }),
          tap(() => this.patchState({ isLoading: false })),
          catchError((err) => {
            this.setError('Fail to update status of this To Do');
            this.patchState({
              isLoading: false,
              error: 'Update status failed, Please try again',
            });
            return of(null);
          }),
        ),
      ),
    ),
  );
}
