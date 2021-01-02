/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * An in-memory representation of a renderable HTML element.
 */
export interface HTMLElement {
    /**
     * Name of the tag that gets output upon rendering.
     */
    tag: string;
    /**
     * Record of attribute names and values that should be output in the opening
     * tag.
     */
    attributes: Record<string, string | number | boolean>;
    /**
     * Child elements to render nested within this HTML element.
     */
    children: Element[];
}

/**
 * All valid types of elements that can be rendered to HTML.
 */
export type Element =
    | Element[]
    | HTMLElement
    | string
    | number
    | boolean
    | undefined
    | null;

/**
 * Custom HTMLElement factory that can be parameterized by props.
 */
export interface Component<P extends object = {}> {
    (
        props: P & {
            children?: Element[];
        },
    ): HTMLElement;
}

export const Fragment: Component<{}> = ({ children }) => ({
    tag: "#fragment",
    attributes: {},
    children: children || [],
});
