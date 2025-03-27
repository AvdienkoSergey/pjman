import ProgressCircular from "./ProgressCircular.js";
import ProgressLinear from "./ProgressLinear.js";
import { AnalysisResultsTable } from "./AnalysisResultsTable.js";

export function AnalysisResults({ data, loading, progress }) {
  const { Box } = window.MUI;

  // if (loading) {
  //   return React.createElement(ProgressCircular, { progress });
  // }

  if (loading) {
    return React.createElement(ProgressLinear, { progress });
  }

  if (!data) {
    return React.createElement(
      Box,
      { sx: { width: "100%", mt: 2 } },
      "No data"
    );
  }

  return React.createElement(AnalysisResultsTable, { data });
}
