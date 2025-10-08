# PR Utils Action

GitHub Action для управления комментариями в Pull Request и создания check runs с информацией.

## Описание

Этот action позволяет:
- Создавать или обновлять комментарии в Pull Request
- Удалять дубликаты старых комментариев с таким же содержимым
- Добавлять информацию в Job Summary
- Опционально создавать GitHub Check Run со статусом успеха
- Использовать шаблонизацию для динамического содержимого

## Использование

### Базовый пример

```yaml
- name: PR comment and check run
if: github.event.pull_request || github.event.issue.pull_request 
uses: tapclap/util-action/pr-utils@pr-utils
with:
    token: ${{ secrets.GITHUB_TOKEN }}
    info: 'Приложение будет развёрнуто на url: https://{{ domain }}'
    check-run: levels-pr
    template-vars: |
        domain: gems2-levels-${{ steps.set-vars.outputs.pr-number }}.${{ vars.STAND_DOMAIN }}

```

## Как это работает

1. **Удаление дубликатов**: Action сначала ищет все комментарии в PR с точно таким же текстом и удаляет их
2. **Создание комментария**: Создает новый комментарий с указанным содержимым
3. **Job Summary**: Добавляет информацию в GitHub Actions Job Summary
4. **Check Run** (опционально): Создает GitHub Check Run со статусом "success" и текстом из `info`

## Требования

- GitHub Actions workflow, запущенный в контексте Pull Request
- GitHub token с правами на создание комментариев и check runs

## Примечания

- Action работает только в контексте Pull Request
- Комментарии с идентичным текстом автоматически заменяются (старые удаляются)
- Check Run всегда создается со статусом "success"
- Поддерживается Markdown форматирование в тексте комментария


## Inputs

### `token` (обязательный)
GitHub токен для доступа к API. Обычно используется `${{ secrets.GITHUB_TOKEN }}`.

### `info` (обязательный)
Текст комментария для Pull Request. Поддерживает Markdown и шаблонизацию через переменные `{{ variable }}`.

### `template-vars` (опциональный)
YAML-строка с переменными для шаблонизации. Переменные будут заменены в тексте `info`.

**Пример:**
```yaml
template-vars: |
  name: John
  status: success
```

### `check-run` (опциональный)
Название GitHub Check Run, который будет создан. Если не указан, check run не создается.

