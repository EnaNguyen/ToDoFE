import { Injectable, inject } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { stat } from 'fs';
import { Observable } from 'rxjs';
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateToDo, UpdateToDo } from './models/to-do.model';
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

export interface TodoState {
  toDoItems: TodoItem[];
  allToDoItems: TodoItem[];
  currentPage: number;
  pageSize: number;
  isLoading: boolean;
  filter: any[];
  error: string | null;
}
export interface DateRange {
  minDate: string;
  maxDate: string;
}
const initialState: TodoState = {
  toDoItems: [],
  allToDoItems: [],
  currentPage: 1,
  pageSize: 20,
  isLoading: false,
  filter: [],
  error: null,
};
@Injectable()
export class TodoStore extends ComponentStore<TodoState> {
  constructor() {
    super(initialState);
  }
  private readonly http = inject(HttpClient);
  readonly toDoItems$: Observable<TodoItem[]> = this.select((state) => state.toDoItems);
  readonly isLoading$: Observable<boolean> = this.select((state) => state.isLoading);
  readonly error$: Observable<string | null> = this.select((state) => state.error);

  readonly setToDos = this.updater((state, toDoItems: TodoItem[]) => ({
    ...state,
    toDoItems,
    allToDoItems: toDoItems,
    isLoading: false,
    error: null,
  }));
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
  readonly searchToDo = this.updater((state, queue: string) => {
    const lowerQueue = queue.toLowerCase().trim();
    return {
      ...state,
      toDoItems: state.allToDoItems.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQueue) ||
          item.description.toLowerCase().includes(lowerQueue),
      ),
      isLoading: false,
      error: null,
    };
  });
  readonly filterStatus = this.updater((state, stat: boolean | null) => {
    if (stat) {
      console.log('testing' + stat);
      return {
        ...state,
        toDoItems: state.allToDoItems.filter((item) => item.isCompleted == stat),
        isLoading: false,
        error: null,
      };
    }
    console.log('Null testing');
    return {
      ...state,
      toDoItems: state.allToDoItems,
      isLoading: false,
      error: null,
    };
  });
  readonly filterDateRange = this.updater((state, dateRange: DateRange) => {
    let beginDate = new Date().toString();
    let endDate = new Date().toString();

    if (dateRange.minDate) {
      beginDate = formatDate(dateRange.minDate);
    }
    if (dateRange.maxDate) {
      endDate = formatDate(dateRange.maxDate);
    }
    return {
      ...state,
      toDoItems:
        dateRange.minDate && dateRange.maxDate
          ? state.allToDoItems.filter((item) => {
              if (!item.dueDate) return false;
              const dueFormatted = formatDate(item.dueDate);
              if (!dueFormatted) return false;
              const isDueAfterOrEqualBegin = compareDates(dueFormatted, beginDate);
              const isEndAfterOrEqualDue = compareDates(endDate, dueFormatted);
              return isDueAfterOrEqualBegin && isEndAfterOrEqualDue;
            })
          : state.allToDoItems,
      isLoading: false,
      error: null,
    };
  });
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
              isLoading: true,
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
          tap(
            () => this.patchState({ isLoading: false }),
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
    )
  );
}
