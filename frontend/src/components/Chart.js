import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from "recharts";

const Chart = ({ type, data, title }) => {
  const COLORS = ["#9CA3AF", "#3B82F6", "#F59E0B", "#10B981"];

  return (
    <Paper
      sx={{
        p: 3,
        bgcolor: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 2,
        height: 300,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{ fontWeight: 600, color: "#f8fafc", mb: 2 }}
      >
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height={240}>
        {type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <RechartsTooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
              }}
              itemStyle={{ color: "#f8fafc" }}
            />
          </PieChart>
        ) : (
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <RechartsTooltip
              contentStyle={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
              }}
              cursor={{ fill: "#334155" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </Paper>
  );
};

export default Chart;
