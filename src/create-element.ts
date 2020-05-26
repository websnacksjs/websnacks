/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Component, Element, HTMLElement } from "./component";
import { HTMLAttributes } from "./jsx";
import { flatDeep } from "./utils";

/**
 * Create an HTMLElement from a custom Component.
 *
 * @param comp Component responsible for constructing the HTMLElement.
 * @param props Properties passed to the Component that parameterize the
 *              HTMLElement construction.
 * @param children Child elements that exist under this component.
 *
 * @return Fully-realized HTMLElement, ready for rendering.
 */
export function createElement<P extends Record<string, unknown>>(
    comp: Component<P>,
    props: P,
    ...children: Element[]
): HTMLElement;
/**
 * Create an HTMLElement from a standard HTML5 tag.
 *
 * @param tag Lower-case name of the HTML5 tag this HTML element represents.
 * @param attrs Standard HTML5 attributes to add to the resulting tag when
 *              rendered.
 * @param children Child elements that exist under this tag.
 *
 * @return Fully-realized HTMLElement, ready for rendering.
 */
export function createElement(
    tag: string,
    attrs: HTMLAttributes | null,
    ...children: Element[]
): HTMLElement;
export function createElement(
    type: string | Component<Record<string, unknown>>,
    props: HTMLAttributes | Record<string, unknown> | null,
    ...children: Element[]
): HTMLElement {
    // Flatten the children array so we can accept arrays as children.
    const normalizedChildren = flatDeep(children);
    if (type instanceof Function) {
        return type({ ...props, children: normalizedChildren });
    }

    if (type !== type.toLowerCase()) {
        console.warn(`constructed HTML5 tag with non-lowercase name ${type}`);
    }
    const attrs: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(props || {})) {
        if (
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            console.warn(
                `non-primitive attribute ${key} = ${JSON.stringify(value)}`
            );
            continue;
        }
        attrs[key] = value;
    }
    return { tag: type, attributes: attrs, children: normalizedChildren };
}
