import { useEffect, useState, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { apiClient } from "../services/api/client";

/**
 * Hook to animate number from 0 to target value when triggered.
 */
function useAnimatedNumber(value, trigger) {
  const [current, setCurrent] = useState(0);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!trigger) return;
    if (value === null || value === undefined || typeof value !== "number") {
      setCurrent(value);
      return;
    }

    const start = 0;
    const end = value;
    if (start === end) {
      setCurrent(end);
      return;
    }

    const duration = 1500; // 1.5 seconds animation
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out quad formula: f(t) = t * (2 - t)
      const easeProgress = progress * (2 - progress);
      const isInteger = Number.isInteger(end);
      const nextRawValue = start + easeProgress * (end - start);
      const nextValue = isInteger ? Math.floor(nextRawValue) : Number(nextRawValue.toFixed(1));
      
      setCurrent(nextValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(end);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, trigger]);

  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return new Intl.NumberFormat().format(current);
  }
  return value;
}

export default function PlatformStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const sectionRef = useRef(null);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/stats/platform");
      setStats(response.data);
      setError(false);
    } catch (err) {
      console.error("[PlatformStats] Failed to fetch stats:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (loading || error) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true);
          observer.disconnect(); // Run animation once
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [loading, error]);

  if (loading) {
    return (
      <section className="stats-section loading" aria-label="Loading platform statistics">
        <div className="stats-container">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="stat-card skeleton">
              <div className="stat-value-placeholder animate-pulse"></div>
              <div className="stat-label-placeholder animate-pulse"></div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="stats-section error" aria-label="Platform statistics error">
        <div className="stats-error-wrapper">
          <AlertCircle size={24} className="error-icon" />
          <div className="error-content">
            <h3>Unable to load live statistics</h3>
            <p>Please check your connection and try again.</p>
          </div>
          <button onClick={fetchStats} className="retry-btn" type="button">
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="stats-section" ref={sectionRef} aria-label="Live platform statistics">
      <div className="stats-container">
        <div className="stat-card">
          <strong className="stat-value">
            <StatNumber value={stats?.totalScans} suffix="+" trigger={isInViewport} />
          </strong>
          <span className="stat-label">Scans Performed</span>
        </div>

        <div className="stat-card">
          <strong className="stat-value">
            <StatNumber value={stats?.totalFindings} suffix="+" trigger={isInViewport} />
          </strong>
          <span className="stat-label">Findings Detected</span>
        </div>

        <div className="stat-card">
          <strong className="stat-value">
            <StatNumber value={stats?.domainsScanned} suffix="+" trigger={isInViewport} />
          </strong>
          <span className="stat-label">Domains Scanned</span>
        </div>

        <div className="stat-card">
          <strong className="stat-value">
            <StatNumberUptime value={stats?.uptime} trigger={isInViewport} />
          </strong>
          <span className="stat-label">Platform Uptime</span>
        </div>

        <div className="stat-card">
          <strong className="stat-value">
            <StatNumber value={stats?.aiModels} suffix="" trigger={isInViewport} />
          </strong>
          <span className="stat-label">AI Models</span>
        </div>
      </div>
    </section>
  );
}

function StatNumber({ value, suffix = "", trigger }) {
  const animated = useAnimatedNumber(value, trigger);
  if (animated === null) return "—";
  return <>{animated}{suffix}</>;
}

function StatNumberUptime({ value, trigger }) {
  const animated = useAnimatedNumber(value, trigger);
  if (value === null || value === undefined) return "N/A";
  return <>{animated}%</>;
}
