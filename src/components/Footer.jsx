import "./footer.css";

export default function Footer() {
  return (
    <div className="footer">

      {/* LEFT */}
      <div className="footer-left">
        <h2>🛡 SecureScan</h2>
        <p>
          AI-powered security scanning platform <br />
          to protect your digital assets.
        </p>

        <div className="socials">
          <span>🐦</span>
          <span>💼</span>
          <span>💻</span>
          <span>▶️</span>
        </div>
      </div>

      {/* LINKS */}
      <div className="footer-links">

        <div>
          <h4>Product</h4>
          <p>Features</p>
          <p>How It Works</p>
          <p>Pricing</p>
          <p>Changelog</p>
        </div>

        <div>
          <h4>Solutions</h4>
          <p>Web Applications</p>
          <p>API Security</p>
          <p>Compliance</p>
          <p>Integrations</p>
        </div>

        <div>
          <h4>Resources</h4>
          <p>Documentation</p>
          <p>Blog</p>
          <p>Security Guide</p>
          <p>Help Center</p>
        </div>

        <div>
          <h4>Company</h4>
          <p>About Us</p>
          <p>Careers</p>
          <p>Privacy Policy</p>
          <p>Terms of Service</p>
        </div>

      </div>

      {/* RIGHT */}
      <div className="footer-right">
        <p>© 2024 SecureScan. All rights reserved.</p>

        <div className="badges">
          <span>ISO 27001<br/>Certified</span>
          <span>GDPR<br/>Compliant</span>
          <span>SOC 2<br/>Type II</span>
        </div>
      </div>

    </div>
  );
}