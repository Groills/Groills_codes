import React from 'react';

interface EmailProps {
  username: string;
  otp: string;
}


export function EmailTemplate({ username, otp }: EmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '16px', lineHeight: '1.6' }}>
      <h2>Welcome, {username} 👋</h2>
      <p>Thanks for registering! Please use the following verification code:</p>
      <h3 style={{ backgroundColor: '#f4f4f4', padding: '10px', display: 'inline-block' }}>
        {otp}
      </h3>
      <p>This code will expire in 1 hour.</p>
      <p>Best regards,<br />The Team</p>
    </div>
  );
}
