import {Column, Row} from "@baqhub/ui/core/style.jsx";
import {DiscordIcon} from "@baqhub/ui/icons/filled/discord.jsx";
import {GithubIcon} from "@baqhub/ui/icons/filled/github.jsx";
import {EnvelopeIcon} from "@heroicons/react/24/solid";
import {FC} from "react";
import tiwi from "tiwi";
import {Text} from "./style.jsx";

//
// Style.
//

const Layout = tiwi(Column)`
  py-6

  border-t
  border-zinc-200
  dark:border-zinc-700
`;

const Content = tiwi(Row)`
  gap-3
  items-center
`;

const Copy = tiwi(Text)`
  flex-1
  text-md
  text-zinc-400
  dark:text-zinc-500
`;

const CopySm = tiwi.span`
  hidden
  sm:inline
`;

const SayHi = tiwi(Text)`
  hidden
  sm:block

  text-md
  text-zinc-400
  dark:text-zinc-500
`;

const ExternalLink = tiwi.a`
  shrink-0
  block
  p-0.5

  text-zinc-400
  hover:text-zinc-600
  dark:text-zinc-500
  dark:hover:text-zinc-300
`;

const ExternalLinkIcon = tiwi.div`
  w-5
  h-5
`;

//
// Component.
//

const year = new Date().getFullYear();

export const Footer: FC = () => {
  return (
    <Layout>
      <Content>
        <Copy>
          &copy; {year} Quentez<CopySm> Corporation</CopySm>
        </Copy>
        <SayHi>Say hi!</SayHi>
        <ExternalLink href="https://discord.gg/jg9wMG9s83" target="_blank">
          <ExternalLinkIcon>
            <DiscordIcon />
          </ExternalLinkIcon>
        </ExternalLink>
        <ExternalLink href="https://github.com/baqhub/baq" target="_blank">
          <ExternalLinkIcon>
            <GithubIcon />
          </ExternalLinkIcon>
        </ExternalLink>
        <ExternalLink href="mailto:hello@baq.dev">
          <ExternalLinkIcon>
            <EnvelopeIcon />
          </ExternalLinkIcon>
        </ExternalLink>
      </Content>
    </Layout>
  );
};
