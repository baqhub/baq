"use client";

import {Column, Row} from "@baqhub/ui/core/style.jsx";
import {ArrowRightIcon, RssIcon} from "@heroicons/react/20/solid";
import {FC, FormEvent} from "react";
import tiwi from "tiwi";
import {Text} from "./style.jsx";

//
// Props.
//

type NewsletterVariant = "normal" | "wide";

interface NewsletterProps {
  variant?: NewsletterVariant;
}

//
// Style.
//

const Layout = tiwi(Column)`
  p-5
  gap-3

  sm:data-[variant=wide]:flex-row
  sm:data-[variant=wide]:gap-5
  sm:data-[variant=wide]:items-center

  border
  border-amber-500
  rounded-xl
`;

const Left = tiwi(Column)``;

const Title = tiwi(Row)`
  items-center
  gap-1.5
`;

const TitleText = tiwi(Text)`
  text-lg
  font-bold
`;

const TitleIcon = tiwi.div`
  mb-0.5
  h-6
  w-6
  text-amber-500
`;

const SubTitle = tiwi(Text)`
  mt-1
  text-sm
  text-zinc-500
  dark:text-zinc-400
`;

const Form = tiwi.form`
  group

  sm:data-[variant=wide]:w-52

  flex
  flex-row
  items-center
  px-1

  rounded-lg
  border
  border-zinc-200
  focus-within:border-amber-500
  dark:border-zinc-600
  dark:focus-within:border-amber-500
`;

const FormInput = tiwi.input`
  block
  flex-1
  w-0

  p-1.5

  caret-amber-500
  text-sm
  text-zinc-900
  dark:text-white

  placeholder:select-none
  placeholder:opacity-80
  placeholder:text-zinc-400

  bg-transparent
  outline-hidden
`;

const FormSubmit = tiwi.button`
  shrink-0
  p-0.5

  rounded-lg
  bg-amber-500/50
  group-focus-within:bg-amber-500
  hover:group-focus-within:bg-amber-600
  dark:hover:group-focus-within:bg-amber-400
`;

const FormSubmitIcon = tiwi(Text)`
  w-5
  h-5
  text-white
  dark:text-zinc-800
`;

//
// Component.
//

export const Newsletter: FC<NewsletterProps> = props => {
  const variant = props.variant || "normal";

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    window.open("https://buttondown.email/baq", "popup");

    const form = e.currentTarget;
    setTimeout(() => {
      form.reset();
    }, 100);
  };

  return (
    <Layout data-variant={variant}>
      <Left>
        <Title>
          <TitleText>Stay updated</TitleText>
          <TitleIcon>
            <RssIcon />
          </TitleIcon>
        </Title>
        <SubTitle>Subscribe to the newsletter.</SubTitle>
      </Left>
      <Form
        action="https://buttondown.email/api/emails/embed-subscribe/baq"
        method="post"
        target="popup"
        onSubmit={onSubmit}
        data-variant={variant}
      >
        <FormInput type="email" name="email" placeholder="email@host.com" />
        <FormSubmit type="submit">
          <FormSubmitIcon>
            <ArrowRightIcon />
          </FormSubmitIcon>
        </FormSubmit>
      </Form>
    </Layout>
  );
};
