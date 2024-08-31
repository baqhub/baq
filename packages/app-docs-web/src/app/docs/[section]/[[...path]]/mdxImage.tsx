import {tw} from "@baqhub/ui/core/style.jsx";
import isString from "lodash/isString.js";
import {ImageProps} from "next/image.js";
import {FC} from "react";
import {getImageAsync} from "../../../../helpers/fileHelpers.js";
import {Image} from "../../../global/image.jsx";
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
  border-white/30
  mix-blend-soft-light
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
