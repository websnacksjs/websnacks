/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Element, HTMLElement } from "./component";

const HTML_ESCAPES: { [char: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
};

const escapeHtml = (text: string): string =>
    text.replace(/[&<>]/g, (t) => HTML_ESCAPES[t]);

const escapeAttr = (text: string): string => text.replace(/"/g, "&quot;");

const renderElement = (elem: Element): string => {
    // Ignore null and true/false to support nicer JSX conditional syntax with
    // &&, ||, !! operators.
    if (elem == null || typeof elem === "boolean") {
        return "";
    }
    if (typeof elem === "number") {
        return elem.toString();
    }
    if (typeof elem === "string") {
        return escapeHtml(elem);
    }
    if (Array.isArray(elem)) {
        return elem.map((e) => renderElement(e)).join("");
    }

    let output = "";
    output += startTag(elem);
    for (const child of elem.children) {
        output += renderElement(child);
    }
    output += endTag(elem);
    return output;
};

const startTag = (elem: HTMLElement): string => {
    if (elem.tag === "#fragment") {
        return "";
    }

    let output = `<${escapeHtml(elem.tag)}`;

    for (const [attrName, attrValue] of Object.entries(elem.attributes)) {
        // Handle boolean attributes with a false value by not outputting the
        // attribute at all.
        if (attrValue === false) {
            continue;
        }

        let normalizedAttrName = escapeHtml(attrName.toLowerCase());
        if (normalizedAttrName === "classname") {
            normalizedAttrName = "class";
        }
        if (attrValue === true) {
            output += ` ${normalizedAttrName}=""`;
        } else {
            output += ` ${normalizedAttrName}="${escapeAttr(
                attrValue.toString()
            )}"`;
        }
    }

    output += ">";
    return output;
};

const endTag = (elem: HTMLElement): string => {
    if (elem.tag === "#fragment") {
        return "";
    }
    return `</${escapeHtml(elem.tag)}>`;
};

/**
 * Render a complete HTML page from an HTMLElement. Note that the root element
 * must represent a valid HTML tag.
 *
 * @param rootElem HTML element representing the root of the document.
 *
 * @return Fully rendered HTML document as a string.
 */
export const renderPage = (rootElem: Element): string => {
    if (rootElem == undefined) {
        throw new Error(`root page element cannot be null`);
    }
    if (typeof rootElem !== "object" || !("tag" in rootElem)) {
        throw new Error(
            `root page element must be a valid HTMLElement, got ${JSON.stringify(
                rootElem
            )}`
        );
    }
    if (rootElem.tag.toLowerCase() !== "html") {
        throw new Error(
            `attempted to render page with non-HTML root element ${rootElem.tag}`
        );
    }

    let output = "<!DOCTYPE html>";
    output += renderElement(rootElem);
    return output;
};
