import { OnDestroy, Component } from '@angular/core';
import { Subject } from 'rxjs';

/**
 * Cleans up the subscription when the component is destroyed.
 */
@Component({ template: '' })
export abstract class BaseComponent implements OnDestroy {
	/** Indicates whether this user is system-reserved and protected from edits */
	private readonly destroy$ = new Subject<void>();

	/**
	 * Cleans up the subscription when the component is destroyed.
	 * @returns  the subscription when the component is destroyed.
	 */
	protected getDestroy$() {
		return this.destroy$;
	}

	/**
	 * Cleans up the subscription when the component is destroyed.
	 */
	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}
}
