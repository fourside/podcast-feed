import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { html } from "hono/html";
import { FILE_PATH, Feed } from "./feed";

type Bindings = {
  PRIVATE_PODCAST: R2Bucket;
  PRIVATE_PODCAST_ARTWORKS: R2Bucket;
  DB: D1Database;
  HOST: string;
  USERNAME: string;
  PASSWORD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/feed/*", async (c, next) => {
  const auth = basicAuth({
    username: c.env.USERNAME,
    password: c.env.PASSWORD,
  });
  return auth(c, next);
});

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

app.get("artworks/:file", async (c) => {
  const key = c.req.param("file");
  const file = await c.env.PRIVATE_PODCAST_ARTWORKS.get(key);
  if (file === null) {
    return c.notFound();
  }
  c.status(200);
  c.header("Content-Type", "image/jpg");
  const buff = await file.arrayBuffer();
  return c.body(new Uint8Array(buff));
});

export default app;
