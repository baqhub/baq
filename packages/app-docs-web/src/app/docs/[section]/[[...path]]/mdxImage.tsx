import {tw} from "@baqhub/ui/core/style.js";
import isString from "lodash/isString.js";
import {ImageProps} from "next/image.js";
import {FC} from "react";
import {Image} from "../../../global/image.js";
import {isServerRendering} from "../../../global/serverRender.js";

//
// Style.
//

const Layout = tw.span`
  relative
  inline-block
  rounded-lg
  overflow-hidden
`;

const Border = tw.span`
  block
  absolute
  top-0
  right-0
  bottom-0
  left-0

  rounded-lg
  border
  border-neutral-600/30
`;

//
// Component.
//

export const MdxImage: FC<ImageProps> = props => {
  const isStatic = isServerRendering();
  const {src, alt} = props;
  if (isStatic || !isString(src)) {
    return null;
  }

  return (async () => {
    const image = await getImageAsync(src);
    return (
      <Layout>
        <Image {...image} alt={alt} />
        <Border />
      </Layout>
    );
  })();
};

//
// Image loading logic.
//

async function getImageAsync(imageName: string): Promise<ImageProps> {
  const imported = await import(`../../../../docs/assets/${imageName}.jpg`);
  const image: ImageProps = imported.default;

  return {
    src: image.src,
    alt: "",
    width: image.width,
    height: image.height,
  };
}
