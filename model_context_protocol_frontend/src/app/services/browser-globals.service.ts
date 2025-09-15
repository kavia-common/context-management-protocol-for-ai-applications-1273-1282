/**
 * BrowserGlobals provides SSR-safe access to common browser globals.
 * Use these wrappers instead of directly referencing window/document/alert/confirm.
 */
import { Injectable } from '@angular/core';

// PUBLIC_INTERFACE
@Injectable({ providedIn: 'root' })
export class BrowserGlobals {
  /** True if running in browser (not on server). */
  // PUBLIC_INTERFACE
  isBrowser(): boolean {
    return typeof (globalThis as any).window !== 'undefined' && typeof (globalThis as any).document !== 'undefined';
  }

  /** Returns the global window object if available, otherwise undefined. */
  // PUBLIC_INTERFACE
  getWindow(): any | undefined {
    return this.isBrowser() ? (globalThis as any).window : undefined;
  }

  /** Returns the document if available, otherwise undefined. */
  // PUBLIC_INTERFACE
  getDocument(): any | undefined {
    return this.isBrowser() ? (globalThis as any).document : undefined;
  }

  /** Show an alert dialog in browser; no-op on server. */
  // PUBLIC_INTERFACE
  alert(message: string): void {
    const win: any = this.getWindow();
    if (win && typeof win.alert === 'function') {
      win.alert(message);
    } else {
      // fallback to console on server
      console.log('[ALERT]', message);
    }
  }

  /** Show a confirm dialog in browser; returns false on server. */
  // PUBLIC_INTERFACE
  confirm(message: string): boolean {
    const win: any = this.getWindow();
    if (win && typeof win.confirm === 'function') {
      return win.confirm(message);
    }
    // default deny on server
    console.log('[CONFIRM]', message, '-> false (SSR)');
    return false;
  }

  /** Dispatch a DOM CustomEvent if in browser. */
  // PUBLIC_INTERFACE
  dispatchEvent(name: string, detail?: any): void {
    const doc: any = this.getDocument();
    const win: any = this.getWindow();
    if (!doc || !win) return;
    const evt = new win.CustomEvent(name, { bubbles: true, detail });
    doc.dispatchEvent(evt);
  }

  /** Add DOM event listener if in browser. */
  // PUBLIC_INTERFACE
  addDocumentEventListener(name: string, handler: any): void {
    const doc: any = this.getDocument();
    if (!doc) return;
    doc.addEventListener(name, handler as any);
  }

  /** Remove DOM event listener if in browser. */
  // PUBLIC_INTERFACE
  removeDocumentEventListener(name: string, handler: any): void {
    const doc: any = this.getDocument();
    if (!doc) return;
    doc.removeEventListener(name, handler as any);
  }
}
