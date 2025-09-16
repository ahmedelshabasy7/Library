export default function Dashboard() {
  return (
    <div
      className="container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: 500,
          margin: "0 auto",
          textAlign: "center",
          boxShadow: "0 2px 16px #0002",
          borderRadius: 12,
          padding: "2rem 2.5rem",
        }}
      >
        <h1
          style={{
            marginTop: 0,
            fontWeight: 700,
            fontSize: "2.5rem",
            letterSpacing: ".05em",
          }}
        >
          Library
        </h1>
        <p style={{ fontSize: "1.15rem", color: "#444", margin: "1.5rem 0 0" }}>
          Welcome to My Library.
          <br />
          Use the navigation bar to explore books, publish your own, and borrow
          books.
        </p>
      </div>
    </div>
  );
}
