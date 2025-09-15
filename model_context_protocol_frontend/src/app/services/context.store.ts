/**
 * ContextStore: simple reactive store for context list and selection.
 * Uses RxJS BehaviorSubjects to manage state updates across components.
 */
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, combineLatest, map, Observable, tap } from 'rxjs';
import { ContextItem, ContextService } from './context.service';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class ContextStore {
  /** Holds all contexts loaded from backend */
  private readonly contexts$ = new BehaviorSubject<ContextItem[]>([]);
  /** Currently selected context ID */
  private readonly selectedContextId$ = new BehaviorSubject<string | null>(null);
  /** Loading indicator for list operations */
  private readonly loading$ = new BehaviorSubject<boolean>(false);
  /** Error message, if any */
  private readonly error$ = new BehaviorSubject<string | null>(null);

  private readonly api = inject(ContextService);

  // PUBLIC_INTERFACE
  get all$(): Observable<ContextItem[]> {
    return this.contexts$.asObservable();
  }

  // PUBLIC_INTERFACE
  get selected$(): Observable<ContextItem | null> {
    return combineLatest([this.contexts$, this.selectedContextId$]).pipe(
      map(([list, id]) => list.find((c) => c.id === id) ?? null)
    );
  }

  // PUBLIC_INTERFACE
  get loadingState$(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  // PUBLIC_INTERFACE
  get errorState$(): Observable<string | null> {
    return this.error$.asObservable();
  }

  // PUBLIC_INTERFACE
  load(includeStale = true): void {
    this.loading$.next(true);
    this.error$.next(null);
    this.api.getContexts(includeStale).pipe(
      tap({
        next: (data) => {
          this.contexts$.next(data);
          this.loading$.next(false);
        },
        error: (e) => {
          this.error$.next('Failed to load contexts');
          this.loading$.next(false);
        }
      })
    ).subscribe();
  }

  // PUBLIC_INTERFACE
  select(id: string | null): void {
    this.selectedContextId$.next(id);
  }

  // PUBLIC_INTERFACE
  upsertLocal(item: ContextItem): void {
    const list = this.contexts$.getValue();
    const idx = list.findIndex((c) => c.id === item.id);
    if (idx >= 0) {
      list[idx] = item;
      this.contexts$.next([...list]);
    } else {
      this.contexts$.next([item, ...list]);
    }
  }

  // PUBLIC_INTERFACE
  removeLocal(id: string): void {
    this.contexts$.next(this.contexts$.getValue().filter((c) => c.id !== id));
    if (this.selectedContextId$.getValue() === id) {
      this.selectedContextId$.next(null);
    }
  }
}
