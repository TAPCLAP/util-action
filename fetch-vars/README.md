# fetch-vars action

action извлекает значения переменных из объекта `vars` на основе конфигурации `fetch` и устанавливает их как outputs.

Позволяет маппить переменные из одного источника (например, JSON/YAML объекта) в outputs GitHub Action с возможностью переименования и использования значений по умолчанию.

Пример:

vars:
```yaml
CHAMPIONSHIP_URL_EU: "https://champ-eu.example.com"
GOOGLE_BACKEND_DOMAIN: "https://backend-gogole.example.com"
```

fetch:
```yaml
- from: CHAMPIONSHIP_URL_EU
  to: championship_url
- from: GOOGLE_BACKEND_DOMAIN
  to: backend_url
```

defaults:
```yaml
- name: remote_static_url
  value: ""
```

Результат:
- output `championship_url` = `"https://champ-eu.example.com"`
- output `backend_url` = `"https://backend-gogole.example.com""`
- output `remote_static_url` = `""` (так как `remote_static_url` отсутствует в `vars`)

Таким образом, удобно извлекать нужные значения из большого объекта переменных, переименовывать их и задавать значения по умолчанию для отсутствующих переменных.


## Примеры

### Извлечение переменных из github vars

```yaml
jobs:
  fetch-vars:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    outputs:
      backend_url: ${{ steps.fetch_vars.outputs.backend_url }}
      championship_url: ${{ steps.fetch_vars.outputs.championship_url }}
      remote_static_url: ${{ steps.fetch_vars.outputs.remote_static_url }}
    steps:
    # nosemgrep
    - uses: tapclap/util-action/fetch-vars@main
      id: fetch-vars
      with:
        with:
          vars: ${{ toJSON(vars) }}
          defaults: |
            - name: remote_static_url
              value: ""
          fetch: |
            - from: CHAMPIONSHIP_URL_EU
              to: championship_url
            - from: GOOGLE_BACKEND_DOMAIN
              to: backend_url
    
  build-assets:
    needs: [fetch-vars]
    uses: ./.github/workflows/build-assets.yaml
    with:
      backend_url: ${{ needs.fetch-vars.outputs.backend_url }}
      championship_url: ${{ needs.fetch-vars.outputs.championship_url }}
      remote_static_url: ${{ needs.fetch-vars.outputs.remote_static_url }}
      environment: ${{ inputs.environment }}
    secrets: inherit

```


## Inputs

### `vars`
**Обязательный параметр**

Объект с переменными в формате JSON или YAML, из которого будут извлекаться значения.

**Пример:**
```yaml
CHAMPIONSHIP_URL_EU: "https://champ-eu.example.com"
GOOGLE_BACKEND_DOMAIN: "https://backend-gogole.example.com"
```

### `fetch`
**Обязательный параметр**

Конфигурация в формате YAML или JSON, определяющая какие переменные извлекать и как их называть в outputs.  
Каждый элемент должен содержать:
- `from` — имя переменной в объекте `vars`
- `to` — имя output, в который будет записано значение

**Пример:**
```yaml
- from: CHAMPIONSHIP_URL_EU
  to: championship_url
- from: GOOGLE_BACKEND_DOMAIN
  to: backend_url
```

### `defaults`
**Опциональный параметр**

Конфигурация значений по умолчанию в формате YAML или JSON.  
Используется, когда переменная отсутствует в `vars`.  
Каждый элемент должен содержать:
- `name` — имя output
- `value` — значение по умолчанию

**Пример:**
```yaml
- name: remote_static_url
  value: ""
```


## Outputs

Action динамически создаёт outputs на основе конфигурации `fetch` и `defaults`.

Для каждого элемента в `fetch` создаётся output с именем, указанным в поле `to`.  
Если переменная не найдена в `vars`, используется значение из `defaults` (если указано).

**Пример результата:**

При конфигурации:
```yaml
vars: |
  var1: val1
  var2: val2
fetch: |
  - from: var1
    to: new_var1
  - from: var2
    to: new_var2
```

Будут созданы outputs:
- `new_var1` — значение из `vars.var1`
- `new_var2` — значение из `vars.var2`

