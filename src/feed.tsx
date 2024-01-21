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
          <item key={item.key}>
            <title>{item.key}</title>
            <description>{item.key}</description>
            <enclosure
              url={`${props.host}/${FILE_PATH}/${encodeURI(item.key)}`}
              length={item.size}
              type={"audio/mpeg"}
            />
            <pubDate>{formatRfc822(item.uploaded)}</pubDate>
            <itunes:image href={artworkUrl(item.key)} />
          </item>
        ))}
      </channel>
    </rss>
  );
};

function artworkUrl(itemKey: string): string {
  const host = "https://private-podcast-artworks.fourside.dev";
  const basename = itemKey.replace(/-\d{8}.mp3/, "");
  return `${host}/${basename}.jpg`;
}
