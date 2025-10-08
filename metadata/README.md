# metadata action

Экспортирует в output'ы различную информацию из контекста GitHub. Например в стандартных переменных есть `${{ github.repository }}`, но отделять имя owner или имя организации приходится в workflow. Другой пример, если требуется перевести имя организации или репозитория в нижний регистр.

Action также умеет работать извлекать информацию о Pull Request'ами при событиях комментирования PR, извлекая информацию о ветке и коммите и всё остальное. Проблема в том что по умолчанию при событии issue_comment на PR'е в теле события нет ничего о ветке PR'а и другой полезной информации

## Примеры

### Базовое использование
```yaml
  # nosemgrep
- uses: tapclap/util-action/metadata@main
  id: metadata
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
- run: |
    echo "Owner: ${{ steps.metadata.outputs.owner }}"
    echo "Owner lower case: ${{ steps.metadata.outputs.owner-lower-case }}"
    echo "Repository: ${{ steps.metadata.outputs.repository }}"
    echo "Repository lower case: ${{ steps.metadata.outputs.repository-lower-case }}"
    echo "PR data: ${{ steps.metadata.outputs.pull-request }}"
    echo "head ref: ${{ steps.metadata.outputs.head-ref }}"
    echo "head ref name: ${{ steps.metadata.outputs.head-ref-name }}"
    echo "head sha: ${{ steps.metadata.outputs.head-sha }}"
    echo "merge ref: ${{ steps.metadata.outputs.merge-ref }}"
    echo "merge sha: ${{ steps.metadata.outputs.merge-sha }}"
    echo "all: ${{ steps.metadata.outputs.all }}"
```


## Inputs

### `token`
- **Описание**: GitHub токен для доступа к API
- **Обязательный**: Да
- **Примечание**: Требуется при работе с событями issue_сomment для получения информации о связанном Pull Request

## Outputs

### `owner`
**Описание**: Имя владельца (owner) или организации репозитория

### `owner-lower-case`
**Описание**: Имя владельца (owner) или организации репозитория в нижнем регистре

### `repository`
**Описание**: Имя репозитория (только имя самого репозитория, без owner'а)

### `repository-lower-case`
**Описание**: Имя репозитория (только имя самого репозитория, без owner'а) в нижнем регистре

### `pull-request`
**Описание**: JSON данные о Pull Request. Содержит полную информацию о PR согласно [Octokit API](https://octokit.github.io/rest.js/v22/#pulls-get). Доступно для событий `pull_request` и `issue_comment` на PR. Для других событий возвращает пустой JSON объект `{}`

### `head-ref`
**Описание**: Полный ref ветки:
- Для push событий: `refs/heads/branch-name`
- Для Pull Request: `refs/heads/pr-head-branch-name`
- Для issue_comment на PR: `refs/heads/pr-head-branch-name`

### `head-ref-name`
**Описание**: Короткое имя ветки (без префикса `refs/heads/`):
- Для push событий: `branch-name`
- Для Pull Request: `pr-head-branch-name`
- Для issue_comment на PR: `pr-head-branch-name`

### `head-sha`
**Описание**: SHA коммита head ветки:
- Для push событий: commit sha ветки
- Для Pull Request: commit sha из head ветки PR
- Для issue_comment на PR: commit sha из head ветки PR

### `merge-ref`
**Описание**: Ref для merge:
- Для push событий: `refs/heads/branch-name`
- Для Pull Request: `refs/pull/pr-number/merge`
- Для issue_comment на PR: `refs/pull/pr-number/merge`

### `merge-sha`
**Описание**: SHA merge коммита:
- Для push событий: commit sha ветки
- Для Pull Request: commit sha merge PR
- Для issue_comment на PR: commit sha merge PR

### `all`
**Описание**: JSON объект содержащий все вышеперечисленные поля. Удобно использовать для передачи всех метаданных одним output'ом