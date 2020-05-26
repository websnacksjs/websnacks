/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

export * from "./dist";

import { HTMLElement } from "./dist";
import { IntrinsicElements as JsxIntrinsics } from "./dist/jsx";

declare global {
    namespace JSX {
        type Element = HTMLElement;
        type IntrinsicElements = JsxIntrinsics;
    }
}
