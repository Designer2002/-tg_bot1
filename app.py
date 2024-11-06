import datetime

from telebot import TeleBot, types

import table_parser

bot = TeleBot(API_TOKEN)


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
    tw = datetime.date.today().weekday()
    if tw>5:
        return "Адихай брад((("
    else:
        data = []
        for i in range(5-tw):
            data.append(datetime.date.today()+datetime.timedelta(days=i))
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
