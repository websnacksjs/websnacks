/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { createElement } from "../../dist";
import { renderPage } from "../../dist/render";
import { testSuite } from "../lib";

testSuite("renderPage", ({ test, expect }) => {
    test("throws an Error when root elem is not html tag", () => {
        expect(() => renderPage(<div />)).toThrowErrorMatching(
            "attempted to render page with non-HTML root element div"
        );
    });

    test("outputs a HTML5 DOCTYPE declaration", () => {
        const html = renderPage(<html />);
        expect(html).toStartWith("<!DOCTYPE html>");
    });

    test("escapes HTML in tag names", () => {
        const html = renderPage(
            <html>{createElement("div></div", null)}</html>
        );
        expect(html).toEqual(
            "<!DOCTYPE html><html><div&gt;&lt;/div></div&gt;&lt;/div></html>"
        );
    });

    test("renders html attributes", () => {
        const html = renderPage(
            <html>
                <div className="test" id="1" />
            </html>
        );
        expect(html).toEqual(
            '<!DOCTYPE html><html><div class="test" id="1"></div></html>'
        );
    });

    test("renders common html tags", () => {
        const html = renderPage(
            <html>
                <head>
                    <title />
                </head>
                <body>
                    <div />
                </body>
            </html>
        );
        expect(html).toEqual(
            "<!DOCTYPE html><html><head><title></title></head><body><div></div></body></html>"
        );
    });

    test("renders text nodes", () => {
        const html = renderPage(<html>There are three lights!</html>);
        expect(html).toEqual(
            "<!DOCTYPE html><html>There are three lights!</html>"
        );
    });
});
