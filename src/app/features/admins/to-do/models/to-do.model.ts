export interface ToDoView 
{
   id: number,
   title: string,
   fullName: string,
   description: string,
   isCompleted: boolean,
   createdAt: string,
   dueDate: string
}
export interface CreateToDo
{
    title: string,
    description: string,
    userId : number,
    dueDate: string
}
export interface UpdateToDo{
    title: string,
    description: string,
    dueDate: string
    id: number
}
export interface ToDoResponse 
{
    toDoItems: ToDoView[]
    itemInPage: ToDoView [],
    totalItems: number,
    totalPages: number,
    toTalPages?: number,
    itemsPerPage: number,
    itemPerPage?: number,
    pageIndex: number,
    currentPage: number
}

//Filter
export interface SortOptions
{
    sortByTitle: string,
    isDescending: boolean,
    whichType: string
}
export interface RangeFilter
{
    start : string,
    end: string,
    target: string,
    whichType: string,
}
export interface Combobox
{
    value: string,
    label: string
}
export interface Pagination
{
    value: number,
    itemsPerPage: number
}
export interface SelectionFilter
{
    value: string;
    target: string;
}
export interface ToDoFilter
{
    searchInput: string,
    sortOptions?: SortOptions[],
    rangeFilters?: RangeFilter[],
    comboboxes?: Combobox[],
    selections?: SelectionFilter[],
    itemPerPage?: number,
    pageIndex?: number,
}