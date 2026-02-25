import React from "react"
import css from "./Home.scss"

function Home() {
    return (
        <div className={css.app}>
            <header className={css.appHeader}>
                <h1 className={css.heading}>Catalyst + Electrobun</h1>
                <p>
                    This is the Catalyst web app loaded by the Electrobun desktop shell.
                </p>
                <p>
                    Health check endpoint: <code>/api/health</code>
                </p>
                <a
                    className={css.appLink}
                    href="https://catalyst.1mg.com/public_docs/content/installation"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Catalyst documentation
                </a>
            </header>
        </div>
    )
}

export default Home
