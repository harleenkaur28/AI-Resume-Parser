import asyncpg


async def init_db_schema(conn: asyncpg.Connection):

    await conn.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";')
    await conn.execute("CREATE EXTENSION IF NOT EXISTS citext;")

    await conn.execute("CREATE SCHEMA IF NOT EXISTS auth;")
    await conn.execute("CREATE SCHEMA IF NOT EXISTS resumes;")
    await conn.execute("CREATE SCHEMA IF NOT EXISTS hiring;")
    await conn.execute("CREATE SCHEMA IF NOT EXISTS comms;")
    await conn.execute("CREATE SCHEMA IF NOT EXISTS prep;")

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS auth.role (
            id   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name TEXT NOT NULL UNIQUE
        );
    """
    )

    await conn.execute(
        "INSERT INTO auth.role (name) VALUES ('admin') ON CONFLICT (name) DO NOTHING;"
    )
    await conn.execute(
        "INSERT INTO auth.role (name) VALUES ('user') ON CONFLICT (name) DO NOTHING;"
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS auth."user" (
            id             UUID       DEFAULT uuid_generate_v4() PRIMARY KEY,
            email          CITEXT     NOT NULL UNIQUE,
            hashed_password  TEXT       NOT NULL,
            role_id        UUID       NOT NULL REFERENCES auth.role(id) ON DELETE RESTRICT,
            is_verified    BOOLEAN    NOT NULL DEFAULT FALSE,
            created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """
    )
    await conn.execute(
        'CREATE INDEX IF NOT EXISTS idx_user_role_id ON auth."user"(role_id);'
    )

    await conn.execute(
        """
        CREATE OR REPLACE FUNCTION auth.timestamp_updated() RETURNS trigger AS $$
        BEGIN
            NEW.updated_at = NOW(); RETURN NEW;
        END; $$ LANGUAGE plpgsql;
    """
    )
    await conn.execute(
        """
        DROP TRIGGER IF EXISTS users_update_ts ON auth."user";
        CREATE TRIGGER users_update_ts
            BEFORE UPDATE ON auth."user"
            FOR EACH ROW EXECUTE FUNCTION auth.timestamp_updated();
    """
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS auth.email_verification (
            id            UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id       UUID        NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
            token         TEXT        NOT NULL UNIQUE,
            expires_at    TIMESTAMPTZ NOT NULL,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
            confirmed_at  TIMESTAMPTZ
        );
    """
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_email_verification_user_id ON auth.email_verification(user_id);"
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS resumes.resume (
            id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id           UUID        NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
            custom_name       TEXT        NOT NULL,
            file_url          TEXT        NOT NULL,
            upload_date       TIMESTAMPTZ NOT NULL DEFAULT now(),
            show_in_central   BOOLEAN     NOT NULL DEFAULT FALSE
        );
    """
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_resume_user_id ON resumes.resume(user_id);"
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_resume_show_in_central ON resumes.resume(show_in_central);"
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS resumes.analysis (
            id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            resume_id         UUID        NOT NULL UNIQUE REFERENCES resumes.resume(id) ON DELETE CASCADE,
            name              TEXT        NOT NULL,
            email             CITEXT      NOT NULL,
            contact           TEXT,
            predicted_field   TEXT        NOT NULL,
            college           TEXT,
            skills            JSONB       NOT NULL DEFAULT '[]'::jsonb,
            work_experience   JSONB       NOT NULL DEFAULT '[]'::jsonb,
            projects          JSONB       NOT NULL DEFAULT '[]'::jsonb,
            uploaded_at       TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_analysis_skills ON resumes.analysis USING GIN(skills);"
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_analysis_work_experience ON resumes.analysis USING GIN(work_experience);"
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_analysis_projects ON resumes.analysis USING GIN(projects);"
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS resumes.bulk_upload (
            id               UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            admin_id         UUID        NOT NULL REFERENCES auth."user"(id) ON DELETE SET NULL, -- Or CASCADE
            file_url         TEXT        NOT NULL,
            total_files      INTEGER     NOT NULL,
            succeeded        INTEGER     NOT NULL DEFAULT 0,
            failed           INTEGER     NOT NULL DEFAULT 0,
            uploaded_at      TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_bulk_upload_admin_id ON resumes.bulk_upload(admin_id);"
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS hiring.recruiter (
            id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            admin_id     UUID        NOT NULL UNIQUE REFERENCES auth."user"(id) ON DELETE CASCADE,
            email        CITEXT      NOT NULL,
            company_name TEXT        NOT NULL,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS comms.cold_mail_request (
            id                    UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id               UUID        NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
            recipient_name        TEXT        NOT NULL,
            recipient_designation TEXT        NOT NULL,
            company_name          TEXT        NOT NULL,
            sender_name           TEXT        NOT NULL,
            sender_role_or_goal   TEXT        NOT NULL,
            key_points            TEXT        NOT NULL,
            additional_info       TEXT,
            company_url           TEXT,
            created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
        );
    """
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_cold_mail_request_user_id ON comms.cold_mail_request(user_id);"
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS comms.cold_mail_response (
            id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            request_id   UUID        NOT NULL REFERENCES comms.cold_mail_request(id) ON DELETE CASCADE,
            subject      TEXT        NOT NULL,
            body         TEXT        NOT NULL,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        """
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_cold_mail_response_request_id ON comms.cold_mail_response(request_id);"
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS prep.interview_request (
            id             UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id        UUID        NOT NULL REFERENCES auth."user"(id) ON DELETE CASCADE,
            role           TEXT        NOT NULL,
            questions      JSONB       NOT NULL DEFAULT '[]'::jsonb, -- Stored as JSONB
            company_name   TEXT        NOT NULL,
            user_knowledge TEXT,
            company_url    TEXT,
            word_limit     INTEGER     NOT NULL,
            created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        """
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_interview_request_user_id ON prep.interview_request(user_id);"
    )

    await conn.execute(
        """
        CREATE TABLE IF NOT EXISTS prep.interview_answer (
            id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
            request_id   UUID        NOT NULL REFERENCES prep.interview_request(id) ON DELETE CASCADE,
            question     TEXT        NOT NULL,
            answer       TEXT        NOT NULL,
            created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        """
    )
    await conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_interview_answer_request_id ON prep.interview_answer(request_id);"
    )


async def initialize_database():
    conn = None

    try:

        from db.session import (
            get_db_connection,
            release_db_connection,
        )

        conn = await get_db_connection()
        await init_db_schema(conn)

        print("Database schema initialized successfully.")

    except Exception as e:
        print(f"Error initializing database schema: {e}")

    finally:
        if conn:
            await release_db_connection(conn)


if __name__ == "__main__":
    import asyncio

    asyncio.run(initialize_database())
