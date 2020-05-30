/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export { HTMLElement, Component } from "./component";
export { UserConfig as Config } from "./config";
export { createElement } from "./create-element";

import { HTMLElement } from "./component";
import { IntrinsicElements as JsxIntrinsics } from "./jsx";

declare global {
    namespace JSX {
        type Element = HTMLElement;
        type IntrinsicElements = JsxIntrinsics;
    }
}
