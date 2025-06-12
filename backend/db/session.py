# /Users/taf/Projects/Resume Portal/backend/db/session.py
import asyncpg
from typing import Optional
from core.config import settings  # Import the settings object

pool: Optional[asyncpg.Pool] = None


async def get_db_pool() -> asyncpg.Pool:
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            settings.DATABASE_URL
        )  # Access DATABASE_URL via settings
    return pool


async def close_db_pool():
    global pool
    if pool:
        await pool.close()
        pool = None


async def get_db_connection() -> asyncpg.Connection:
    db_pool = await get_db_pool()
    return await db_pool.acquire()


async def release_db_connection(conn: asyncpg.Connection):
    db_pool = await get_db_pool()
    await db_pool.release(conn)
