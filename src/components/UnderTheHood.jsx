import { Network, Terminal, Cloud, BookOpen } from "lucide-react";

const underTheHoodItems = [
  {
    icon: Network,
    title: "Distributed Agent Orchestration",
    text: "Celery-backed worker queues dispatch AI agents across dedicated scan, verification, and AI worker pools — scaling horizontally with demand.",
    tone: "green"
  },
  {
    icon: Terminal,
    title: "Parallel Tool Execution",
    text: "Industry-standard scanners — Nuclei, nmap, httpx, sqlmap, dalfox, ffuf, subfinder, katana and more — run in parallel inside isolated containers.",
    tone: "blue"
  },
  {
    icon: Cloud,
    title: "Google Cloud Infrastructure",
    text: "Hosted on Google Cloud with regional failover, private networking, and encrypted-at-rest PostgreSQL — enterprise reliability from day one.",
    tone: "cyan"
  },
  {
    icon: BookOpen,
    title: "23 Specialized Pentest Skills",
    text: "Reconnaissance, OSINT, web-app logic, auth, injection, API security, client-side, infrastructure, cloud — each skill is a focused AI module with its own toolchain.",
    tone: "purple"
  }
];

export default function UnderTheHood() {
  return (
    <section className="under-hood-section" aria-labelledby="under-hood-title">
      <div className="under-hood-shell">
        <div className="section-kicker">Under The Hood</div>
        <h2 id="under-hood-title">Built for scale. Engineered for depth.</h2>
        <p className="under-hood-desc">
          A distributed scanning platform designed to run hundreds of parallel pentests
          without compromising on precision.
        </p>

        <div className="under-hood-grid">
          {underTheHoodItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <article className="under-hood-card" key={item.title}>
                <span className={`under-hood-icon ${item.tone}`}>
                  <IconComponent size={24} strokeWidth={1.8} />
                </span>
                <div className="under-hood-info">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
