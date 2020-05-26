import { stylesheet } from "typestyle";
import { Component, createElement } from "websnacks";

import { Layout } from "../components/layout";

const styles = stylesheet({
    projectsGrid: {
        display: "flex",
        flexWrap: "wrap",
        width: "25%",
    },
});

export const page: Component = () => (
    <Layout>
        <h1>Projects</h1>

        <div className={styles.projectsGrid}>
            <div>Project 1</div>
            <div>Project 2</div>
            <div>Project 3</div>
            <div>Project 4</div>
            <div>Project 5</div>
        </div>
    </Layout>
);
