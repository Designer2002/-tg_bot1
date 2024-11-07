from collections.abc import Iterable
from datetime import datetime
from bs4 import BeautifulSoup

html = "rasp.html"
with open(html, 'r') as f:
    webpage = f.read()

soup = BeautifulSoup(webpage, features="html.parser")

# First, select the desired table element (the 2nd one on the page)
table = soup.find('table', {'class': 'table-list v-scrollable'})
current_day = ""

# Проход по всем строкам таблицы
def get_table():
    for row in table.find_all('tr'):
        # Если строка содержит день
        day_header = row.find('th', colspan="7")
        if day_header:
            current_day = day_header.text.strip()[:8]
        else:
            # Ищем ячейки с информацией
            cells = row.find_all('td')
            if cells:
                f1 = cells[0].text.strip()  # Аудитория
                f2 = cells[1].text.strip()  # Преподаватель
                f3 = cells[2].text.strip()  # Аудитория
                f4 = cells[3].text.strip()  # Преподаватель
                f5 = cells[4].text.strip()  # Аудитория
                yield current_day, f1, f2, f3, f4, f5



# Вывод результатов

def get_schedule(timerange):
    schedule = {}
    for entry in get_table():
        date = entry[0]
        if date not in schedule:
            schedule[date] = []
        schedule[date].append(entry)
    wanted_keys = None

    if isinstance(timerange, Iterable):
        wanted_keys = timerange
    else:
        # Assuming timerange is a single date string in DD.MM.YY format
        wanted_keys = [timerange]

    for date in wanted_keys:
        if date in schedule:  # Проверяем, есть ли дата в расписании
            lessons = schedule[date]
            if lessons:  # Проверяем, есть ли уроки для этой даты
                yield (f"{date}:")
                for lesson in lessons:
                    yield (lesson[1], lesson[2], lesson[3], lesson[4], lesson[5])
            else:
                yield (f"{date}: Нет уроков.")