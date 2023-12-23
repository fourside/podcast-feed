import { Hono } from "hono";
import { basicAuth } from "hono/basic-auth";
import { html } from "hono/html";
import { FILE_PATH, Feed } from "./feed";

type Bindings = {
  PRIVATE_PODCAST: R2Bucket;
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
  const buff = await file.arrayBuffer();
  return c.body(new Uint8Array(buff));
});

export default app;
