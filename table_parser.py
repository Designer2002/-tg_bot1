from collections.abc import Iterable
from bs4 import BeautifulSoup

html = "rasp.html"
import io
with io.open(html, encoding='utf-8') as f:
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

def get_schedule_gen(timerange):
    schedule = {}
    for entry in get_table():
        date = entry[0]
        if date not in schedule:
            schedule[date] = []
        schedule[date].append(entry)
    wanted_keys = None

    if isinstance(timerange, Iterable):
        wanted_keys = timerange
        for date in wanted_keys:
            if date in schedule:  # Проверяем, есть ли дата в расписании
                lessons = schedule[date]
                if lessons:  # Проверяем, есть ли уроки для этой даты
                    yield (f"{date}:")
                    for lesson in lessons:
                        yield (lesson[1], lesson[2], lesson[3], lesson[4], lesson[5])
                else:
                    yield (f"{date}: Нет уроков.")
    else:

        wanted_keys = timerange.strftime('%d.%m.%y') # Оборачиваем число в список
        if wanted_keys in schedule:  # Проверяем, есть ли дата в расписании
            lessons = schedule[wanted_keys]
            if lessons:  # Проверяем, есть ли уроки для этой даты
                yield (f"{wanted_keys}:")
                for lesson in lessons:
                    yield (lesson[1], lesson[2], lesson[3], lesson[4], lesson[5])
            else:
                yield (f"{wanted_keys}: Нет уроков.")
    

def get_schedule(timerange):
    d = []
    for data in get_schedule_gen(timerange):
        d.append(data)
    schedule = d
    """Форматирует расписание в красивое сообщение."""
    message = "Расписание на {}:\n".format(schedule[0])

    for item in schedule[1:]:
        time, subject, room, type, teacher = item
        message += f"{time} - {subject} ({room}) - {type} ({teacher})\n"

    return message