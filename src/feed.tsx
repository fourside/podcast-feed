import type { FC } from "hono/jsx";
import { formatRfc822 } from "./format-rfc822";

interface Props {
  host: string;
  objects: R2Object[];
}

export const FILE_PATH = "files";

export const Feed: FC<Props> = (props) => {
  return (
    <rss
      version="2.0"
      xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
    >
      <channel>
        <description>private podcast</description>
        <title>private podcast</title>
        <pubDate>{formatRfc822(new Date())}</pubDate>
        {props.objects.map((item) => (
          <Item host={props.host} item={item} />
        ))}
      </channel>
    </rss>
  );
};

interface ItemProps {
  host: string;
  item: R2Object;
}
const Item: FC<ItemProps> = (props) => {
  const ext = props.item.key.split(".").pop();
  const mimeType =
    ext === "mp3" ? "audio/mpeg" : ext === "aac" ? "audio/x-aac" : "";
  return (
    <item key={props.item.key}>
      <title>{props.item.key}</title>
      <description>{props.item.key}</description>
      <enclosure
        url={`${props.host}/${FILE_PATH}/${encodeURI(props.item.key)}`}
        length={props.item.size}
        type={mimeType}
      />
      <pubDate>{formatRfc822(props.item.uploaded)}</pubDate>
      <itunes:image href={artworkUrl(props.item.key)} />
    </item>
  );
};

function artworkUrl(itemKey: string): string {
  const host = "https://private-podcast-artworks.fourside.dev";
  const basename = itemKey.replace(/-\d{8}.mp3/, "");
  return `${host}/${encodeURI(basename)}.jpg`;
}
