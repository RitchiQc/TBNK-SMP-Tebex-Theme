export default function Loading() {
  return (
    <div className="container-tbnk" style={{ paddingTop: 42, paddingBottom: 60 }}>
      <div className="skeleton" style={{ width: 180, height: 14 }} />
      <div
        className="skeleton"
        style={{ width: "65%", height: 72, marginTop: 22 }}
      />
      <div
        className="skeleton"
        style={{ width: "48%", height: 18, marginTop: 18 }}
      />
      <div
        className="skeleton"
        style={{ width: 180, height: 48, marginTop: 26, borderRadius: 12 }}
      />
      <div
        className="product-grid"
        style={{ marginTop: 48 }}
      >
        {[0, 1, 2].map((index) => (
          <div key={index} className="skeleton" style={{ height: 380 }} />
        ))}
      </div>
    </div>
  );
}
