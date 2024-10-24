import db from "../../src/db"

export async function run(): Promise<void> {
    if (!process.env.TG_ID) {
        throw new Error("TG_ID is required")
    }

    const user = await db.models.TgUser.create({
        tg_id: parseInt(process.env.TG_ID)
    })

    // @ts-ignore
    await user.createStudent()
}