import telebot
import sqlite3
API_TOKEN = '8090665949:AAHgPiMP8WP-jmXfBr3nCo2cNfkTmc1czjk'  # Замените на ваш токен
#bot = telebot.TeleBot(API_TOKEN)
bot = telebot.TeleBot('7355082915:AAG0C6xkBF99MX3KCjzPTziy1Xjk2uWkRpE')
# Функция для получения расписания
def get_schedule(group_name):
    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()
    cursor.execute("SELECT subject, day, time FROM schedule WHERE group_name = ?", (group_name,))
    results = cursor.fetchall()
    conn.close()
    return results

# Команда /start
@bot.message_handler(commands=['start'])
def send_welcome(message):
    bot.reply_to(message, "Добро пожаловать! Введите вашу группу для получения расписания.")

# Обработка текстовых сообщений
@bot.message_handler(func=lambda message: True)
def echo_all(message):
    group_name = message.text.strip()
    
    # Получаем расписание для группы
    schedule = get_schedule(group_name)
    
    if schedule:
        response = f"Расписание для группы {group_name}:\n"
        for subject, day, time in schedule:
            response += f"{day} - {subject} в {time}\n"
        bot.reply_to(message, response)
    else:
        bot.reply_to(message, "Расписание не найдено для данной группы.")

# Команда для FAQ
@bot.message_handler(commands=['faq'])
def send_faq(message):
    conn = sqlite3.connect('schedule.db')
    cursor = conn.cursor()
    cursor.execute("SELECT question, answer FROM faq")
    results = cursor.fetchall()
    conn.close()
    
    response = "FAQ:\n"
    for question, answer in results:
        response += f"{question}\n{answer}\n"
    bot.reply_to(message, response)

# Запускаем бота
bot.polling()
