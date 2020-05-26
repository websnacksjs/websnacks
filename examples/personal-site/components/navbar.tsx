import { stylesheet } from "typestyle";
import { Component, createElement } from "websnacks";

const styles = stylesheet({
    navbar: {
        minWidth: "140px",
        borderRight: "1px solid #ddd",
        background: "#fff",
    },
    sectionTitle: {
        color: "#333",
        textAlign: "center",
        borderBottom: "1px solid #333",
        padding: "6px",
        margin: "0 4px",
        fontSize: "18px",
    },
    linksList: {
        padding: "3px 16px 0",
    },
    linksListItem: {
        padding: "6px",
    },
});

const links = [
    { title: "Home", href: "/" },
    { title: "Projects", href: "/projects" },
];

export const Navbar: Component = () => (
    <nav className={styles.navbar}>
        <h2 className={styles.sectionTitle}>Navigation</h2>

        <ol className={styles.linksList}>
            {links.map(({ title, href }) => (
                <li className={styles.linksListItem}>
                    <a href={href}>{title}</a>
                </li>
            ))}
        </ol>
    </nav>
);
