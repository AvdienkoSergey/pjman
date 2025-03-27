export function AnalysisResultsBody({ data, columns }) {
  const { TableBody, TableCell, TableRow } = window.MUI;

  return React.createElement(
    TableBody,
    null,
    [...data.production, ...data.development].map((row, index) =>
      React.createElement(
        TableRow,
        { key: `row-${row.name.value}-${index}` },
        columns.map((column) => {
          return React.createElement(
            TableCell,
            { key: `cell-${row.name.value}-${column.id}` },
            React.createElement(
              row[column.id].tag,
              {
                ...(row[column.id].tag === "a" && row[column.id].value !== "-"
                  ? {
                      key: `link-${row.name.value}`,
                      href: row[column.id].value,
                      target: "_blank",
                      rel: "noopener",
                    }
                  : {}),
                style: { color: row[column.id].color },
              },
              row[column.id].value
            )
          );
        })
      )
    )
  );
}
