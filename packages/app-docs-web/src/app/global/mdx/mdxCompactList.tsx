import tiwi from "tiwi";

export const MdxCompactList = tiwi.div`
  [&_li]:mt-1
  [&_li]:mb-1

  [&_li_li]:mt-1
  [&_li_li]:mb-1
  [&_li_>_p]:mt-1
  [&_li_>_p]:mb-1
  [&_li_>_&_>_p]:mt-1
  [&_li_>_&_>_p]:mb-1
`;
