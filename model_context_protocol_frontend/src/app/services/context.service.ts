/**
 * ContextService provides methods to interact with the backend REST API for managing AI model context data.
 * It encapsulates HTTP calls, error handling, and provides typed interfaces for consumers.
 */
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

/** Represents a single context item in the system. */
export interface ContextItem {
  id: string;
  model: string;
  name: string;
  status: 'active' | 'idle' | 'stale' | 'error';
  tokens: number;
  updatedAt: string; // ISO string
  createdAt: string; // ISO string
  metadata?: Record<string, any>;
}

/** Represents a change or event in the context history. */
export interface ContextHistoryEvent {
  id: string;
  contextId: string;
  timestamp: string; // ISO string
  type: 'created' | 'updated' | 'token_usage' | 'error' | 'archived';
  description: string;
  diff?: Record<string, any>;
}

/** Request payload for updating a context item. */
export interface UpdateContextRequest {
  name?: string;
  status?: 'active' | 'idle' | 'stale' | 'error';
  metadata?: Record<string, any>;
}

/** Generic API response wrapper used by backend */
export interface ApiResponse<T> {
  ok: boolean;
  data: T;
  message?: string;
}

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class ContextService {
  /** This is a public service providing CRUD methods for contexts */
  /** Base URL for the API, taken from environment configuration. */
  private readonly baseUrl = environment.API_BASE_URL;
  private readonly http = inject(HttpClient);

  /**
   * Fetch list of contexts.
   * @param includeStale Whether to include stale contexts in results.
   */
  // PUBLIC_INTERFACE
  getContexts(includeStale = true): Observable<ContextItem[]> {
    let params = new HttpParams();
    if (!includeStale) params = params.set('includeStale', 'false');

    return this.http
      .get<ApiResponse<ContextItem[]>>(`${this.baseUrl}/contexts`, { params })
      .pipe(
        map((resp) => resp.data ?? []),
        catchError((err) => this.handleError(err, []))
      );
  }

  /**
   * Get full details for a single context by ID.
   */
  // PUBLIC_INTERFACE
  getContextById(id: string): Observable<ContextItem | null> {
    if (!id) return of(null);
    return this.http
      .get<ApiResponse<ContextItem>>(`${this.baseUrl}/contexts/${encodeURIComponent(id)}`)
      .pipe(
        map((resp) => resp.data),
        catchError((err) => this.handleError(err, null))
      );
  }

  /**
   * Update context attributes such as name, status, or metadata.
   */
  // PUBLIC_INTERFACE
  updateContext(id: string, payload: UpdateContextRequest): Observable<ContextItem | null> {
    return this.http
      .put<ApiResponse<ContextItem>>(`${this.baseUrl}/contexts/${encodeURIComponent(id)}`, payload)
      .pipe(
        map((resp) => resp.data),
        catchError((err) => this.handleError(err, null))
      );
  }

  /**
   * Fetch context history events for a given context.
   */
  // PUBLIC_INTERFACE
  getContextHistory(id: string, limit = 50): Observable<ContextHistoryEvent[]> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http
      .get<ApiResponse<ContextHistoryEvent[]>>(`${this.baseUrl}/contexts/${encodeURIComponent(id)}/history`, { params })
      .pipe(
        map((resp) => resp.data ?? []),
        catchError((err) => this.handleError(err, []))
      );
  }

  /**
   * Create a new context.
   */
  // PUBLIC_INTERFACE
  createContext(item: Partial<ContextItem> & { name: string; model: string }): Observable<ContextItem | null> {
    return this.http
      .post<ApiResponse<ContextItem>>(`${this.baseUrl}/contexts`, item)
      .pipe(
        map((resp) => resp.data),
        catchError((err) => this.handleError(err, null))
      );
  }

  /**
   * Archive or delete a context.
   */
  // PUBLIC_INTERFACE
  deleteContext(id: string): Observable<boolean> {
    return this.http
      .delete<ApiResponse<{ deleted: boolean }>>(`${this.baseUrl}/contexts/${encodeURIComponent(id)}`)
      .pipe(
        map((resp) => !!resp.data?.deleted),
        catchError((err) => this.handleError(err, false))
      );
  }

  /** Centralized error handler that logs and returns a safe fallback value. */
  private handleError<T>(error: HttpErrorResponse, fallback: T): Observable<T> {
    // Ideally, send to logging infrastructure
    console.error('API error:', error);
    return of(fallback);
  }
}
