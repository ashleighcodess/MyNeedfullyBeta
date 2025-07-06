function SimpleApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>MyNeedfully - Test Page</h1>
      <p>If you can see this, the React app is working.</p>
      <div style={{ 
        background: '#f0f0f0', 
        padding: '10px', 
        marginTop: '20px',
        borderRadius: '8px'
      }}>
        <h2>Quick Test</h2>
        <p>This is a simplified version to test if React is rendering properly.</p>
        <button onClick={() => alert('Button works!')}>
          Test Button
        </button>
      </div>
    </div>
  );
}

export default SimpleApp;