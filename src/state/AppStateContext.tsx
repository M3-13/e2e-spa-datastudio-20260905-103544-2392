import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  type Dispatch,
  type ReactNode,
} from 'react';
import type {
  AppState,
  ChartType,
  ColumnFilter,
  Dataset,
  SortState,
} from '../types';
import { loadPersistedState, savePersistedState } from './persistence';

export type { AppState };

export type Action =
  | { type: 'LOAD_START' }
  | { type: 'LOAD_SUCCESS'; dataset: Dataset }
  | { type: 'LOAD_ERROR'; message: string }
  | { type: 'SET_SORT'; sort: SortState | null }
  | { type: 'SET_PAGE'; page: number }
  | { type: 'SET_PAGE_SIZE'; pageSize: number }
  | { type: 'SET_SEARCH'; query: string }
  | { type: 'TOGGLE_COLUMN'; columnId: string }
  | { type: 'SET_COLUMN_FILTER'; columnId: string; patch: Partial<ColumnFilter> }
  | { type: 'REMOVE_COLUMN_FILTER'; columnId: string }
  | { type: 'SET_CHART'; columnId?: string; chartType?: ChartType }
  | { type: 'TOGGLE_THEME' }
  | { type: 'CLEAR_ALL' }
  | { type: 'RESTORE_STATE'; state: AppState };

export const initialState: AppState = {
  status: 'empty',
  errorMessage: null,
  dataset: null,
  visibleColumnIds: null,
  sort: null,
  page: 1,
  pageSize: 20,
  searchQuery: '',
  filters: [],
  chartColumnId: null,
  chartType: 'bar',
  theme: 'light',
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_START':
      return { ...state, status: 'loading', errorMessage: null };

    case 'LOAD_SUCCESS':
      return {
        ...state,
        status: 'ready',
        errorMessage: null,
        dataset: action.dataset,
        visibleColumnIds: null,
        sort: null,
        page: 1,
        searchQuery: '',
        filters: [],
      };

    case 'LOAD_ERROR':
      return { ...state, status: 'error', errorMessage: action.message };

    case 'SET_SORT':
      return { ...state, sort: action.sort };

    case 'SET_PAGE':
      return { ...state, page: action.page };

    case 'SET_PAGE_SIZE':
      return { ...state, pageSize: action.pageSize };

    case 'SET_SEARCH':
      return { ...state, searchQuery: action.query };

    case 'TOGGLE_COLUMN': {
      const allIds = state.dataset?.columns.map((column) => column.id) ?? [];
      const current = state.visibleColumnIds ?? allIds;
      const exists = current.includes(action.columnId);
      const next = exists
        ? current.filter((id) => id !== action.columnId)
        : allIds.filter((id) => current.includes(id) || id === action.columnId);
      return { ...state, visibleColumnIds: next };
    }

    case 'SET_COLUMN_FILTER': {
      const existing = state.filters.find(
        (filter) => filter.columnId === action.columnId,
      );
      if (existing) {
        return {
          ...state,
          filters: state.filters.map((filter) =>
            filter.columnId === action.columnId
              ? { ...filter, ...action.patch }
              : filter,
          ),
        };
      }
      const filter: ColumnFilter = {
        columnId: action.columnId,
        op: action.patch.op ?? 'contains',
        value: action.patch.value ?? '',
        ...(action.patch.valueTo !== undefined
          ? { valueTo: action.patch.valueTo }
          : {}),
      };
      return { ...state, filters: [...state.filters, filter] };
    }

    case 'REMOVE_COLUMN_FILTER':
      return {
        ...state,
        filters: state.filters.filter(
          (filter) => filter.columnId !== action.columnId,
        ),
      };

    case 'SET_CHART': {
      const next: AppState = { ...state };
      if (action.columnId !== undefined) {
        next.chartColumnId = action.columnId;
      }
      if (action.chartType !== undefined) {
        next.chartType = action.chartType;
      }
      return next;
    }

    case 'TOGGLE_THEME':
      return { ...state, theme: state.theme === 'light' ? 'dark' : 'light' };

    case 'CLEAR_ALL':
      return { ...initialState, theme: state.theme };

    case 'RESTORE_STATE':
      return action.state;

    default:
      return state;
  }
}

export interface AppStateContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(
  undefined,
);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    reducer,
    initialState,
    (init) => loadPersistedState() ?? init,
  );

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}
