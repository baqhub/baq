import {Column, Row, Text, tw} from "@baqhub/ui/core/style.jsx";
import {DiscordIcon} from "@baqhub/ui/icons/filled/discord.jsx";
import {GithubIcon} from "@baqhub/ui/icons/filled/github.jsx";
import {EnvelopeIcon} from "@heroicons/react/24/solid";
import {FC} from "react";

//
// Style.
//

const Layout = tw(Column)`
  mt-28
  py-6

  border-t
  border-zinc-200
  dark:border-zinc-700
`;

const Content = tw(Row)`
  gap-3
  items-center
`;

const Copy = tw(Text)`
  flex-1
  text-md
  text-zinc-400
  dark:text-zinc-500
`;

const CopySm = tw.span`
  hidden
  sm:inline
`;

const SayHi = tw(Text)`
  hidden
  sm:block

  text-md
  text-zinc-400
  dark:text-zinc-500
`;

// const Separator = tw(Text)`
//   after:content-['•']
//   text-md
//   text-zinc-300
//   dark:text-zinc-600
// `;

const ExternalLink = tw.a`
  shrink-0
  block
  p-0.5

  text-zinc-400
  hover:text-zinc-600
  dark:text-zinc-500
  dark:hover:text-zinc-300
`;

const ExternalLinkIcon = tw.div`
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
        <ExternalLink href="mailto:hello@quentez.com">
          <ExternalLinkIcon>
            <EnvelopeIcon />
          </ExternalLinkIcon>
        </ExternalLink>
      </Content>
    </Layout>
  );
};
