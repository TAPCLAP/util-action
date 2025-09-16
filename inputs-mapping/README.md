# inputs mapping action

action формирует объединённый массив значений из параметра `mapping` на основе ключей, указанных в `inputs`.

Если в `inputs` для какого-то ключа значение равно `true`, то в итоговый массив добавляются элементы из `mapping`, соответствующие этому ключу.

Пример:

inputs:
```json
{
  "a": true,
  "b": false,
  "c": true
}
```

mapping:
```yaml
a: ["aaa"]
b: ["bbb"]
c: ["ccc"]
```

Результат будет
```yaml
["aaa", "ccc"]
```

Таким образом, удобно обрабатывать набор булевых параметров: для каждого параметра, равного true, автоматически собирается массив значений, на которые он замаплен.


## Примеры

### Хукаем workflow в зависимости от входных параметров

Ниже приведён пример, где запуск дополнительных workflow управляется через булевые параметры, переданные во входные данные (`inputs`).  
С помощью экшена `tapclap/util-action/inputs-mapping` из параметров формируется список workflow, которые нужно вызвать.  
Затем экшен `tapclap/util-action/hook-workflow` запускает эти workflow.
 

```yaml
name: example
concurrency:
  group: example
  cancel-in-progress: true
on:
  workflow_dispatch:
    inputs:
      all:
        description: 'all'
        required: true
        type: boolean
      draugiem:
        description: 'draugiem'
        required: true
        type: boolean
      facebook:
        description: 'facebook'
        required: true
        type: boolean
      facebook-instant:
        description: 'facebook-instant'
        required: true
        type: boolean
      huawei:
        description: 'huawei'
        required: true
        type: boolean
      mi-store:
        description: 'mi-store'
        required: true
        type: boolean

jobs:
  run:
    runs-on: ubuntu-latest
    steps:

    # nosemgrep
    - uses: tapclap/util-action/inputs-mapping@main
      id: inputs-mapping
      with:
        inputs: ${{ toJSON(inputs) }}
        mapping: |
          all: 
            - draugiem.yaml
            - name: facebook.yaml
              inputs:
                area: prod
            - facebook-instant.yaml
            - mi-store.yaml
          draugiem: [draugiem.yaml]
          facebook:
            - name: facebook.yaml
              inputs:
                area: prod
          facebook-instant: [facebook-instant.yaml]
          mi-store: [mi-store.yaml]
          huawei: 
            - name: huawei.yaml
              inputs:
                param1: aaa
                param2: bbb
    - run: 
        echo '${{ steps.inputs-mapping.outputs.mapped }}' | jq

    # nosemgrep
    - uses: tapclap/util-action/hook-workflow@main
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        workflows: ${{ steps.inputs-mapping.outputs.mapped }}

```


## Inputs

### `inputs`
Входной объект, где:  
- **ключи** — строки (имена параметров);  
- **значения** — булевые (`true` или `false`).  

**Пример:**
```json
{
  "facebook": true,
  "huawei": false
}
```

### `mapping`

Конфигурация сопоставлений, определяющая, какой ключ из `inputs` должен добавлять какие элементы в итоговый список.  
Значения могут быть как простыми (`["file.yaml"]`), так и объектами с дополнительными параметрами.

**Пример:**
```yaml
facebook:
  - name: facebook.yaml
    inputs:
      area: prod
```


## Outputs

### `mapped`

Итоговый массив, сформированный на основе `inputs` и `mapping`.  
Включает только те элементы, для которых во входных параметрах значение равно `true`.

**Пример результата:**
```yaml
["draugiem.yaml", "facebook.yaml", "mi-store.yaml"]
```
