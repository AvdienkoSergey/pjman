export function generateColumns(data) {
  if (!data || !Object.values(data).every((value) => value.length > 0)) {
    return [];
  }

  if (Object.keys(data).length !== 3) {
    return [];
  }

  // Берем первый объект из данных для определения структуры
  const sampleRow = [...data.production, ...data.development][0];

  // Определяем отображаемые названия для каждого поля
  const columnLabels = Object.fromEntries(
    data.columns.map((column) => [column, column])
  );

  // Создаем массив колонок из ключей данных
  return Object.keys(sampleRow)
    .filter((key) => key in columnLabels) // Используем только известные поля
    .map((id) => ({
      id,
      label: columnLabels[id],
    }));
}
