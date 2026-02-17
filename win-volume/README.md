# win-volume action

Action выделяет временный subst-диск для Windows runner и автоматически очищает его в post-шаге (даже при ошибке job).

## Пример

```yaml
- name: setup temp drive
  id: win-volume
  uses: tapclap/util-action/win-volume@main
  with:
    workdir: ${{ github.workspace }}

- name: build native
  shell: bash
  working-directory: ${{ steps.win-volume.outputs.workdir || github.workspace }}
  run: |
    npx cocos-native configure --project=${{ inputs.project || inputs.platform }} --appPlatform=${{ inputs.app_platform }} --appEnv=${{ inputs.app_env }}
    npx cocos-native ${{ inputs.build_command }} --project=${{ inputs.project || inputs.platform }} --target=${{ inputs.target }}
```

## Inputs

### workdir
Опционально. Папка, которую нужно примапить через `subst`. По умолчанию — `${{ github.workspace }}`.

## Outputs

### volume
Буква выделенного диска.

### workdir
Путь к примапленной рабочей папке, например `X:/`.