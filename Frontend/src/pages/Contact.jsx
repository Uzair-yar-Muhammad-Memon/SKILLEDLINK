import React from 'react';

export default function Contact() {
  const submit = e => {
    e.preventDefault();
    alert('Message sent (placeholder)');
  };
  return (
    <div className="section section--contact">
      <div className="container">
        <h1 className="section-title" style={{ color: '#fff' }}>Contact Us</h1>
        <form className="card translucent" onSubmit={submit} style={{ maxWidth: '640px' }}>
        <div className="form-grid">
          <div className="form-control">
            <label>Name</label>
            <input required />
          </div>
          <div className="form-control">
            <label>Email</label>
            <input type="email" required />
          </div>
        </div>
        <div className="form-control">
          <label>Message</label>
            <textarea required placeholder="How can we help?" />
        </div>
        <div className="form-actions">
          <button className="btn" type="submit">Send</button>
        </div>
        </form>
      </div>
    </div>
  );
}
