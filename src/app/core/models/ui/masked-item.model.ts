import {CardField} from './card-field.model';

export type BackendItem = Record<string, unknown>;

/**
 * Adds frontend-only masking flags to backend items.
 * These flags are for UI state, not persisted to the backend.
 */
export type MaskedItem<T extends BackendItem> = T &
	Record<string, unknown> & {
		/** Visual highlight (e.g. recently added or modified) */
		highlighted?: boolean;

		/** Item should be visually disabled (non-selectable, greyed out, etc.) */
		disabled?: boolean;

		/** Item is currently selected or active in UI */
		selected?: boolean;

		/** Item is temporarily hidden from view (filtered out but still in list) */
		hidden?: boolean;

		/** Marks this item as newly added (helpful for animations or color cues) */
		isNew?: boolean;

		/** Marks this item as pending sync / upload / update */
		pending?: boolean;

		/** Marks that the item data is stale or needs refresh */
		stale?: boolean;

		/** Marks that the item is currently being edited */
		editing?: boolean;

		/** UI grouping marker (for category highlighting, etc.) */
		groupTag?: string;

		/** Custom marker for domain-specific use */
		tag?: string;

		/** Extended UI configuration */
		ui?: UiTemplate;
		
		  childrenLoadedFromBackend?: boolean; // new flag
	};

/**
 * Describes the UI presentation of a dropdown item.
 */
export interface UiTemplate {
	/** Show a checkbox on the right or left side */
	checkbox?: boolean;

	/** Show an icon (optional icon name or CSS class) */
	icon?: string;

	/** Optional tooltip text */
	tooltip?: string;

	/** Optional badge value (e.g., counter or label) */
	badge?: string | number;

	/** Optional custom CSS class for styling */
	cssClass?: string;

	/** Optional color hint for highlighting */
	color?: string;

	/** Optional layout variant (e.g., compact, spaced) */
	variant?: 'default' | 'compact' | 'dense';
	
	  /** Fields to display in a card, in order */
  cardFields?: CardField[];
}
