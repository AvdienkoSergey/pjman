export function Button({ name, onExecutePlugin }) {
    const { Button } = window.MUI;
    
    return React.createElement(
        Button,
        {
            variant: 'contained',
            color: 'primary',
            onClick: () => onExecutePlugin('analyze', 'package.json'),
            startIcon: React.createElement('span', { 
                className: 'material-icons' 
            }, 'analytics')
        },
        name
    );
}