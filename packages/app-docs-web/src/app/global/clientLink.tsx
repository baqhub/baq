"use client";

import {ComponentProps, FC} from "react";
import {Link} from "./link.js";

export const ClientLink: FC<ComponentProps<typeof Link>> = props => {
  return <Link {...props} />;
};
