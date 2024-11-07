
from collections.abc import Iterable
import datetime
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
                # Обработка разных типов строк
                f1 = cells[0].text.strip() if len(cells) > 0 else None  # Время
                f2 = cells[1].text.strip() if len(cells) > 1 else None  # Предмет
                f3 = cells[2].text.strip() if len(cells) > 2 else None  # Место проведения
                f4 = cells[3].text.strip() if len(cells) > 3 else None  # Тип занятия
                f5 = cells[4].text.strip() if len(cells) > 4 else None  # Преподаватель
                f6 = cells[5].text.strip() if len(cells) > 5 else None  # Дополнительная информация
                yield current_day, f1, f2, f3, f4, f5, f6


# Вывод результатов
def get_schedule_gen(timerange):
    schedule = {}
    for entry in get_table():
        date = entry[0]
        if date not in schedule:
            schedule[date] = []
        schedule[date].append(entry)

    if timerange in schedule:  # Проверяем, есть ли дата в расписании
        lessons = schedule[timerange]
        if lessons:  # Проверяем, есть ли уроки для этой даты
            return lessons
        else:
            return (f"{timerange}: Нет уроков.")
    else:
        return (f"{timerange}: Нет уроков.")
    
    
def get_schedule(timerange):
    message = ""
    if isinstance(timerange, Iterable) and not isinstance(timerange, str):
        for t in timerange:
            schedule = get_schedule_gen(t)
            if schedule:
                for i, lesson in enumerate(schedule):
                    date = lesson[0]
                    time = lesson[1]
                    subject = lesson[2]
                    location = lesson[3]
                    lesson_type = lesson[4]
                    teacher = lesson[5]
                    additional_info = lesson[6]

                    if i == 0:  # Выводим заголовок только для первого урока
                        message += "Расписание на {}:\n".format(date)
                        message += "\n"

                    message += f"Время: {time}\n"
                    message += f"Предмет: {subject}\n"
                    message += f"Место проведения: {location}\n"
                    if lesson_type:
                        message += f"Тип занятия: {lesson_type}\n"
                    if teacher:
                        message += f"Преподаватель: {teacher}\n"
                    if additional_info:
                        message += f"Дополнительная информация: {additional_info}\n"
                    message += ("-" * 20) + "\n"
            else:
                message += schedule  # Выводим сообщение о том, что уроков нет

    else:
        schedule = get_schedule_gen(timerange.strftime('%d.%m.%y'))
        if schedule:
            for i, lesson in enumerate(schedule):
                date = lesson[0]
                time = lesson[1]
                subject = lesson[2]
                location = lesson[3]
                lesson_type = lesson[4]
                teacher = lesson[5]
                additional_info = lesson[6]

                if i == 0:  # Выводим заголовок только для первого урока
                    message += "Расписание на {}:\n".format(date)
                    message += "\n"

                message += f"Время: {time}\n"
                message += f"Предмет: {subject}\n"
                message += f"Место проведения: {location}\n"
                if lesson_type:
                    message += f"Тип занятия: {lesson_type}\n"
                if teacher:
                    message += f"Преподаватель: {teacher}\n"
                if additional_info:
                    message += f"Дополнительная информация: {additional_info}\n"
                message += ("-" * 20) + "\n"
        else:
            message += schedule  # Выводим сообщение о том, что уроков нет

    return message

