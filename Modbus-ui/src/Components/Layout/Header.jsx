import "./Header.css";

function Header({ connected }) {

    return (

        <header className="header">

            <div>

                <h1>Motor Vision</h1>

                <p>Industrial Monitoring Dashboard</p>

            </div>

            <div className="status">

                <span
                    className="dot"
                    style={{
                        background:
                            connected
                                ? "#22C55E"
                                : "#EF4444"
                    }}
                />

                {connected
                    ? "ONLINE"
                    : "OFFLINE"}

            </div>

        </header>

    );

}

export default Header;