export function ProgressCircular({ progress }) {
  const { Box, CircularProgress, Typography } = window.MUI;

  return React.createElement(
    Box,
    {
      sx: {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      },
    },
    [
      React.createElement(CircularProgress, {
        key: "progress",
        variant: "determinate",
        value: progress.percentage,
        size: 40,
      }),
      React.createElement(
        Box,
        {
          key: "percentage-box",
          sx: {
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
        },
        React.createElement(
          Typography,
          {
            key: "percentage",
            variant: "caption",
            component: "div",
            sx: {
              color: "text.secondary",
              lineHeight: 1,
            },
          },
          `${Math.round(progress.percentage)}%`
        )
      ),
      // React.createElement(
      //   Typography,
      //   {
      //     key: "message",
      //     variant: "body2",
      //     color: "text.secondary",
      //   },
      //   progress.message
      // ),
    ]
  );
}

export default ProgressCircular;
