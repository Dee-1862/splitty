export const About: React.FC = () => (
  <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
    <h2 style={{ color: '#007bff' }}>About This Application</h2>
    <p style={{ marginTop: '10px', lineHeight: '1.6' }}>
      This is a minimal React application built using Vite and React Router, demonstrating **client-side authentication** using Supabase. The goal is to provide a clear, basic structure for protecting routes and handling user sessions.
    </p>
    <ul style={{ marginTop: '15px', listStyleType: 'disc', marginLeft: '20px' }}>
      <li>The Login/Register pages are public but redirect if you're already logged in.</li>
      <li>The Dashboard is protected and redirects you to the login page if you try to access it while logged out.</li>
    </ul>
  </div>
);