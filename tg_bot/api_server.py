from aiohttp import web
import asyncio
from aiogram import Bot, Dispatcher, types
from config import BOT_TOKEN

# Initialize the Bot and Dispatcher
bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

async def handle_get_me(request):
    return web.json_response({
        "ok": True,
        "result": {
            "id": 123456789,
            "is_bot": True,
            "first_name": "TestBot",
            "username": "testbot"
        }
    })

async def handle_send_notifications(request):
    try:
        data = await request.json()
        chat_ids = data.get('chat_ids', [])
        message = data.get('message', '')
        print(data)
        for chat_id in chat_ids:
            await send_telegram_message(chat_id, message)
        return web.json_response({"status": "success"})
    except Exception as e:
        return web.json_response({"status": "failed", "reason": str(e)}, status=500)

async def send_telegram_message(chat_id, message):
    try:
        await bot.send_message(chat_id=chat_id, text=message)
    except Exception as e:
        print(f'Failed to send message to {chat_id}: {e}')

app = web.Application()
app.router.add_get('/getMe', handle_get_me)
app.router.add_post('/send_notifications', handle_send_notifications)

async def run_server():
    runner = web.AppRunner(app)
    await runner.setup()
    site = web.TCPSite(runner, host='localhost', port=8002)
    await site.start()

if __name__ == '__main__':
    asyncio.run(run_server())



