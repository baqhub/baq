import isString from "lodash/isString.js";
import {ImageProps} from "next/image.js";
import {FC} from "react";
import tiwi from "tiwi";
import {
  getImageAsync,
  tryGetImageDarkAsync,
} from "../../../helpers/fileHelpers.js";
import {Image} from "../image.jsx";
import {isServerRendering} from "../serverRender.js";

//
// Style.
//

const Layout = tiwi.span`
  relative
  inline-block
  rounded-xl
  overflow-hidden
  [&_>_img]:min-w-full
`;

const Border = tiwi.span`
  block
  absolute
  top-0
  right-0
  bottom-0
  left-0

  rounded-xl
  border
  border-white/30
  mix-blend-soft-light
  pointer-events-none
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
    const darkImage = await tryGetImageDarkAsync(src);

    const renderImage = () => {
      if (!darkImage) {
        return <Image {...image} alt={alt} className="block" />;
      }

      return (
        <>
          <Image {...image} alt={alt} className="block dark:hidden" />
          <Image {...darkImage} alt={alt} className="hidden dark:block" />
        </>
      );
    };

    return (
      <Layout>
        {renderImage()}
        <Border />
      </Layout>
    );
  })();
};
