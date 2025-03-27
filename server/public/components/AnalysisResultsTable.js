import { AnalysisResultsHead } from "./AnalysisResultsHead.js";
import { AnalysisResultsBody } from "./AnalysisResultsBody.js";
import { generateColumns } from "../utils/tableColumns.js";

export function AnalysisResultsTable({ data }) {
  const { Paper, Table, TableContainer } = window.MUI;
  const columns = generateColumns(data);

  return React.createElement(
    TableContainer,
    { component: Paper, sx: { mt: 2 } },
    React.createElement(Table, { size: "small" }, [
      React.createElement(AnalysisResultsHead, {
        key: "head",
        columns,
      }),
      React.createElement(AnalysisResultsBody, {
        key: "body",
        data,
        columns,
      }),
    ])
  );
}
