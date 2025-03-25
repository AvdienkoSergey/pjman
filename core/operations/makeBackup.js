export default {
  execute: async () => {
    console.log("makeBackup");
    // Возможно, стоит добавить реальную логику создания резервной копии
    return true;
  },
  undo: async () => {
    console.log("undo makeBackup");
    // Возможно, стоит добавить реальную логику отмены
    return true;
  },
};
