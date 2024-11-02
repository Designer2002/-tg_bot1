import time

import requests
from requests_toolbelt.multipart import decoder

url = 'https://lms.mti.edu.ru/'

# Важно. По умолчанию requests отправляет вот такой
# заголовок 'User-Agent': 'python-requests/2.22.0 ,  а это приводит к тому , что Nginx
# отправляет 404 ответ. Поэтому нам нужно сообщить серверу, что запрос идет от браузера

user_agent_val = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/75.0.3770.142 Safari/537.36'

# Создаем сессию и указываем ему наш user-agent
session = requests.Session()
r = session.get(url, headers = {
    'User-Agent': user_agent_val
})

# Указываем referer. Иногда , если не указать , то приводит к ошибкам.
session.headers.update({'Referer':url})

#Хотя , мы ранее указывали наш user-agent и запрос удачно прошел и вернул
# нам нужный ответ, но user-agent изменился на тот , который был
# по умолчанию. И поэтому мы обновляем его.
session.headers.update({'User-Agent':user_agent_val})

# Получаем значение _xsrf из cookies
_xsrf = session.cookies.get('_xsrf', domain="mti.lms.edu.ru")

# Осуществляем вход с помощью метода POST с указанием необходимых данных
post_request = session.post(url, {
     'backUrl': 'https://lms.mti.edu.ru/schedule/academ',
     'popupUsername': 'marytun2003@gmail.com',
     'popupPassword': 'MaRy2002',
     '_xsrf':_xsrf,
})
print(post_request)
url = "https://lms.mti.edu.ru/schedule/academ/static/ru"
session.headers.update({'Referer':url})
session.headers.update({'Set-Cookie': 'PHPSESSID=95c8vj2s73r92idh0qa0a80mj6; path=/, nb=1; path=/; secure; HttpOnly'})

#Хотя , мы ранее указывали наш user-agent и запрос удачно прошел и вернул
# нам нужный ответ, но user-agent изменился на тот , который был
# по умолчанию. И поэтому мы обновляем его.
session.headers.update({'User-Agent':user_agent_val})

# Получаем значение _xsrf из cookies
_xsrf = session.cookies.get('_xsrf', domain="lms.mti.edu.ru")
r = session.get(url)
# multipart_data = decoder.MultipartDecoder.from_response(r)
#
# for part in multipart_data.parts:
#     print(part.content)  # Alternatively, part.text if you want unicode
#     print(part.headers)

print(r.text)