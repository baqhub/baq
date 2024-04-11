import {tw} from "@baqhub/ui/core/style.js";
import {FC} from "react";
import {MdxHeader} from "../../../../helpers/mdxHelpers.js";
import {MdxA, MdxLi, MdxP, MdxUl} from "./mdx.jsx";

//
// Props.
//

export interface TocProps {
  headers: ReadonlyArray<MdxHeader>;
}

//
// Style.
//

const TocLi = tw(MdxLi)`
  mt-1
  mb-1

  [&_li]:mt-1
  [&_li]:mb-1
  [&_>_p]:mt-1
  [&_>_p]:mb-1
  [&_>_&_>_p]:mt-1
  [&_>_&_>_p]:mb-1
`;

//
// Component.
//

export const Toc: FC<TocProps> = ({headers}) => {
  if (headers.length === 0) {
    return null;
  }

  const headersRender = headers.map((header, index) => {
    return (
      <TocLi key={index}>
        <MdxP>
          <MdxA
            href={`#${header.slug}`}
            dangerouslySetInnerHTML={{__html: header.content + "&shy;"}}
          />
        </MdxP>
        <Toc headers={header.subHeaders} />
      </TocLi>
    );
  });

  return <MdxUl>{headersRender}</MdxUl>;
};
