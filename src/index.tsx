import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { html } from "hono/html";
import { object, pattern, string, validate, type Describe } from "superstruct";
import { FILE_PATH, Feed } from "./feed";

type Bindings = {
  PRIVATE_PODCAST: R2Bucket;
  DB: D1Database;
  HOST: string;
  USERNAME: string;
  PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

for (const path of ["/feed/*", "/tasks/*"]) {
  app.use(path, async (c, next) => {
    const auth = basicAuth({
      username: c.env.USERNAME,
      password: c.env.PASSWORD,
    });
    return auth(c, next);
  });
}

app.get("/feed", async (c) => {
  const list = await c.env.PRIVATE_PODCAST.list();
  const xml = html`<?xml version="1.0" encoding="UTF-8"?>${(
    <Feed
      host={c.env.HOST}
      objects={list.objects.toSorted(
        (a, b) => b.uploaded.getTime() - a.uploaded.getTime(),
      )}
    />
  )}`;
  return c.html(xml, 200, { "Content-Type": "application/xml" });
});

app.get(`${FILE_PATH}/:file`, async (c) => {
  const key = c.req.param("file");
  const file = await c.env.PRIVATE_PODCAST.get(key);
  if (file === null) {
    return c.notFound();
  }
  return c.stream(async (stream) => {
    const buff = await file.arrayBuffer();
    await stream.write(new Uint8Array(buff));
  });
});

interface ProgramModel {
  stationId: string;
  title: string;
  fromTime: string; // yyyymmddHHmm
  duration: string; // min
  personality: string;
}

interface ProgramRecord extends ProgramModel {
  id: string;
}

app.get("/tasks", async (c) => {
  const statement = c.env.DB.prepare(
    "SELECT * FROM Tasks ORDER BY createdAt DESC",
  );
  const result = await statement.all<ProgramRecord>();
  if (result.success) {
    return c.json(JSON.stringify(result.results));
  }
  console.error(result.error);
  return c.json({ message: "error" }, 500);
});

const programSchema: Describe<ProgramModel> = object({
  stationId: string(),
  title: string(),
  fromTime: pattern(string(), /^\d{12}$/),
  duration: pattern(string(), /^\d+$/),
  personality: string(),
});

app.post("/tasks", async (c) => {
  const json = await c.req.json();
  const [err, program] = validate(json, programSchema);
  if (err !== undefined) {
    return c.json({ message: JSON.stringify(err) }, 400);
  }
  const id = crypto.randomUUID();
  const statement = c.env.DB.prepare(
    `INSERT INTO Tasks
      (id, stationId, title, fromTime, duration, personality)
    VALUES
      (?1, ?2, ?3, ?4, ?5, ?6)`,
  ).bind(
    id,
    program.stationId,
    program.title,
    program.fromTime,
    program.duration,
    program.personality,
  );
  const result = await statement.run();
  if (result.success) {
    return c.json({ message: "success" }, 201);
  }
  console.error(result.error);
  return c.json({ message: "error" }, 500);
});

app.delete("/tasks/:id", async (c) => {
  const id = c.req.param("id");
  const statement = c.env.DB.prepare("DELETE FROM Tasks WHERE id = ?1").bind(
    id,
  );
  const result = await statement.run();
  if (result.success) {
    return c.json({ message: "success" });
  }
  console.error(result.error);
  return c.json({ message: "error" }, 500);
});

export default app;
