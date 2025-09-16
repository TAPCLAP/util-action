# hook workflow action

Хукает другие workflow которые с типом dispatch

## Примеры

### хукаем два workflow

```yaml
# nosemgrep
- uses: tapclap/util-action/hook-workflow@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    workflows: |
    - workflow1.yaml
    - workflow2.yaml
```

### Тоже самое но в json формате

```yaml
# nosemgrep
- uses: tapclap/util-action/hook-workflow@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    workflows: |
      [
        "workflow1.yaml",
        "workflow2.yaml"
      ]
```

### json в одну строку

```yaml
# nosemgrep
- uses: tapclap/util-action/hook-workflow@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    workflows: '["workflow1.yaml", "workflow2.yaml"]'
```

### передаем параметры
Также можно передать параметры в workflow

```yaml
# nosemgrep
- uses: tapclap/util-action/hook-workflow@main
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    workflows: |
    - name: workflow1.yaml
      inputs:
        param1: value1
        param2: value2
    - workflow2.yaml
```

Когда нам нужно передать параметры, то вместо строки, элемент массива должен быть объектом и в нём как минимум должно быть  поле `"name"`. Иначе action не поймёт какой workflow хукать


## Inputs

### `github_token`
github token для того чтобы хукнуть workflow

### `workflows`
Список workflows в yaml или json формате
