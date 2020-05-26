import { stylesheet } from "typestyle";
import { Component, createElement } from "websnacks";

const styles = stylesheet({
    header: {
        background: "#6c42bd",
        color: "#fff",
        padding: "32px",
        textAlign: "center",
        boxShadow: "0 1px 8px -3px #000",
    },
    headline: {
        fontSize: "28px",
    },
});

export interface HeaderProps {
    headline: string;
}

export const Header: Component<HeaderProps> = ({ headline }) => (
    <header className={styles.header}>
        <h1 className={styles.headline}>{headline}</h1>
    </header>
);
