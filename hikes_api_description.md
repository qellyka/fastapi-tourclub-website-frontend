# 🏕️ Hikes API — описание всех ручек

Документация для маршрутов `/api/archive/hikes`  
Актуально после обновления схем и поля `difficulty_distribution` (теперь это `dict[str, int]`).

---

## 📘 1. GET /api/archive/hikes
Получить список всех походов.

### 🔹 Параметры:
Без параметров.

### 🔹 Требуемая роль:
`guest`

### 🔹 Пример ответа:
```json
{
  "status": "success",
  "message": "ok",
  "detail": [
    {
      "id": 1,
      "slug": "altai-2024",
      "name": "Поход по Алтаю",
      "start_date": "2024-08-05",
      "end_date": "2024-08-12",
      "tourism_type": "пеший",
      "complexity": "1 к.с.",
      "region": "Алтай",
      "leader_fullname": "Иванов Иван Иванович",
      "status": "published"
    }
  ]
}
```

### 🔹 Возвращает:
`CreateResponse[List[HikesRead]]`

---

## 📗 2. GET /api/archive/hikes/{identification}
Получить подробную информацию о походе по `id` или `slug`.

### 🔹 Параметры:
- `identification`: `int | str` — ID или slug похода.

### 🔹 Требуемая роль:
`guest`

### 🔹 Пример ответа:
```json
{
  "status": "success",
  "message": "ok",
  "detail": {
    "id": 7,
    "name": "Путешествие по Алтаю",
    "slug": "altai-2024",
    "tourism_type": "пеший",
    "complexity": "1 к.с.",
    "region": "Алтай",
    "route": "Горно-Алтайск — Телецкое озеро",
    "start_date": "2024-08-05",
    "end_date": "2024-08-12",
    "description": "Маршрут проходит через перевалы Южного Алтая.",
    "participants_count": 6,
    "duration_days": 8,
    "distance_km": 80.5,
    "difficulty_distribution": {
      "1А": 2,
      "1Б": 3,
      "2А": 1
    },
    "leader_id": 3,
    "photos_archive": "https://example.com/photos.zip",
    "report_s3_key": "a0b23c.pdf",
    "route_s3_key": "g1d45f.gpx",
    "geojson_data": {},
    "status": "published",
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 🔹 Возвращает:
`CreateResponse[HikeRead]`

---

## 📕 3. POST /api/archive/hikes
Создать новый поход (с отчётом и GPX файлом).

### 🔹 Формат запроса:
`multipart/form-data`

### 🔹 Требуемая роль:
`admin`

### 🔹 Поля формы:
| Поле | Тип | Обязательно | Описание |
|-------|------|-------------|-----------|
| `report_file` | `UploadFile (pdf)` | ✅ | Файл отчёта |
| `gpx_file` | `UploadFile (gpx)` | ✅ | GPX трек маршрута |
| `name` | `string` | ✅ | Название похода |
| `tourism_type` | `string` | ✅ | Тип туризма (например, "пеший") |
| `complexity` | `string` | ✅ | Категория сложности маршрута |
| `region` | `string` | ❌ | Регион проведения |
| `route` | `string` | ✅ | Нитка маршрута |
| `start_date` | `date` | ✅ | Дата начала похода |
| `end_date` | `date` | ✅ | Дата окончания |
| `description` | `string` | ❌ | Описание похода |
| `participants_count` | `int` | ✅ | Количество участников |
| `duration_days` | `int` | ❌ | Продолжительность в днях |
| `distance_km` | `float` | ❌ | Протяженность маршрута |
| `difficulty_distribution` | `object` | ❌ | Распределение препятствий по категориям сложности, например: `{ "1Б": 5, "1А": 1 }` |
| `leader_id` | `int` | ✅ | ID руководителя похода |
| `photos_archive` | `string` | ❌ | Ссылка на архив с фотографиями |

---

### 🔹 Пример тела запроса:
(формируется через `multipart/form-data`)
```
report_file: report.pdf
gpx_file: route.gpx
name: Поход по Алтаю
tourism_type: пеший
complexity: 1 к.с.
region: Алтай
route: Горно-Алтайск — Телецкое озеро
start_date: 2024-08-05
end_date: 2024-08-12
participants_count: 6
leader_id: 3
difficulty_distribution: {"1А": 2, "1Б": 3, "2А": 1}
```

### 🔹 Пример ответа:
```json
{
  "status": "success",
  "message": "New report of hike was created",
  "detail": {
    "id": 12,
    "name": "Поход по Алтаю",
    "slug": "pohod-po-altayu",
    "tourism_type": "пеший",
    "complexity": "1 к.с.",
    "leader_id": 3,
    "participants_count": 6,
    "difficulty_distribution": {
      "1А": 2,
      "1Б": 3
    },
    "report_s3_key": "a0b23c.pdf",
    "route_s3_key": "g1d45f.gpx",
    "geojson_data": {},
    "created_by": 1,
    "updated_by": 1
  }
}
```

### 🔹 Возвращает:
`CreateResponse[HikeRead]`

---

## 📙 4. PATCH /api/archive/hikes/{hike_id}
Обновить информацию о походе.

### 🔹 Формат запроса:
`multipart/form-data`

### 🔹 Требуемая роль:
`admin`

### 🔹 Поля формы:
Те же, что и при создании, но все необязательные.

### 🔹 Можно также передавать новые файлы:
- `report_file` — новый PDF отчёт (перезапишет старый)
- `gpx_file` — новый GPX маршрут (обновит geojson)

---

### 🔹 Пример запроса:
```
PATCH /api/archive/hikes/7

FormData:
{
  "description": "Добавлено уточнение маршрута",
  "participants_count": 7,
  "difficulty_distribution": {"1Б": 3, "2А": 2}
}
```

### 🔹 Пример ответа:
```json
{
  "status": "succes",
  "message": "ok",
  "detail": {
    "id": 7,
    "name": "Путешествие по Алтаю",
    "slug": "altai-2024",
    "participants_count": 7,
    "difficulty_distribution": {
      "1Б": 3,
      "2А": 2
    },
    "updated_by": 1
  }
}
```

### 🔹 Возвращает:
`CreateResponse[HikeRead]`

---

## 📒 5. DELETE /api/archive/hikes/{hike_id}
Удалить поход по ID.

### 🔹 Требуемая роль:
`admin`

### 🔹 Параметры:
- `hike_id`: `int` — идентификатор похода

### 🔹 Пример ответа:
Код `204 No Content` (без тела).

---

## 📔 6. GET /api/archive/hikes/{hike_id}/file/{file_type}
Скачать файл отчёта или маршрута.

### 🔹 Параметры:
- `hike_id`: `int`
- `file_type`: `"report"` или `"route"`

### 🔹 Пример запроса:
```
GET /api/archive/hikes/7/file/report
```

### 🔹 Пример ответа:
Возвращает бинарный файл (`application/pdf` или `application/gpx+xml`).

---

## 🧾 Примечания
- Поле `difficulty_distribution` теперь JSON-словарь (`dict[str, int]`).
- ORM модель хранит его в формате `JSON`, Pydantic — как `dict`.
- Остальной код (CRUD, ручки, загрузка файлов) не требует изменений.
