import datetime
import os

from telebot import TeleBot, types

import table_parser

bot_token = os.getenv('API_TOKEN')
bot = TeleBot(bot_token)


@bot.message_handler(commands=['start'])
def send_welcome(message):
    markup = types.ReplyKeyboardMarkup(resize_keyboard=True)
    c1 = types.KeyboardButton('Сегодня')
    c2 = types.KeyboardButton('Завтра')
    c3 = types.KeyboardButton('На этой неделе')
    c4 = types.KeyboardButton('На следующей неделе')
    markup.add(c1, c2, c3, c4)

    bot.send_message(message.chat.id, "Выберите команду:", reply_markup=markup)


def rest_of_week():
    tw = datetime.today().weekday() + 1
    if tw>5:
        return "Адихай брад((("
    else:
        data = []
        for i in range(6-tw):
            print(i)
            data.append((datetime.today()+datetime.timedelta(days=i)).strftime('%d.%m.%y'))
        return data


@bot.message_handler(func=lambda message: True)
def handle_message(message):
    if message.text == 'Сегодня':
        # Здесь добавьте логику для отображения расписания на сегодняшний день
        bot.send_message(message.chat.id, table_parser.get_schedule(datetime.date.today()))
    elif message.text == 'Завтра':
        # Здесь добавьте логику для отображения расписания на завтрашний день
        bot.send_message(message.chat.id, table_parser.get_schedule(datetime.date.today() + datetime.timedelta(days=1)))
    elif message.text == 'На этой неделе':
        # Здесь добавьте логику для отображения расписания на эту неделю
        bot.send_message(message.chat.id, table_parser.get_schedule(rest_of_week()))
    elif message.text == 'На следующей неделе':
        # Здесь добавьте логику для отображения расписания на следующую неделю
        bot.send_message(message.chat.id, "AMOGUS")


# Запуск бота
bot.polling()