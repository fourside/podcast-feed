import dayjs from "dayjs";
import type { FC } from "hono/jsx";

interface Props {
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
              url={`/${FILE_PATH}/${encodeURI(item.key)}`}
              length={item.size}
              type={"audio/mpeg"}
            />
            <pubDate>{formatRfc822(item.uploaded)}</pubDate>
          </item>
        ))}
      </channel>
    </rss>
  );
};

function formatRfc822(date: Date): string {
  return dayjs(date).format("ddd, DD MMM YYYY HH:mm:ss ZZ");
}
