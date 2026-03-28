export default function ChartSkeleton() {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: 20,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
      }}
    >
      <div
        style={{
          width: 180,
          height: 18,
          borderRadius: 999,
          background: '#e2e8f0',
          marginBottom: 14,
        }}
      />
      <div
        style={{
          height: 220,
          borderRadius: 18,
          background: 'linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%)',
        }}
      />
    </div>
  );
}
