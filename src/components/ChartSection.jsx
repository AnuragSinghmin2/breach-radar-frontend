import "./chart.css";

import {

  Area,

  AreaChart,

  XAxis,

  YAxis,

  Tooltip,

  ResponsiveContainer,

  CartesianGrid,

} from "recharts";

import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useDashboard } from "../context/DashboardContext";



const ranges = ["Last 7 Days", "Last 14 Days", "Last 30 Days"];

const rangeDays = { "Last 7 Days": 7, "Last 14 Days": 14, "Last 30 Days": 30 };



function formatDay(date) {

  return new Intl.DateTimeFormat("en-GB", {

    day: "numeric",

    month: "short",

  }).format(date);

}



function buildActivityData(scans, days) {

  const buckets = {};



  for (let i = days - 1; i >= 0; i -= 1) {

    const date = new Date();

    date.setHours(0, 0, 0, 0);

    date.setDate(date.getDate() - i);

    buckets[formatDay(date)] = 0;

  }



  scans.forEach((scan) => {

    const key = formatDay(new Date(scan.createdAt));

    if (buckets[key] !== undefined) {

      buckets[key] += 1;

    }

  });



  return Object.entries(buckets).map(([day, count]) => ({ day, scans: count }));

}



function ChartTooltip({ active, payload, label }) {

  if (!active || !payload?.length) return null;



  return (

    <div className="scan-tooltip">

      <strong>{label}</strong>

      <span>Scans: {payload[0].value}</span>

    </div>

  );

}



export default function ChartSection() {

  const navigate = useNavigate();

  const { scans, loading } = useDashboard();

  const [rangeIndex, setRangeIndex] = useState(0);



  const activeRange = ranges[rangeIndex];



  const data = useMemo(

    () => buildActivityData(scans, rangeDays[activeRange]),

    [scans, activeRange]

  );



  const recentScans = useMemo(

    () =>

      scans.slice(0, 5).map((scan) => ({

        id: scan._id,

        name: scan.domainId?.domain || "Unknown",

        status: scan.status,

        score: scan.domainId?.score ?? scan.riskScore ?? "-",

      })),

    [scans]

  );



  const maxY = Math.max(10, ...data.map((item) => item.scans));



  return (

    <div className="chart-section">

      <div className="chart-card">

        <div className="chart-card-header">

          <h3>Scan Activity</h3>

          <button

            type="button"

            onClick={() => setRangeIndex((index) => (index + 1) % ranges.length)}

          >

            {activeRange}

          </button>

        </div>



        <div className="scan-chart-wrap">

          <ResponsiveContainer width="100%" height="100%">

            <AreaChart data={data} margin={{ top: 24, right: 8, left: -18, bottom: 0 }}>

              <defs>

                <linearGradient id="scanActivityFill" x1="0" y1="0" x2="0" y2="1">

                  <stop offset="0%" stopColor="#00d68f" stopOpacity={0.45} />

                  <stop offset="92%" stopColor="#00d68f" stopOpacity={0.03} />

                </linearGradient>

              </defs>

              <CartesianGrid stroke="rgba(44, 68, 94, 0.55)" vertical={false} />

              <XAxis

                dataKey="day"

                axisLine={false}

                tickLine={false}

                tick={{ fill: "#aeb8c7", fontSize: 12, fontWeight: 700 }}

                dy={10}

              />

              <YAxis

                domain={[0, maxY]}

                axisLine={false}

                tickLine={false}

                tick={{ fill: "#aeb8c7", fontSize: 12, fontWeight: 700 }}

              />

              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(0, 214, 143, 0.22)" }} />

              <Area

                type="monotone"

                dataKey="scans"

                stroke="#00d68f"

                strokeWidth={3}

                fill="url(#scanActivityFill)"

                dot={false}

                activeDot={{ r: 5, fill: "#00d68f", stroke: "#071321", strokeWidth: 2 }}

              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>



      <div className="scan-card">

        <h3>Recent Scans</h3>



        {loading && <p className="scan-empty">Loading scans...</p>}

        {!loading && recentScans.length === 0 && <p className="scan-empty">No scans yet.</p>}



        {recentScans.map((item) => (

          <button

            key={item.id}

            className="scan-item"

            type="button"

            onClick={() => navigate(`/scans?domain=${encodeURIComponent(item.name)}`)}

          >

            <div>

              <p>{item.name}</p>

              <span

                className={

                  item.status === "Completed" ? "status success" : "status failed"

                }

              >

                {item.status}

              </span>

            </div>



            <div className="score">{item.score}</div>

          </button>

        ))}

      </div>

    </div>

  );

}

