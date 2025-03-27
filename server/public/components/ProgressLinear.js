export function ProgressLinear({ progress }) {
  const { Box, LinearProgress, Typography } = window.MUI;

  return React.createElement(Box, { sx: { width: "100%", mt: 2 } }, [
    React.createElement(LinearProgress, {
      key: "progress",
      variant: "determinate",
      value: progress.percentage,
      sx: { mb: 1 },
    }),
    React.createElement(
      Typography,
      {
        key: "message",
        variant: "body2",
        color: "text.secondary",
      },
      progress.message
    ),
  ]);
}
export default ProgressLinear;
