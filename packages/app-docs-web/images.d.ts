declare module "*.svg" {
  import {FC, SVGProps} from "react";
  const content: FC<SVGProps<SVGElement>>;
  export default content;
}

declare module "*.svg?url" {
  const content: any;
  export default content;
}

declare module "*.jpg" {
  import {StaticImageData} from "next/image.js";
  const content: StaticImageData;
  export default content;
}
