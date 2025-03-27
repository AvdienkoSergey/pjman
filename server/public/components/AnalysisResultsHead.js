export function AnalysisResultsHead({ columns }) {
  const { TableCell, TableHead, TableRow } = window.MUI;

  return React.createElement(
    TableHead,
    null,
    React.createElement(
      TableRow,
      null,
      columns.map((column) =>
        React.createElement(
          TableCell,
          { key: `header-${column.id}` },
          column.label
        )
      )
    )
  );
}
