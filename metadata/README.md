# metadata action

Экспортитует в output'ы различную информацию из контекста. Например в стандартных переменных есть `${{ github.repository }}`. Но отделять имя owner или имя организации приходится в workflow. Другой пример, если требуется перевести имя организации или репоизитория в нижний регистр.

Может показаться что это бесполезный action, и это действительно так. Это личное моё IMHO, меня чутка раздражают shell вставки в workflow, особенно когда их скапливается много

## Примеры


```yaml
# nosemgrep
- uses: tapclap/util-action/metadata@main
  id: metadata
- run: |
    echo "${{ steps.metadata.outputs.owner }}"
    echo "${{ steps.metadata.outputs.owner-lower-case }}"
    echo "${{ steps.metadata.outputs.repository }}"
    echo "${{ steps.metadata.outputs.repository-lower-case }}"
```

## Inputs

Нет

## Outputs

### `owner`
имя owner или организации

### `owner-lower-case`
имя owner или организации

### `repository`
Имя репозитория (только имя самого репозитория, без owner'а)

### `repository-lower-case`
Имя репозитория (только имя самого репозитория, без owner'а) в нижнем регистре