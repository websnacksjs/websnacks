# websnacks: Minimal Dependency Server-Side JSX for Static Sites

<div>

[![NPM release](https://img.shields.io/npm/v/@websnacksjs/websnacks?style=flat-square)](https://www.npmjs.com/package/@websnacksjs/websnacks "NPM release")
[![NPM](https://img.shields.io/npm/l/@websnacksjs/websnacks?style=flat-square)](https://www.mozilla.org/en-US/MPL/2.0/FAQ/ "License info")
[![Build status](https://img.shields.io/travis/com/websnacksjs/websnacks/mainline?style=flat-square)](https://travis-ci.com/websnacksjs/websnacks "Build status for mainline branch")

</div>

<div>

[![Dependency status](https://img.shields.io/david/websnacksjs/websnacks?style=flat-square)](https://david-dm.org/websnacksjs/websnacks "Dependency status")
[![Optional dependency status](https://img.shields.io/david/optional/websnacksjs/websnacks?style=flat-square)](https://david-dm.org/websnacksjs/websnacks?type=optional "Optional dependency status")
[![Dev dependency status](https://img.shields.io/david/dev/websnacksjs/websnacks?style=flat-square)](https://david-dm.org/websnacksjs/websnacks?type=dev "Dev dependency status")

</div>

Develop fully static websites using typesafe JSX templates on the server without the complex build system and dependency management of server-side rendered React frameworks.

## Goals

-   **No Client Runtime** Create clean, server-side web components leveraging the full expressiveness of Node.js and JSX without the added overhead and complexity of a runtime library like React or Angular.
-   **Simple and Performant** Straightforward, reliable, no-magic templating system that gives developers complete control over page generation and optimization.
-   **Minimal Dependencies** websnacks has only 2 optional dependencies: `node-watch` and `ws` for cross-platform live-reload in development.
-   **Familiar Semantics** Leverage existing JavaScript and React developer skills with JSX. Anyone with React experience should be able to quickly and easily pickup a websnacks site in just a matter of minutes.
-   **Typesafe** websnacks provides TypeScript definitions for fully typechecked templates. Catch errors during development instead of on your build server and have faster, more productive iteration cycles.
-   **Easy to Vendor and Maintain** websnack's codebase is written concisely and simply and has been designed to be easily vendored and maintained internally to ensure that your build process still works even years from now.

## Getting Started

websnacks is provided as very lightweight npm package and it is recommended that you add it to your project's dependencies via `npm i --save websnacks`, `yarn add websnacks`, or whatever other NPM-compatible package manager you're using.

The websnacks npm package provides a JSX-to-JS factory function `createElement`, a simple and XSS-safe HTML renderer, optional TypeScript typings for JSX elements and custom components, and a `websnacks` CLI binary.

The `websnacks` binary provides two commands:

-   `websnacks build`, which renders the websnacks project in the current directory to a standalone static site, ready for hosting on your favorite CDN.
-   `websnacks dev`, which starts up a live-reloading development server that automatically watches your sources for changes.

### Project Structure

The `websnacks` binary assumes the following directory structure:

```
<project-root>
 |-- pages/             # Each page must export a `page` var and generates a
 |    |-- index.js|ts   # corresponding html file with the same name and folder
 |    |-- about.js|ts   # nesting structure.
 |    \-- blog/
 |        \-- 2020-04-01.js|ts
 |-- static/            # Static assets in this folder are copied as-is to the
 |   |-- images/        # output bundle unchanged.
 |   |    \-- logo.png
 |   |-- styles.css
 |   \-- robots.txt
 \-- websnacks.js|ts    # Optional configuration file used to customize the
                        # build process. See the examples folder for usage.
```

### Defining Pages

websnacks Components are just JSX element factories and have the exact same interface as React functional components.

Page files are JS/TS files within the `pages/` directory that export a named `page` variable, which must be a websnacks component and must output an `<html>` tag as the root element.

```tsx
import { createElement, Component } from "websnacks";

interface LayoutProps {
    pageTitle: string;
}

const Layout: Component<LayoutProps> = ({ children, pageTitle }) => (
    <html lang="en-US">
        <head>
            <meta charSet="utf-8" />
            <title>{pageTitle}</title>
            <meta
                name="viewport"
                content="width=device-width, initial-scale=1"
            />
            <link rel="stylesheet" href="/styles.css" />
        </head>

        <body>
            <main>{children}</main>
        </body>
    </html>
);

export const page: Component = () => (
    <Layout pageTitle="Hello Worldwide Web!">
        <h1 className="title">Hello Worldwide Web!</h1>
    </Layout>
);
```

## Integrations

### TypeScript

To use the websnacks binary to build or develop with TypeScript sources, add `ts-node` to your project's dependencies and use the `-r` flag to require ts-node, e.g. `websnacks -r ts-node/register dev`. This allows you to use TypeScript for page files and the websnacks configuration file.

### CSS-in-JS

websnacks doesn't directly support CSS-in-JS solutions, but provides hooks that can be used to generate CSS from those types of libraries. See `examples/personal-site` for an example project that uses typestyle.

## Why websnacks Instead of React?

React is a fantastic library for developing single-page applications (SPAs), but not all websites need the added complexity or runtime overhead of an SPA framework. Moreover, the myriad of development tools required to create server-side rendered, SEO-friendly static files from a React site can introduce considerable maintenance and upkeep costs to an otherwise dead-simple static site. Each dependency added to your project is also a potential supply-chain attack vector or weak link that can break your build pipeline (e.g. when a package is yanked).

websnacks aims to provide an excellent developer experience using the same tooling that React developers have come to expect and rely on, all while introducing as little incidental complexity as possible. Building a websnacks static site should be reliable, safe, and easy, requiring little to no maintenance and upkeep. If it builds today it should build two years from now.

## Limitations & Future Improvements

websnacks is deliberately limited in what it tries to achieve and does so to avoid unnecessary complexity in its design and implementation. That said, there are a few improvements that may be worth exploring in the future:

-   **Client-Side JavaScript** Many static sites need at least basic client-side scripting, and although you can just use webpack/parcel/rollup to bundle your scripts out of band it would be nice to integrate some kind of bundling system into websnacks to handle most simple use cases. Needs a lot of careful thought and research to do right though.
-   **Hot Reloading** The dev server's live-reloading may be replaced with hot-reloading in the near future as long as it doesn't add too much additional complexity.
-   **Stricter JSX Typings** websnacks' current JSX TypeScript typings are based on Preact's JSX typings, which provide for basic type-checking of HTML attributes and generally allow any attribute on any HTML element. In the future, websnacks may adopt more strict JSX HTML element typings to prevent adding nonsense attributes to unsupported elements, string literal typings for enumerations, etc., but this will need to be balanced for forward compatibility with HTML spec changes as well.
-   **Image Resizing/srcset Support** Modern static websites increasingly have need for optimally-sized images for different media and screen resolutions, and some kind of declarative, automated image resizing solution might be a justified addition to websnacks as long as it doesn't add too much complexity.

## Alternatives

Several excellent React server-side rendered (SSR) application frameworks exist with good community support and proven track records, and they are well worth evaluating for your static site project especially if you need lots of client-side scripting. The tradeoff with all of these frameworks, however, is a massive dependency tree spanning hundreds to even thousands of packages, and flexible yet often complex configuration and build systems that require non-trivial development and upkeep effort.

**NOTE:** Dependency counts include all direct and transient dependencies installed via `npm i` with a fresh package.json on MacOS with only the base package declared as a dependency (no plugins/extensions). Current as of 2020-05-25.

-   **[react-static](https://github.com/react-static/react-static) (~1,232 Dependencies)** A well-designed, developer-friendly framework for generating static sites via React SSR. Very flexible with an intuitive and sane configuration system. Plugins add additional support for TypeScript and popular CSS-in-JS libraries.
-   **[next](https://github.com/zeit/next.js/) (~810 Dependencies)** A fully-featured, enterprise-quality React web application framework that includes a robust sever-side rendering system, TypeScript typings, and a client-side routing solution with efficient data loading and prefetching. Very impressive framework that is well-suited for interactive webapps and static sites that can make good use of client-side React.
-   **[gatsby](https://github.com/gatsbyjs/gatsby) (~1,838 Dependencies)** Data-centric, React SSR static-site generator that leverages GraphQL-like queries to fetch data for static page generation. A large community of plugins exist for various use cases which makes gatsby very flexible. Plugin quality tends to vary significantly, however, and there have been persistent performance and memory issues with gatsby's dev server and build pipeline on larger sites (>= 100k pages).
