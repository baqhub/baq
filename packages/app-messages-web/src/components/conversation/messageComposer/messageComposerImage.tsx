import {HandlerOf} from "@baqhub/sdk";
import {useImageUrl} from "@baqhub/sdk-react";
import {ButtonRow} from "@baqhub/ui/core/style.js";
import {XMarkIcon} from "@heroicons/react/20/solid";
import {FC} from "react";
import tiwi from "tiwi";
import {PendingImage} from "../../../state/messageComposerState.js";

//
// Props.
//

interface MessageComposerImageProps {
  image: PendingImage;
  onRemoveClick: HandlerOf<PendingImage>;
}

//
// Style.
//

const Layout = tiwi.div`
  relative
  group

  shrink-0
  w-20
  h-16

  rounded-lg
  bg-neutral-100
  overflow-hidden
`;

const Image = tiwi.div`
  absolute
  top-0
  right-0
  bottom-0
  left-0

  bg-center
  bg-cover
`;

const RemoveButton = tiwi(ButtonRow)`
  absolute
  top-1
  right-1

  w-6
  h-6
  p-0.5

  text-white
  bg-neutral-900/40
  hover:bg-neutral-900/50
  active:bg-neutral-900/60
  rounded-full

  hidden
  group-hover:block
`;

//
// Component.
//

export const MessageComposerImage: FC<MessageComposerImageProps> = props => {
  const {image, onRemoveClick} = props;
  const isUploading = !image.image;

  const onRemoveButtonClick = () => {
    onRemoveClick(image);
  };

  return (
    <Layout>
      {image.thumbnail && (
        <ImageComponent blob={image.thumbnail} isAnimating={isUploading} />
      )}
      <RemoveButton type="button" onClick={onRemoveButtonClick}>
        <XMarkIcon />
      </RemoveButton>
    </Layout>
  );
};

interface ImageComponentProps {
  blob: Blob;
  isAnimating: boolean;
}

const ImageComponent: FC<ImageComponentProps> = props => {
  const {blob, isAnimating} = props;
  const imageUrl = useImageUrl(blob);

  return (
    <Image
      style={{backgroundImage: `url(${imageUrl})`}}
      className={isAnimating ? "animate-pulse" : undefined}
    />
  );
};
