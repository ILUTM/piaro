import asyncio
import logging
import random
import string
import requests

from aiogram import Bot, Dispatcher, types
from aiogram.filters import CommandStart, Command
from aiogram.types import Message
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import StatesGroup, State
from aiogram.fsm.storage.memory import MemoryStorage
from config import BOT_TOKEN
from api_server import run_server
from db import store_chat_id, store_verification_code, get_user_chat_id, get_verification_code, delete_verification_code

# Initialize the Dispatcher and Bot
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
bot = Bot(token=BOT_TOKEN)

# State definitions
class VerificationStates(StatesGroup):
    waiting_for_username = State()

# Command handler for /start
@dp.message(CommandStart())
async def command_start_handler(message: Message) -> None:
    chat_id = message.chat.id
    username = message.from_user.username
    store_chat_id(username, chat_id)
    await message.answer(f"Hello, {message.from_user.full_name}! Use /confirm_tg to verify your Telegram contact.")

# Command handler for /confirm_tg
@dp.message(Command("confirm_tg"))
async def confirm_tg_handler(message: Message, state: FSMContext) -> None:
    await state.set_state(VerificationStates.waiting_for_username)
    await message.answer("Please type your profile username (the one you used in the app):")

# State handler for waiting_for_username
@dp.message(VerificationStates.waiting_for_username)
async def username_handler(message: Message, state: FSMContext) -> None:
    username = message.text
    chat_id = message.chat.id
    verification_code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
    store_verification_code(username, verification_code)
    
    # Send username and verification code to the backend
    payload = {
        "user": username,
        "chat_id": chat_id,
        "confirmation_code": verification_code
    }
    try:
        response = requests.post('http://localhost:8000/api/users/store_verification_code/', json=payload)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        await message.answer(f"Failed to send verification code to backend: {str(e)}")
    
    await message.answer(f"Your confirmation code is: {verification_code}")
    await state.clear()

async def start_bot():
    logging.basicConfig(level=logging.INFO)
    await dp.start_polling(bot)

# Main function to start the server and the bot
async def main():
    api_server_task = asyncio.create_task(run_server())
    bot_task = asyncio.create_task(start_bot())
    await asyncio.gather(api_server_task, bot_task)

if __name__ == "__main__":
    asyncio.run(main())




