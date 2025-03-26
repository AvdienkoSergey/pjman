import { Button } from './components/Button.js';
import { AnalysisResults } from './components/AnalysisResults.js';
import { executePlugin } from './client.js';

function AppContent() {
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [progress, setProgress] = React.useState({ percentage: 0, message: '' });

    React.useEffect(() => {
        window.client.on('progress', setProgress);
        return () => window.client.off('progress', setProgress);
    }, []);

    const handleExecutePlugin = async (name, target) => {
        setLoading(true);
        try {
            const result = await executePlugin(name, target);
            console.log("result", result)
            setData(result);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Создаем массив элементов с ключами
    const children = [
        React.createElement(Button, { 
            key: 'analyze-button',
            name: 'Analyze Dependencies',
            onExecutePlugin: handleExecutePlugin
        }),
        React.createElement(AnalysisResults, {
            key: 'analysis-results',
            data,
            loading,
            progress
        })
    ];

    return React.createElement(
        'div',
        { style: { padding: 20 } },
        children // Передаем массив с ключами
    );
}

function App() {
    const theme = window.MUI.createTheme({
        palette: {
            mode: 'light',
            primary: {
                main: '#1976d2',
            },
            secondary: {
                main: '#dc004e',
            },
        },
    });

    return React.createElement(
        window.MUI.ThemeProvider,
        { theme },
        [
            React.createElement(window.MUI.CssBaseline, { key: 'css-baseline' }),
            React.createElement(AppContent, { key: 'app-content' })
        ]
    );
}

const root = ReactDOMClient.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
