export function AnalysisResults({ data, loading, progress }) {
    const { 
        Box,
        LinearProgress,
        Typography,
        Paper,
        Table,
        TableBody,
        TableCell,
        TableContainer,
        TableHead,
        TableRow
    } = window.MUI;

    if (loading) {
        return React.createElement(
            Box,
            { sx: { width: '100%', mt: 2 } },
            [
                React.createElement(
                    LinearProgress,
                    { 
                        key: 'progress',
                        variant: 'determinate',
                        value: progress.percentage,
                        sx: { mb: 1 }
                    }
                ),
                React.createElement(
                    Typography,
                    { 
                        key: 'message',
                        variant: 'body2', 
                        color: 'text.secondary' 
                    },
                    progress.message
                )
            ]
        );
    }

    if (!data) return React.createElement(
        Box,
        { sx: { width: '100%', mt: 2 } },
        'No data'
    );

    const columns = [
        { id: 'name', label: 'Name' },
        { id: 'status', label: 'Status' },
        { id: 'current', label: 'Current Version' },
        { id: 'updates', label: 'Updates' },
        { id: 'security', label: 'Security' },
        { id: 'license', label: 'License' },
        { id: 'link', label: 'Repository' }
    ];

    return React.createElement(
        TableContainer,
        { component: Paper, sx: { mt: 2 } },
        React.createElement(
            Table,
            { size: 'small' },
            [
                React.createElement(
                    TableHead,
                    { key: 'head' },
                    React.createElement(
                        TableRow,
                        { key: 'header-row' },
                        columns.map(column => 
                            React.createElement(
                                TableCell,
                                { key: `header-${column.id}` },
                                column.label
                            )
                        )
                    )
                ),
                React.createElement(
                    TableBody,
                    { key: 'body' },
                    [...data.production, ...data.development].map((row, index) => 
                        React.createElement(
                            TableRow,
                            { key: `row-${row.name}-${index}` },
                            columns.map(column => 
                                React.createElement(
                                    TableCell,
                                    { key: `cell-${row.name}-${column.id}` },
                                    column.id === 'link' && row[column.id] !== '-' 
                                        ? React.createElement(
                                            'a',
                                            { 
                                                key: `link-${row.name}`,
                                                href: row[column.id],
                                                target: '_blank',
                                                rel: 'noopener'
                                            },
                                            'Repository'
                                        )
                                        : row[column.id]
                                )
                            )
                        )
                    )
                )
            ]
        )
    );
} 