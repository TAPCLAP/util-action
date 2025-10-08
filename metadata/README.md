# metadata action

Экспортирует в output'ы различную информацию из контекста GitHub. Например в стандартных переменных есть `${{ github.repository }}`, но отделять имя owner или имя организации приходится в workflow. Другой пример, если требуется перевести имя организации или репозитория в нижний регистр.

Action также умеет работать извлекать информацию о Pull Request'ами при событиях комментирования PR, извлекая информацию о ветке и коммите и всё остальное. Проблема в том что по умолчанию при событии issue_comment на PR'е в теле события нет ничего о ветке PR'а и другой полезной информации

## Примеры

### Базовое использование
```yaml
- uses: tapclap/util-action/metadata@main
  id: metadata
- run: |
    echo "Owner: ${{ steps.metadata.outputs.owner }}"
    echo "Repository: ${{ steps.metadata.outputs.repository }}"
    echo "Ref: ${{ steps.metadata.outputs.ref }}"
    echo "SHA: ${{ steps.metadata.outputs.sha }}"
```

### Использование с токеном для работы с событиями issue_comment на PR
```yaml
- uses: tapclap/util-action/metadata@main
  id: metadata
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
- run: |
    echo "PR data: ${{ steps.metadata.outputs.issue-pull-request }}"
```

## Inputs

### `token`
- **Описание**: GitHub токен для доступа к API
- **Обязательный**: Нет
- **По умолчанию**: `''` (пустая строка)
- **Примечание**: Требуется только при работе с issue комментариями для получения информации о связанном Pull Request

## Outputs

### `owner`
**Описание**: Имя владельца (owner) или организации репозитория

### `owner-lower-case`
**Описание**: Имя владельца (owner) или организации репозитория в нижнем регистре

### `repository`
**Описание**: Имя репозитория (только имя самого репозитория, без owner'а)

### `repository-lower-case`
**Описание**: Имя репозитория (только имя самого репозитория, без owner'а) в нижнем регистре

### `issue-pull-request`
**Описание**: JSON данные о Pull Request при событии комментария к issue. Содержит полную информацию о PR согласно [Octokit API](https://octokit.github.io/rest.js/v22/#pulls-get). Если событие не связано с issue комментарием, возвращает пустой JSON объект `{}`

### `ref`
**Описание**: Имя ветки (ref). Для Pull Request берется из head ветки, для issue комментариев на PR - из head ветки связанного PR

### `sha`
**Описание**: SHA коммита. Для Pull Request берется из head коммита, для issue комментариев на PR - из head коммита связанного PR