/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { Component, createElement, Fragment } from "../../dist";
import { renderPage } from "../../dist/render";
import { testSuite } from "../lib";

testSuite("renderPage", ({ test, expect }) => {
    test("throws an Error when root elem is not html tag", () => {
        expect(() => renderPage(<div />)).toThrowErrorMatching(
            "attempted to render page with non-HTML root element div",
        );
    });

    test("outputs a HTML5 DOCTYPE declaration", () => {
        const html = renderPage(<html />);
        expect(html).toStartWith("<!DOCTYPE html>");
    });

    test("escapes HTML in tag names", () => {
        const html = renderPage(
            <html>{createElement("div></div", null)}</html>,
        );
        expect(html).toEqual(
            "<!DOCTYPE html><html><div&gt;&lt;/div></div&gt;&lt;/div></html>",
        );
    });

    test("renders html attributes", () => {
        const html = renderPage(
            <html>
                <div className="test" id="1" />
            </html>,
        );
        expect(html).toEqual(
            '<!DOCTYPE html><html><div class="test" id="1"></div></html>',
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
            </html>,
        );
        expect(html).toEqual(
            "<!DOCTYPE html><html><head><title></title></head><body><div></div></body></html>",
        );
    });

    test("renders text nodes", () => {
        const html = renderPage(<html>There are three lights!</html>);
        expect(html).toEqual(
            "<!DOCTYPE html><html>There are three lights!</html>",
        );
    });

    test("renders spliced number nodes", () => {
        const nLights = 3;
        const html = renderPage(<html>There are {nLights} lights!</html>);
        expect(html).toEqual("<!DOCTYPE html><html>There are 3 lights!</html>");
    });

    test("renders spliced arrays", () => {
        const Light: Component<{ lightN: number }> = ({ lightN }) => (
            <div>{lightN}</div>
        );
        const lights = [1, 2, 3];
        const html = renderPage(
            <html>
                There are{" "}
                {lights.map((lightN) => (
                    <Light lightN={lightN} />
                ))}{" "}
                lights!
            </html>,
        );
        expect(html).toEqual(
            "<!DOCTYPE html><html>There are <div>1</div><div>2</div><div>3</div> lights!</html>",
        );
    });

    test("renders components w/ custom properties", () => {
        interface LightProps {
            nLights: number;
        }
        const Light: Component<LightProps> = ({ nLights }) => (
            <div>{nLights} lights</div>
        );
        const html = renderPage(
            <html>
                There are <Light nLights={3} />!
            </html>,
        );
        expect(html).toEqual(
            "<!DOCTYPE html><html>There are <div>3 lights</div>!</html>",
        );
    });

    test("renders fragment children only", () => {
        const html = renderPage(
            <html>
                <Fragment>
                    <div>test of</div>
                    <div>fragments</div>
                </Fragment>
            </html>,
        );
        expect(html).toEqual(
            "<!DOCTYPE html><html><div>test of</div><div>fragments</div></html>",
        );
    });
});
