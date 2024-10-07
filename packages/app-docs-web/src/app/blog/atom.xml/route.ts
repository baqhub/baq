import {Feed} from "feed";
import faviconApple from "../../../docs/assets/faviconApple.png";
import {getImageAsync} from "../../../helpers/fileHelpers.js";
import {blogPosts} from "../../../services/blog.js";
import {Constants} from "../../global/constants.js";

export async function GET() {
  const url = Constants.baseUrl.toString();

  const feed = new Feed({
    title: "BAQ Blog",
    description: "Back to BAQ news coverage.",
    id: `${url}blog`,
    link: `http://${url}blog`,
    language: "en",
    image: `${url}${faviconApple.src.slice(1)}`,
    favicon: `${url}favicon.ico`,
    copyright: `${new Date().getFullYear()} Quentez Corporation`,
    updated: new Date(),
    generator: "BAQ Blog",
    feedLinks: {
      atom: `http://${url}blog/atom.xml`,
    },
  });

  await Promise.all(
    blogPosts.map(async post => {
      const postImage = await getImageAsync(post.image + "Big");
      console.log("Got:", postImage.src.toString());
      feed.addItem({
        title: post.title,
        author: [
          {
            name: post.author.name,
            email: post.author.email,
          },
        ],
        link: `${url}blog/${post.path}`,
        description: post.description,
        date: post.date,
        image: `${url}${postImage.src.toString().slice(1)}`,
      });
    })
  );

  return new Response(feed.atom1(), {
    headers: {"Content-Type": "application/xml; charset=utf-8"},
  });
}
