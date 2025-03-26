async function executePlugin(commander, pluginName, target) {
    try {
       return await commander.execute(pluginName, target);
    } catch (error) {
        console.error(`Failed to execute plugin '${pluginName}':`, error.message);
        return false;
    }
}

async function listAvailablePlugins(operations) {
    console.log("Available plugins:");
    Object.keys(operations).forEach(plugin => {
        console.log(`  - ${plugin}`);
    });
}

async function handleUndo(commander, commandId) {
    try {
        const actualCommandId = commandId === true ? null : commandId;
        await commander.undo(0, actualCommandId);
        commander.showCommands();
    } catch (error) {
        console.error("Failed to undo command:", error.message);
    }
}

async function handleDelete(commander, commandId) {
    try {
        commander.deleteCommand(commandId);
        console.log(`Command ${commandId} deleted successfully.`);
        commander.showCommands();
    } catch (error) {
        console.error(`Failed to delete command: ${error.message}`);
    }
}

export { executePlugin, listAvailablePlugins, handleUndo, handleDelete };