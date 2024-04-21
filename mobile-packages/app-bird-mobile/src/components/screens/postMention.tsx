import {Link} from "expo-router";
import {FC, PropsWithChildren} from "react";
import {TouchableOpacity} from "react-native";
import {Text, tw} from "../../helpers/style";

//
// Props.
//

interface PostMentionProps extends PropsWithChildren {
  entity: string;
}

//
// Style.
//

const MentionButton = tw(TouchableOpacity)`
  -mb-[3px]
`;

const Mention = tw(Text)`
  text-lg
  font-light
  leading-7

  text-amber-700
  dark:text-amber-500
`;

//
// Component.
//

export const PostMention: FC<PostMentionProps> = props => {
  const {entity, children} = props;
  return (
    <Link
      href={{
        pathname: "../profile/[entity]",
        params: {entity},
      }}
      asChild
    >
      <MentionButton>
        <Mention numberOfLines={1}>{children}</Mention>
      </MentionButton>
    </Link>
  );
};
