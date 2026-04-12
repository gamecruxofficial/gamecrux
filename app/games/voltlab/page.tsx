"use client";

import { useEffect, useState } from "react";

export default function Voltlab() {
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    // Fetch the HTML file from the public folder
    fetch("/index.html")
      .then((response) => response.text())
      .then((html) => {
        // Make any changes to the HTML content here if needed
        setHtmlContent(html);
      })
      .catch((err) => console.error("Failed to load HTML:", err));
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }} className="bg-black">
      {/* Render the complete HTML content including head and body */}
      <iframe
      srcDoc={htmlContent}
      style={{ width: '80%', height: '80vh', border: 'none' }}
      title="Voltlab Game"
      />
    </div>
  );
}
